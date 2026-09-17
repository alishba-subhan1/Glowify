const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Setting = require("../models/Setting");
const User = require("../models/User");
const { requireAdmin, requireAuth } = require("../middleware/auth");
const { createNotification } = require("../utils/notifications");
const { sendBookingSmsOptional } = require("../utils/sms");
const { normalizeEmail, isValidEmail, sanitizeText, isValidDateInput } = require("../utils/validators");

const router = express.Router();

function getPagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

function normalizedSlot(token) {
  return String(token || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Case/spacing tolerant match vs admin-configured slots. */
function isSlotAllowed(bookingTime, configuredSlots) {
  const want = normalizedSlot(bookingTime);
  return configuredSlots.some((slot) => normalizedSlot(slot) === want);
}

router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      date,
      time,
      slot,
      notes,
      paymentMethod = "cash"
    } = req.body;
    const bookingTime = String(time || slot || "").trim();
    if (!customerName || !customerEmail || !customerPhone || !serviceId || !date || !bookingTime) {
      return res.status(400).json({ message: "All booking fields are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service id" });
    }
    if (!isValidEmail(customerEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    const cleanPhone = sanitizeText(customerPhone, 20);
    if (cleanPhone.length < 7) {
      return res.status(400).json({ message: "Please enter a valid phone number" });
    }
    if (!isValidDateInput(date)) {
      return res.status(400).json({ message: "Please enter a valid date" });
    }
    if (!["card", "cash", "stripe", "jazzcash"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const settings = await Setting.findOne({ key: "global" });
    const allSlots = Array.isArray(settings?.timeSlots) ? settings.timeSlots : [];
    if (allSlots.length > 0 && !isSlotAllowed(bookingTime, allSlots)) {
      return res.status(400).json({ message: "Selected slot is not available in admin schedule" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const conflict = await Booking.findOne({
      date,
      time: bookingTime,
      status: { $in: ["pending", "confirmed", "approved"] }
    });
    if (conflict) {
      return res.status(409).json({ message: "Selected time slot is already booked" });
    }

    const normalizedCustomerEmail = normalizeEmail(customerEmail);
    const linkedUser = await User.findOne({ email: normalizedCustomerEmail });

    const booking = await Booking.create({
      customerName: sanitizeText(customerName, 80),
      customerEmail: normalizedCustomerEmail,
      customerPhone: cleanPhone,
      city: sanitizeText(city || "", 50),
      userId: linkedUser?._id,
      serviceId,
      service: serviceId,
      date,
      time: sanitizeText(bookingTime, 30),
      slot: sanitizeText(bookingTime, 30),
      notes: sanitizeText(notes || "", 300),
      paymentMethod
    });

    const serviceName = service.title || service.name || "Service";
    const cleanedNotes = sanitizeText(notes || "", 300);
    const adminMessage = [
      "Someone just completed a booking on your Glowify site.",
      "",
      `Customer: ${sanitizeText(customerName, 80)}`,
      `Email: ${normalizedCustomerEmail}`,
      `Phone: ${cleanPhone}`,
      `Service: ${serviceName}`,
      `Date: ${date}`,
      `Time: ${bookingTime}`,
      `Payment method: ${paymentMethod}`,
      cleanedNotes ? `Notes: ${cleanedNotes}` : null,
      `Booking ID: ${booking._id.toString()}`,
      "",
      "Status: pending. Open Admin → Bookings to approve or reject."
    ]
      .filter(Boolean)
      .join("\n");

    await createNotification({
      recipientType: "admin",
      recipientId: "global",
      title: "New booking received",
      message: adminMessage,
      emailSubject: `Glowify: new booking — ${serviceName} on ${date}`
    });

    await createNotification({
      userId: linkedUser?._id,
      recipientType: "customer",
      recipientId: normalizedCustomerEmail,
      title: "Booking Created",
      message: `Your appointment request for ${service.title || service.name} is pending approval.`,
      emailSubject: `Glowify: Booking request received — ${service.title || service.name}`,
      emailHtml: `<div style="font-family:system-ui,sans-serif;line-height:1.55;max-width:520px">
        <p>Hi ${sanitizeText(customerName, 80)},</p>
        <p>Thank you — we received your booking for <strong>${serviceName}</strong>.</p>
        <ul style="padding-left:1.2rem;margin:0.6em 0">
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${sanitizeText(bookingTime, 30)}</li>
          <li><strong>Payment:</strong> ${paymentMethod}</li>
        </ul>
        <p>Status: <strong>Pending approval</strong>. We will notify you when the salon updates your booking.</p>
        <p style="color:#666;font-size:12px;margin-top:1.5rem">Glowify · My Beauty Parlour</p>
      </div>`
    });

    try {
      await sendBookingSmsOptional({
        phone: cleanPhone,
        message: `Glowify: Thanks! Booking request for ${serviceName} on ${date} at ${bookingTime}. Pending approval.`
      });
    } catch (smsErr) {
      console.warn("[sms] Skipped after booking:", smsErr.message);
    }

    try {
      await booking.populate("serviceId");
      await booking.populate("service");
    } catch (popErr) {
      console.warn("[bookings] populate warning:", popErr.message);
    }
    return res.status(201).json(booking);
  } catch (error) {
    console.error("[bookings] POST /", error);
    return res.status(500).json({ message: "Booking failed", error: error.message });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { userId: req.user.id };
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
    .populate("service")
    .populate("serviceId")
    .populate("paymentId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Booking.countDocuments(filter)
  ]);
  return res.json({ items: bookings, page, limit, total });
});

router.get("/customer/:email", async (req, res) => {
  const email = normalizeEmail(req.params.email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid customer email" });
  }
  const { page, limit, skip } = getPagination(req.query);
  const filter = { customerEmail: email };
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
    .populate("service")
    .populate("serviceId")
    .populate("paymentId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Booking.countDocuments(filter)
  ]);
  return res.json({ items: bookings, page, limit, total });
});

router.get("/today", requireAdmin, async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const today = new Date().toISOString().slice(0, 10);
  const filter = { date: today };
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
    .populate("service")
    .populate("serviceId")
    .populate("paymentId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Booking.countDocuments(filter)
  ]);
  return res.json({ items: bookings, page, limit, total });
});

router.get("/", requireAdmin, async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  if (req.query.email) filter.customerEmail = normalizeEmail(req.query.email);
  if (req.query.date) filter.date = String(req.query.date).trim();
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
    .populate("service")
    .populate("serviceId")
    .populate("paymentId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Booking.countDocuments(filter)
  ]);
  return res.json({ items: bookings, page, limit, total });
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const { status } = req.body;
    if (!["approved", "rejected", "pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await Booking.findById(req.params.id).populate("serviceId").populate("service");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (status === "approved" || status === "confirmed") {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        date: booking.date,
        time: booking.time || booking.slot,
        status: { $in: ["approved", "confirmed"] }
      });
      if (conflict) {
        return res.status(409).json({ message: "Slot already approved for another booking" });
      }
    }

    booking.status = status;
    await booking.save();

    await createNotification({
      userId: booking.userId,
      recipientType: "customer",
      recipientId: booking.customerEmail,
      title: "Booking Status Updated",
      message: `Your ${booking.serviceId?.title || booking.serviceId?.name || "service"} booking is now ${status}.`,
      emailSubject: `Glowify: Your booking is ${status}`
    });

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Status update failed", error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  return res.json({ message: "Booking deleted" });
});

module.exports = router;
