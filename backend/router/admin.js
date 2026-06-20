const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const { adminController } = require("../controller");

router.use(isAuth, isSuperAdmin);

router.get("/dashboard", adminController.getAdminDashboard);
router.get("/users", adminController.getAllUsers);
router.get("/admins", adminController.getAllAdmins);
router.get("/orders", adminController.getAllOrders);
router.post("/admins", adminController.createAdmin);
router.post("/add-admin", adminController.createAdmin);

router.post("/users/:id/ban", adminController.banUser);
router.post("/users/:id/role", adminController.changeUserRole);
router.delete("/users/:id", adminController.deleteUser);

router.get("/analytics", adminController.getAdminAnalytics);
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

module.exports = router;
