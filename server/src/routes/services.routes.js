const express = require("express");
const mongoose = require("mongoose");
const Service = require("../models/Service");
const Category = require("../models/Category");
const { requireAdmin } = require("../middleware/auth");
const { sanitizeText, isPositiveNumber } = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  const services = await Service.find({ isActive: true }).populate("categoryId").sort({ createdAt: -1 });
  return res.json(services);
});

router.get("/all", requireAdmin, async (req, res) => {
  const services = await Service.find().populate("categoryId").sort({ createdAt: -1 });
  return res.json(services);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, title, category, categoryId, description, durationMinutes, duration, price, image } = req.body;
    const resolvedTitle = title || name;
    const resolvedDuration = duration || durationMinutes;
    if (!resolvedTitle || !description || !resolvedDuration || !price) {
      return res.status(400).json({ message: "All service fields are required" });
    }
    if (!isPositiveNumber(resolvedDuration) || !isPositiveNumber(price)) {
      return res.status(400).json({ message: "Duration and price must be positive numbers" });
    }
    let resolvedCategoryId = undefined;
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      const foundCategory = await Category.findById(categoryId);
      if (!foundCategory) return res.status(404).json({ message: "Category not found" });
      resolvedCategoryId = foundCategory._id;
    }
    const service = await Service.create({
      title: sanitizeText(resolvedTitle, 80),
      name: sanitizeText(resolvedTitle, 80),
      category: sanitizeText(category || "General", 40),
      categoryId: resolvedCategoryId,
      description: sanitizeText(description, 500),
      duration: Number(resolvedDuration),
      durationMinutes: Number(resolvedDuration),
      price: Number(price),
      image: sanitizeText(image || "", 500)
    });
    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create service", error: error.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid service id" });
    }
    const updates = { ...req.body };
    if (updates.name || updates.title) {
      const nextTitle = updates.title || updates.name;
      updates.title = sanitizeText(nextTitle, 80);
      updates.name = sanitizeText(nextTitle, 80);
    }
    if (updates.category) updates.category = sanitizeText(updates.category, 40);
    if (updates.description) updates.description = sanitizeText(updates.description, 500);
    if (updates.categoryId !== undefined) {
      if (updates.categoryId && !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
    }
    const requestedDuration = updates.duration ?? updates.durationMinutes;
    if (requestedDuration !== undefined) {
      if (!isPositiveNumber(requestedDuration)) {
        return res.status(400).json({ message: "Duration must be a positive number" });
      }
      updates.duration = Number(requestedDuration);
      updates.durationMinutes = Number(requestedDuration);
    }
    if (updates.price !== undefined) {
      if (!isPositiveNumber(updates.price)) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
      updates.price = Number(updates.price);
    }
    if (updates.image !== undefined) updates.image = sanitizeText(updates.image, 500);
    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!service) return res.status(404).json({ message: "Service not found" });
    return res.json(service);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update service", error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid service id" });
    }
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    return res.json({ message: "Service deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete service", error: error.message });
  }
});

module.exports = router;
