const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    time: { type: String, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "approved", "rejected"],
      default: "pending",
      index: true
    },

    // Legacy fields retained for backward compatibility with existing UI.
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    city: { type: String, default: "", trim: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    paymentMethod: { type: String, enum: ["card", "cash", "stripe", "jazzcash"], default: "cash" }
  },
  { timestamps: true }
);

bookingSchema.pre("validate", function syncBookingFields(next) {
  if (!this.serviceId && this.service) this.serviceId = this.service;
  if (!this.service && this.serviceId) this.service = this.serviceId;
  if (!this.time && this.slot) this.time = this.slot;
  if (!this.slot && this.time) this.slot = this.time;
  next();
});

bookingSchema.index({ userId: 1, date: 1, time: 1, status: 1 });
bookingSchema.index({ customerEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
