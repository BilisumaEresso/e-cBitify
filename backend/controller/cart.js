const { Cart, Product, User } = require("../model");

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user && (req.user._id || req.user.id);

    const isUser = await User.findById(userId);
    if (!isUser) {
      res.status(401);
      throw new Error("unauthenticated");
    }

    const productDetail = await Product.findById(productId);
    if (!productDetail) {
      res.status(404);
      throw new Error("product not found");
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    const price = Number(productDetail.price) || 0;

    const item = { product: productId, quantity: qty, price };

    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      const existingIndex = cart.items.findIndex(
        (i) => i.product.toString() === productId.toString()
      );
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += qty;
      } else {
        cart.items.push(item);
      }
      cart.totalPrice = cart.items.reduce(
        (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0
      );
      await cart.save();
      return res.status(200).json({ code: 200, status: true, message: "added to cart successfully", cart, user: isUser });
    } else {
      const newCart = new Cart();
      newCart.user = userId;
      newCart.items = [item];
      newCart.totalPrice = price * qty;
      await newCart.save();
      return res.status(201).json({ code: 201, status: true, message: "added to cart successfully", cart: newCart });
    }
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id || req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      res.status(404);
      throw new Error("cart not found");
    }

    if (!productId) {
      res.status(400);
      throw new Error("productId is required");
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.product && i.product._id.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      res.status(404);
      throw new Error("product not found in cart");
    }

    cart.items.splice(itemIndex, 1);
    cart.totalPrice = cart.items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0
    );

    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ code: 200, status: true, message: "item removed; cart is now empty", cart: null });
    }

    await cart.save();
    return res.status(200).json({ code: 200, status: true, message: "removed from cart successfully", cart });
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { newQuantity } = req.body;
    const userId = req.user._id || req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      res.status(404);
      throw new Error("cart not found");
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("product not found");
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.product && i.product._id.toString() === productId.toString()
    );
    if (itemIndex === -1) {
      res.status(404);
      throw new Error("product not found in cart");
    }

    cart.items[itemIndex].quantity = Number(newQuantity);
    cart.totalPrice = cart.items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0
    );

    await cart.save();
    return res.status(200).json({ code: 200, status: true, message: "updated cart successfully", cart });
  } catch (error) {
    next(error);
  }
};

const userCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    res.status(200).json({ code: 200, status: true, message: "cart fetched successfully", cart });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], totalPrice: 0 } },
      { new: true }
    );
    if (!cart) {
      return res.status(404).json({ code: 404, status: false, message: "Cart not found" });
    }
    res.status(200).json({ code: 200, status: true, message: "Cart cleared successfully", cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, removeFromCart, updateCart, userCart, clearCart };
