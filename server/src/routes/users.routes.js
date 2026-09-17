const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { isValidEmail, normalizeEmail, sanitizeText } = require("../utils/validators");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
});

router.get("/", requireAdmin, async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return res.json(users);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone = "", role = "user", profileImage = "" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (!["admin", "user"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email already exists" });
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: sanitizeText(name, 80),
      email: normalizedEmail,
      password: passwordHash,
      phone: sanitizeText(phone, 20),
      role,
      profileImage: sanitizeText(profileImage, 500)
    });
    return res.status(201).json({ ...user.toObject(), password: undefined });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user", error: error.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const updates = {};
    if (req.body.name) updates.name = sanitizeText(req.body.name, 80);
    if (req.body.phone !== undefined) updates.phone = sanitizeText(req.body.phone, 20);
    if (req.body.profileImage !== undefined) updates.profileImage = sanitizeText(req.body.profileImage, 500);
    if (req.body.role) {
      if (!["admin", "user"].includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
      updates.role = req.body.role;
    }
    if (req.body.email) {
      if (!isValidEmail(req.body.email)) return res.status(400).json({ message: "Invalid email" });
      updates.email = normalizeEmail(req.body.email);
    }
    if (req.body.password) {
      if (String(req.body.password).length < 6) return res.status(400).json({ message: "Password too short" });
      updates.password = await bcrypt.hash(String(req.body.password), 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user", error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "User not found" });
  return res.json({ message: "User deleted" });
});

module.exports = router;
