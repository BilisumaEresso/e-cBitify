const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Types.ObjectId, ref: "order", required: true },
    transactionId: { type: String, required: true, unique: true },
    chapaRef: { type: String, default: null }, // Chapa's tx_ref
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Failed", "Completed", "Refunded"],
    },
    paymentMethod: { type: String, default: "Chapa" },
    amount: { type: Number, required: true, min: 0.5 },
    currency: { type: String, default: "ETB" },
  },
  { timestamps: true },
);

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
