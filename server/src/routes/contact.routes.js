const express = require("express");
const { normalizeEmail, isValidEmail, sanitizeText } = require("../utils/validators");
const { createNotification } = require("../utils/notifications");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone = "", address = "", message } = req.body;   if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    const cleanName = sanitizeText(name, 100);
    const cleanPhone = sanitizeText(phone, 30);
    const cleanAddress = sanitizeText(address, 100);
    const cleanMessage = sanitizeText(message, 2000);
    if (!cleanName || cleanMessage.length < 3) {
      return res.status(400).json({ message: "Please write a short enquiry message" });
    }

    await createNotification({
      recipientType: "admin",
      recipientId: "global",
      title: "Contact / enquiry form",
      message: `${cleanName} <${normalizedEmail}>${cleanPhone ? ` tel: ${cleanPhone}` : ""}${cleanAddress ? `\nAddress: ${cleanAddress}` : ""}\n\n${cleanMessage}`    });

    return res.status(201).json({ message: "Thank you — we received your enquiry and will get back soon." });
  } catch (error) {
    return res.status(500).json({ message: "Could not send enquiry", error: error.message });
  }
});

module.exports = router;
