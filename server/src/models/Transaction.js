const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true, index: true },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending", index: true }
  },
  { timestamps: true }
);

transactionSchema.index({ paymentId: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
