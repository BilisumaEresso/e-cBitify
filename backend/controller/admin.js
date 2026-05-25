const { User, Order, Product } = require("../model");
const hashPassword = require("../utils/hashPassword");
const { Address } = require("../model");

const getAdminDashboard = async (req, res, next) => {
  try {
    const [users, orders, products] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
    ]);
    res.json({ status: true, data: { totalUsers: users, totalOrders: orders, totalProducts: products } });
  } catch (err) {
    next(err);
  }
};

// All users (buyers + sellers + admins) — for AdminUsers page
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").populate("address");
    res.json({ status: true, users });
  } catch (err) {
    next(err);
  }
};

// Only super admins (role 3) — for AdminAdmins page
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 3 }).select("-password");
    res.json({ status: true, admins });
  } catch (err) {
    next(err);
  }
};

// Create a new super admin — matches POST /admin/add-admin from AddAdminPage
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, street, city, state, kebele, postalCode } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email and password are required");
    }

    const adminExists = await User.findOne({ email });
    if (adminExists) {
      res.status(400);
      return res.json({ status: false, message: "Email already exists" });
    }

    const hashed = await hashPassword(password);

    const address = new Address({ name, phoneNumber, street, postalCode, kebele, city, state });
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

const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    res.json({ status: true, data: { totalRevenue: totalRevenue[0]?.total || 0 } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdminDashboard, getAllUsers, getAllAdmins, createAdmin, getAdminAnalytics };
