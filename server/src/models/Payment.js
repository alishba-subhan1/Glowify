const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["card", "cash", "stripe", "jazzcash"], required: true },
    transactionId: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending", index: true }
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
