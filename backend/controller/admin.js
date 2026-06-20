const { User, Order, Product, PlatformSettings } = require("../model");
const hashPassword = require("../utils/hashPassword");
const { Address } = require("../model");

const getOrCreateSettings = async () => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  return settings;
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalSellers,
      totalAdmins,
      ordersToday,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 2 }),
      User.countDocuments({ role: 3 }),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
      User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name email createdAt"),
    ]);

    const activity = [
      ...recentOrders.map((order) => ({
        id: order._id,
        action: `Order #${String(order._id).slice(-8).toUpperCase()} — ${order.status}`,
        user: order.user?.name || "Customer",
        time: order.createdAt,
        type: "order",
        amount: order.totalAmount,
      })),
      ...recentUsers.map((u) => ({
        id: u._id,
        action: "New user registered",
        user: u.name,
        time: u.createdAt,
        type: "user",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    res.json({
      status: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalSellers,
        totalAdmins,
        ordersToday,
        recentActivity: activity,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").populate("address");
    res.json({ status: true, users });
  } catch (err) {
    next(err);
  }
};

const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 3 }).select("-password");
    res.json({ status: true, admins });
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email")
      .populate("address")
      .sort({ createdAt: -1 });
    res.json({ status: true, orders });
  } catch (err) {
    next(err);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      street,
      city,
      state,
      kebele,
      postalCode,
    } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email and password are required");
    }

    const adminExists = await User.findOne({ email });
    if (adminExists) {
      res.status(400);
      throw new Error("Email already exists");
    }

    const hashed = await hashPassword(password);

    const address = new Address({
      name,
      phoneNumber,
      street,
      postalCode,
      kebele,
      city,
      state,
    });
    await address.save();

    const admin = await User.create({
      name,
      email,
      password: hashed,
      role: 3,
      address: address._id,
    });

    res.status(201).json({
      status: true,
      message: "Admin created successfully",
      data: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    if (typeof banned !== "boolean") {
      res.status(400);
      throw new Error("banned must be a boolean");
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === 3) {
      res.status(403);
      throw new Error("Cannot ban super admins");
    }

    user.banned = banned;
    await user.save();

    res.json({
      status: true,
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
    });
  } catch (err) {
    next(err);
  }
};

const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (![1, 2].includes(role)) {
      res.status(400);
      throw new Error("Invalid role — only buyer (1) or seller (2) allowed");
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === 3) {
      res.status(403);
      throw new Error("Cannot change super admin role");
    }

    user.role = role;
    await user.save();

    res.json({
      status: true,
      message: "User role updated successfully",
      data: { role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === 3) {
      res.status(403);
      throw new Error("Cannot delete super admins");
    }

    await User.findByIdAndDelete(id);
    res.json({ status: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      revenueAgg,
      pendingOrders,
      completedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      buyers,
      sellers,
      admins,
      bannedUsers,
      allOrders,
      topProductsRaw,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["completed", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "completed" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      User.countDocuments({ role: 1 }),
      User.countDocuments({ role: 2 }),
      User.countDocuments({ role: 3 }),
      User.countDocuments({ banned: true }),
      Order.find()
        .select("status totalAmount createdAt user")
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(200),
      Product.find()
        .select("name sold price photo")
        .populate("photo")
        .sort({ sold: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const completedCount = completedOrders + deliveredOrders;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      days.push({
        start,
        end,
        label: start.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    const ordersChart = days.map((d) => ({
      label: d.label,
      value: allOrders.filter((o) => {
        const t = new Date(o.createdAt);
        return t >= d.start && t < d.end;
      }).length,
    }));

    const revenueChart = days.map((d) => ({
      label: d.label,
      value: allOrders
        .filter((o) => {
          const t = new Date(o.createdAt);
          return (
            t >= d.start &&
            t < d.end &&
            ["completed", "delivered"].includes(o.status)
          );
        })
        .reduce((s, o) => s + Number(o.totalAmount || 0), 0),
    }));

    const recentOrders = allOrders.slice(0, 8).map((o) => ({
      _id: o._id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      customer: o.user?.name || "Customer",
    }));

    const topProducts = topProductsRaw.map((p) => ({
      _id: p._id,
      name: p.name,
      sold: p.sold || 0,
      price: p.price,
      revenue: Number(p.sold || 0) * Number(p.price || 0),
      photo: p.photo?.[0]?.signedUrl,
    }));

    res.json({
      status: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        pendingOrders,
        completedOrders: completedCount,
        shippedOrders,
        cancelledOrders,
        buyers,
        sellers,
        admins,
        bannedUsers,
        ordersChart,
        revenueChart,
        topProducts,
        recentOrders,
        avgOrderValue: completedCount
          ? Number((totalRevenue / completedCount).toFixed(2))
          : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ status: true, settings });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const allowed = [
      "maintenanceMode",
      "currency",
      "timezone",
      "emailAlerts",
      "orderNotifications",
      "userRegistrationAlerts",
      "systemAlerts",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    }
    await settings.save();
    res.json({ status: true, message: "Settings saved", settings });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers,
  getAllAdmins,
  getAllOrders,
  createAdmin,
  getAdminAnalytics,
  banUser,
  changeUserRole,
  deleteUser,
  getSettings,
  updateSettings,
};
