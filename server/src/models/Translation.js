const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    languageCode: { type: String, required: true, trim: true, lowercase: true },
    value: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

translationSchema.index({ key: 1, languageCode: 1 }, { unique: true });

module.exports = mongoose.model("Translation", translationSchema);
