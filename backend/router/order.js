const express = require("express");
const isAuth = require("../middleware/isAuth");
const { orderController } = require("../controller");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.post("/", isAuth, orderController.addOrder);
router.get("/", isAuth, orderController.getAllOrders);
router.get("/seller/all", isAuth, orderController.getSellerOrders);
router.get("/seller/analytics", isAuth, orderController.getSellerAnalytics);
router.get("/:id", isAuth, orderController.getOrder);
router.patch("/status/:id", isAuth, isAdmin, orderController.updateStatus);
router.patch("/cancel/:id", isAuth, orderController.cancelOrder);

// Chapa payment routes
router.post(
  "/payment/chapa/initialize",
  isAuth,
  orderController.initiateChapaPayment,
);
router.post("/payment/chapa/callback", orderController.chapaCallback); // no auth — Chapa calls this
router.get(
  "/payment/chapa/verify/:tx_ref",
  isAuth,
  orderController.verifyChapaPayment,
);

// Legacy
router.get("/paymentInfo/:id", isAuth, orderController.paymentInfo);

module.exports = router;
