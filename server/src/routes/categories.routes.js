const express = require("express");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const { requireAdmin } = require("../middleware/auth");
const { sanitizeText } = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  return res.json(categories);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, description = "" } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const category = await Category.create({
      name: sanitizeText(name, 80),
      description: sanitizeText(description, 300)
    });
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Category already exists" });
    return res.status(500).json({ message: "Failed to create category", error: error.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid category id" });
  }
  const updates = {};
  if (req.body.name) updates.name = sanitizeText(req.body.name, 80);
  if (req.body.description !== undefined) updates.description = sanitizeText(req.body.description, 300);
  const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json(category);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid category id" });
  }
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  return res.json({ message: "Category deleted" });
});

module.exports = router;
