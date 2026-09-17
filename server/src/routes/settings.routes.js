const express = require("express");
const Setting = require("../models/Setting");
const { requireAdmin } = require("../middleware/auth");
const { normalizeEmail, isValidEmail } = require("../utils/validators");

const router = express.Router();

router.get("/", async (req, res) => {
  const settings = await Setting.findOne({ key: "global" });
  return res.json(settings);
});

router.patch("/", requireAdmin, async (req, res) => {
  const updates = {};
  if (typeof req.body.adminOnline === "boolean") updates.adminOnline = req.body.adminOnline;
  if (req.body.adminNotificationEmail !== undefined) {
    const raw = String(req.body.adminNotificationEmail || "").trim();
    if (raw === "") {
      updates.adminNotificationEmail = "";
    } else {
      const ne = normalizeEmail(raw);
      if (!isValidEmail(ne)) {
        return res.status(400).json({ message: "Invalid notification email" });
      }
      updates.adminNotificationEmail = ne;
    }
  }
  if (req.body.siteName !== undefined) updates.siteName = String(req.body.siteName || "").trim().slice(0, 120);
  if (req.body.logo !== undefined) updates.logo = String(req.body.logo || "").trim().slice(0, 500);
  if (req.body.currency !== undefined) updates.currency = String(req.body.currency || "").trim().slice(0, 10);
  if (Array.isArray(req.body.languageOptions)) {
    const cleanLangs = req.body.languageOptions
      .map((lang) => String(lang).trim().toLowerCase())
      .filter(Boolean);
    if (cleanLangs.length > 0) updates.languageOptions = [...new Set(cleanLangs)];
  }
  if (Array.isArray(req.body.timeSlots)) {
    const cleanedSlots = req.body.timeSlots
      .map((slot) => String(slot).trim())
      .filter(Boolean);
    const uniqueSlots = [...new Set(cleanedSlots)];
    if (uniqueSlots.length === 0) {
      return res.status(400).json({ message: "At least one time slot is required" });
    }
    updates.timeSlots = uniqueSlots;
  }

  const settings = await Setting.findOneAndUpdate(
    { key: "global" },
    { $set: updates },
    { new: true, upsert: true }
  );
  return res.json(settings);
});

module.exports = router;
