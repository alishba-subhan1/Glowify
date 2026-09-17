const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, index: true },
    duration: { type: Number, required: true, min: 15 },
    durationMinutes: { type: Number, min: 15 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    category: { type: String, default: "General", trim: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

serviceSchema.pre("validate", function syncLegacyFields(next) {
  if (!this.title && this.name) this.title = this.name;
  if (!this.name && this.title) this.name = this.title;
  if (!this.duration && this.durationMinutes) this.duration = this.durationMinutes;
  if (!this.durationMinutes && this.duration) this.durationMinutes = this.duration;
  next();
});

serviceSchema.index({ title: 1, isActive: 1 });

module.exports = mongoose.model("Service", serviceSchema);
