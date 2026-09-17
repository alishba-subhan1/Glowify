const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    siteName: { type: String, default: "Glowify Parlour" },
    logo: { type: String, default: "" },
    languageOptions: { type: [String], default: ["en"] },
    currency: { type: String, default: "PKR" },
    adminOnline: { type: Boolean, default: false },
    /** Shown in admin UI; email alerts go here when SMTP is configured. */
    adminNotificationEmail: { type: String, default: "", trim: true, lowercase: true },
    timeSlots: {
      type: [String],
      default: ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
