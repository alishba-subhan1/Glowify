const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");
const { requireAdmin, requireAuth } = require("../middleware/auth");
const { jwtSecret } = require("../config");
const { normalizeEmail, isValidEmail } = require("../utils/validators");

const router = express.Router();

router.get("/admin", requireAdmin, async (req, res) => {
  const notifications = await Notification.find({
    recipientType: "admin",
    recipientId: "global"
  }).sort({ createdAt: -1 });
  return res.json(notifications);
});

router.get("/customer/:email", async (req, res) => {
  const customerEmail = normalizeEmail(req.params.email);
  if (!isValidEmail(customerEmail)) {
    return res.status(400).json({ message: "Invalid customer email" });
  }
  const notifications = await Notification.find({
    recipientType: "customer",
    recipientId: customerEmail
  }).sort({ createdAt: -1 });
  return res.json(notifications);
});

router.get("/mine", requireAuth, async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ userId: req.user.id }, { recipientType: "customer", recipientId: req.user.email }]
  }).sort({ createdAt: -1 });
  return res.json(notifications);
});

/** Admin-only: remove an in-app admin notification (same rows as GET /admin). */
router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid notification id" });
  }
  const deleted = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipientType: "admin",
    recipientId: "global"
  });
  if (!deleted) {
    return res.status(404).json({ message: "Notification not found" });
  }
  return res.json({ message: "Deleted", id: req.params.id });
});

router.patch("/:id/read", async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });

  if (notification.recipientType === "admin") {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      jwt.verify(authHeader.split(" ")[1], jwtSecret);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const payload = jwt.verify(authHeader.split(" ")[1], jwtSecret);
        const matchesEmail = payload.email && payload.email === notification.recipientId;
        const matchesUserId = payload.id && String(payload.id) === String(notification.userId || "");
        if (!matchesEmail && !matchesUserId && payload.role !== "admin") {
          return res.status(403).json({ message: "Forbidden" });
        }
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    } else {
      const email = normalizeEmail(req.body?.email);
      if (!isValidEmail(email) || email !== notification.recipientId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
  }

  notification.isRead = true;
  await notification.save();
  return res.json(notification);
});

module.exports = router;
