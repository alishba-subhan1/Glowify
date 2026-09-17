const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    sender: { type: String, enum: ["customer", "admin", "bot"], required: true },
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

messageSchema.index({ customerEmail: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
