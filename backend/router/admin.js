const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const { adminController } = require("../controller");

// All admin routes require authentication + super admin role
router.use(isAuth, isSuperAdmin);

// Dashboard
router.get("/dashboard", adminController.getAdminDashboard);

// Users & admins
router.get("/users",      adminController.getAllUsers);
router.get("/admins",     adminController.getAllAdmins);
router.post("/admins",    adminController.createAdmin);
router.post("/add-admin", adminController.createAdmin); // alias used by AddAdminPage

// Analytics
router.get("/analytics",  adminController.getAdminAnalytics);

module.exports = router;
