const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Setting = require("../models/Setting");
const { requireAdmin } = require("../middleware/auth");
const { chatbotReply, welcomeMessage } = require("../utils/chatbot");
const { normalizeEmail, isValidEmail, sanitizeText } = require("../utils/validators");

const router = express.Router();

function databaseIsReady() {
  return mongoose.connection.readyState === 1;
}

router.get("/admin/conversations/list", requireAdmin, async (req, res) => {
  const conversations = await Message.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$customerEmail",
        lastMessage: { $first: "$text" },
        lastSender: { $first: "$sender" },
        updatedAt: { $first: "$createdAt" }
      }
    },
    { $sort: { updatedAt: -1 } }
  ]);
  return res.json(conversations);
});

router.post("/customer", async (req, res) => {
  try {
    const { customerEmail, text } = req.body;
    if (!customerEmail || !text) {
      return res.status(400).json({ message: "customerEmail and text are required" });
    }

    const normalizedEmail = normalizeEmail(customerEmail);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid customer email" });
    }
    const cleanText = sanitizeText(text, 1000);
    if (cleanText.length < 1) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (!databaseIsReady()) {
      const now = new Date().toISOString();
      return res.status(201).json({
        customerMessage: { _id: `temporary-customer-${Date.now()}`, customerEmail: normalizedEmail, sender: "customer", text: cleanText, createdAt: now },
        autoReply: { _id: `temporary-bot-${Date.now()}`, customerEmail: normalizedEmail, sender: "bot", text: chatbotReply(cleanText), createdAt: now },
        persisted: false
      });
    }
    const customerMessage = await Message.create({
      customerEmail: normalizedEmail,
      sender: "customer",
      text: cleanText
    });

    const settings = await Setting.findOne({ key: "global" });
    let autoReply = null;
    if (!settings?.adminOnline) {
      autoReply = await Message.create({
        customerEmail: normalizedEmail,
        sender: "bot",
        text: chatbotReply(cleanText)
      });
    }

    return res.status(201).json({ customerMessage, autoReply });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send message", error: error.message });
  }
});

router.post("/admin", requireAdmin, async (req, res) => {
  try {
    const { customerEmail, text } = req.body;
    if (!customerEmail || !text) {
      return res.status(400).json({ message: "customerEmail and text are required" });
    }
    const normalizedEmail = normalizeEmail(customerEmail);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid customer email" });
    }
    const cleanText = sanitizeText(text, 1000);
    if (cleanText.length < 1) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    const message = await Message.create({
      customerEmail: normalizedEmail,
      sender: "admin",
      text: cleanText
    });
    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: "Failed to send admin message", error: error.message });
  }
});

/** First-time bot greeting for this customer email when chat opens. */
router.post("/welcome", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.customerEmail);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid customer email" });
    }
    if (!databaseIsReady()) {
      return res.status(201).json({
        duplicated: false,
        skipped: false,
        persisted: false,
        messages: [{
          _id: `temporary-welcome-${Date.now()}`,
          customerEmail: normalizedEmail,
          sender: "bot",
          text: welcomeMessage(false),
          createdAt: new Date().toISOString()
        }]
      });
    }
    const existingCount = await Message.countDocuments({ customerEmail: normalizedEmail });
    if (existingCount > 0) {
      const messages = await Message.find({ customerEmail: normalizedEmail }).sort({ createdAt: 1 });
      return res.json({ duplicated: false, skipped: true, messages });
    }
    const settings = await Setting.findOne({ key: "global" });
    const text = welcomeMessage(Boolean(settings?.adminOnline));
    await Message.create({ customerEmail: normalizedEmail, sender: "bot", text });
    const messages = await Message.find({ customerEmail: normalizedEmail }).sort({ createdAt: 1 });
    return res.status(201).json({ duplicated: false, skipped: false, messages });
  } catch (error) {
    return res.status(500).json({ message: "Welcome message failed", error: error.message });
  }
});

router.get("/:customerEmail", async (req, res) => {
  const customerEmail = normalizeEmail(req.params.customerEmail);
  if (!isValidEmail(customerEmail)) {
    return res.status(400).json({ message: "Invalid customer email" });
  }
  if (!databaseIsReady()) return res.json([]);
  const messages = await Message.find({ customerEmail }).sort({ createdAt: 1 });
  return res.json(messages);
});

module.exports = router;
