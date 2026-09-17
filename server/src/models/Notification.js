const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    recipientType: { type: String, enum: ["admin", "customer"], required: true },
    recipientId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.pre("validate", function syncRecipients(next) {
  if (this.userId && !this.recipientId) {
    this.recipientType = "customer";
    this.recipientId = this.userId.toString();
  }
  next();
});

notificationSchema.index({ recipientType: 1, recipientId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
