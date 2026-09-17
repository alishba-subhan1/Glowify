const express = require("express");
const mongoose = require("mongoose");
const Translation = require("../models/Translation");
const { requireAdmin } = require("../middleware/auth");
const { sanitizeText } = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  const { languageCode } = req.query;
  const filter = languageCode ? { languageCode: String(languageCode).toLowerCase() } : {};
  const rows = await Translation.find(filter).sort({ key: 1, languageCode: 1 });
  return res.json(rows);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { key, languageCode, value } = req.body;
    if (!key || !languageCode || !value) {
      return res.status(400).json({ message: "key, languageCode and value are required" });
    }
    const translation = await Translation.findOneAndUpdate(
      { key: sanitizeText(key, 200), languageCode: sanitizeText(languageCode, 10).toLowerCase() },
      { $set: { value: sanitizeText(value, 5000) } },
      { new: true, upsert: true }
    );
    return res.status(201).json(translation);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save translation", error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid translation id" });
  }
  const deleted = await Translation.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Translation not found" });
  return res.json({ message: "Translation deleted" });
});

module.exports = router;
