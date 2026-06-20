const { User, Order, Cart, Product, Payment, Address } = require("../model");
const generateTransactionId = require("../utils/generateTransactionId");
const axios = require("axios");
const { chapaSecretKey, frontendUrl } = require("../config/keys");

const CHAPA_API = "https://api.chapa.co/v1";

const getAllOrders = async (req, res, next) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      res.status(401);
      throw new Error("unauthenticated");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("user not found");
    }

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .populate("user", "name email")
      .populate("address");

    res
      .status(200)
      .json({
        code: 200,
        status: true,
        message: "orders fetched successfully",
        orders,
      });
  } catch (error) {
    next(error);
  }
};

const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user._id || req.user.id;

    // Find every product this seller owns
    const sellerProductIds = await Product.find({ createdBy: sellerId }).distinct("_id");

    if (sellerProductIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "no products listed yet",
        orders: [],
      });
    }

    // Find orders containing at least one of those products
    const orders = await Order.find({ "items.product": { $in: sellerProductIds } })
      .populate("items.product")
      .populate("user", "name email")
      .populate("address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "seller orders fetched successfully",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const addOrder = async (req, res, next) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      res.status(401);
      throw new Error("unauthenticated");
    }

    const bodyAddress = req.body?.address || null;
    let phoneNumber = req.body?.phoneNumber || null;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      res.status(404);
      throw new Error("cart not found");
    }
    if (!cart.items || cart.items.length === 0) {
      res.status(400);
      throw new Error("cart is empty");
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      const product = item.product;
      if (!product) throw new Error("invalid product in cart");
      const quantity = Number(item.quantity) || 1;
      if (product.quantity < quantity) {
        res.status(400);
        throw new Error(`not enough stock for product: ${product.name}`);
      }
      const price = Number(product.price);
      totalAmount += price * quantity;
      item._calculatedPrice = price;
    }

    let addressId = null;
    if (!bodyAddress || Object.keys(bodyAddress).length === 0) {
      const user = await User.findById(userId);
      if (!user.address) {
        res.status(400);
        throw new Error("no default address found");
      }
      addressId = user.address;
    } else {
      const newAddress = new Address(bodyAddress);
      if (bodyAddress.phoneNumber && !phoneNumber)
        phoneNumber = bodyAddress.phoneNumber;
      await newAddress.save();
      addressId = newAddress._id;
    }

    const orderItems = cart.items.map((item) => {
      const quantity = Number(item.quantity) || 1;
      const price = item._calculatedPrice;
      return {
        product: item.product._id,
        quantity,
        price,
        totalItemPrice: price * quantity,
      };
    });

    const order = await Order.create({
      user: userId,
      phoneNumber: phoneNumber || undefined,
      items: orderItems,
      totalAmount,
      address: addressId,
      cart: cart._id,
      status: "pending",
      paymentStatus: "unpaid",
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            quantity: -Number(item.quantity),
            sold: Number(item.quantity),
          },
        },
        { new: true },
      );
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    const address = await Address.findById(addressId);
    res
      .status(201)
      .json({
        code: 201,
        status: true,
        message: "order placed successfully",
        order,
        address,
      });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const order = await Order.findById(id)
      .populate("items.product")
      .populate("address");
    if (!order) {
      res.status(404);
      throw new Error("order not found");
    }
    if (String(order.user) !== String(userId)) {
      res.status(403);
      throw new Error("not permitted");
    }
    res
      .status(200)
      .json({
        code: 200,
        status: true,
        message: "order fetched successfully",
        order,
      });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) {
      res.status(404);
      throw new Error("order not found");
    }
    order.status = status;
    await order.save();
    res
      .status(200)
      .json({
        code: 200,
        status: true,
        message: "status updated successfully",
        order,
      });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      res.status(404);
      throw new Error("order not found");
    }
    if (order.status !== "pending" && order.status !== "confirmed") {
      res.status(400);
      throw new Error("order cannot be cancelled at this stage");
    }
    order.status = "cancelled";
    await order.save();
    res
      .status(200)
      .json({
        code: 200,
        status: true,
        message: "order cancelled successfully",
        order,
      });
  } catch (error) {
    next(error);
  }
};

// ─── Chapa: initialize payment ────────────────────────────────────────────────
const initiateChapaPayment = async (req, res, next) => {
  try {
    const { id: orderId } = req.body;
    if (!orderId) {
      res.status(400);
      throw new Error("order id is required");
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      res.status(404);
      throw new Error("order not found");
    }

    // Generate unique tx_ref
    let txRef;
    let exists;
    do {
      txRef = await generateTransactionId(16);
      exists = await Payment.findOne({ chapaRef: txRef });
    } while (exists);

    // Create a pending payment record
    const payment = await Payment.create({
      order: order._id,
      transactionId: txRef,
      chapaRef: txRef,
      status: "Pending",
      paymentMethod: "Chapa",
      amount: Number(order.totalAmount),
      currency: "ETB",
    });

    // Call Chapa initialize API
    const chapaPayload = {
      amount: String(order.totalAmount),
      currency: "ETB",
      email: order.user?.email || "customer@example.com",
      first_name: order.user?.name?.split(" ")[0] || "Customer",
      last_name: order.user?.name?.split(" ").slice(1).join(" ") || "User",
      tx_ref: txRef,
      callback_url: `${process.env.BACKEND_URL || "http://localhost:8000"}/api/v1/order/payment/chapa/callback`,
      return_url: `${frontendUrl}/order-confirmation?tx_ref=${txRef}`,
      customization: {
        title: "Order Payment",
        description: `Payment for order #${String(order._id).slice(-8).toUpperCase()}`,
      },
    };

    const chapaRes = await axios.post(
      `${CHAPA_API}/transaction/initialize`,
      chapaPayload,
      {
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (chapaRes.data.status !== "success") {
      res.status(502);
      throw new Error("Chapa initialization failed");
    }

    res.status(200).json({
      code: 200,
      status: true,
      message: "payment initialized",
      checkout_url: chapaRes.data.data.checkout_url,
      tx_ref: txRef,
      payment_id: payment._id,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Chapa: webhook callback (called by Chapa server) ─────────────────────────
const chapaCallback = async (req, res, next) => {
  try {
    const { tx_ref } = req.body;
    if (!tx_ref) {
      res.status(400);
      throw new Error("tx_ref is required");
    }

    // Verify with Chapa
    const verifyRes = await axios.get(
      `${CHAPA_API}/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${chapaSecretKey}` },
      },
    );

    const chapaStatus = verifyRes.data?.data?.status;

    const payment = await Payment.findOne({ chapaRef: tx_ref });
    if (!payment) {
      res.status(404);
      throw new Error("payment record not found");
    }

    if (chapaStatus === "success") {
      payment.status = "Completed";
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order) {
        order.status = "confirmed";
        order.paymentStatus = "paid";
        await order.save();
      }
    } else {
      payment.status = "Failed";
      await payment.save();
    }

    res.status(200).json({ status: true, message: "callback processed" });
  } catch (error) {
    next(error);
  }
};

// ─── Chapa: verify from frontend (called after redirect) ──────────────────────
const verifyChapaPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.params;
    if (!tx_ref) {
      res.status(400);
      throw new Error("tx_ref is required");
    }

    // Check our DB first
    const payment = await Payment.findOne({ chapaRef: tx_ref }).populate(
      "order",
    );
    if (!payment) {
      res.status(404);
      throw new Error("payment not found");
    }

    // Also verify live with Chapa
    const verifyRes = await axios.get(
      `${CHAPA_API}/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${chapaSecretKey}` },
      },
    );

    const chapaStatus = verifyRes.data?.data?.status;

    if (chapaStatus === "success" && payment.status !== "Completed") {
      payment.status = "Completed";
      await payment.save();

      const order = await Order.findById(payment.order._id || payment.order);
      if (order) {
        order.status = "confirmed";
        order.paymentStatus = "paid";
        await order.save();
      }
    }

    const order = await Order.findById(payment.order._id || payment.order)
      .populate("items.product")
      .populate("address");

    res.status(200).json({
      code: 200,
      status: true,
      message: "payment verified",
      payment,
      order,
      chapaStatus,
    });
  } catch (error) {
    next(error);
  }
};

const paymentInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate("order");
    if (!payment) {
      res.status(404);
      throw new Error("payment info not found");
    }
    res
      .status(200)
      .json({
        code: 200,
        status: true,
        message: "payment info fetched successfully",
        payment,
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  addOrder,
  getOrder,
  updateStatus,
  cancelOrder,
  initiateChapaPayment,
  chapaCallback,
  verifyChapaPayment,
  paymentInfo,
  getSellerOrders,
};
