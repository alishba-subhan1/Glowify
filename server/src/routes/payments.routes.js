const express = require("express");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Transaction = require("../models/Transaction");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  createStripeCheckoutSession,
  completeStripeSessionById
} = require("../utils/stripeCheckout");
const { normalizeEmail } = require("../utils/validators");

const router = express.Router();

function getPagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

router.post("/checkout", async (req, res) => {
  try {
    const { bookingId, paymentMethod = "cash", card = {}, customerEmail = "" } = req.body;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    if (!["card", "cash", "jazzcash"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method for this endpoint (use Stripe Checkout for stripe)" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const normalizedRequestEmail = String(customerEmail || "").trim().toLowerCase();
    const canProceed =
      normalizedRequestEmail &&
      normalizedRequestEmail === String(booking.customerEmail || "").trim().toLowerCase();
    if (!canProceed) {
      return res.status(403).json({ message: "Booking ownership check failed" });
    }

    const service = await Service.findById(booking.serviceId || booking.service);
    if (!service) return res.status(404).json({ message: "Service not found for booking" });

    const existingPayment = await Payment.findOne({ bookingId: booking._id });
    if (existingPayment) return res.json(existingPayment);

    if (paymentMethod === "jazzcash") {
      const payment = await Payment.create({
        userId: booking.userId,
        bookingId: booking._id,
        amount: Number(service.price || 0),
        paymentMethod: "jazzcash",
        transactionId: `jazzcash_pending_${Date.now()}`,
        status: "pending"
      });
      await Transaction.create({
        paymentId: payment._id,
        gatewayResponse: {
          provider: "jazzcash-placeholder",
          note: "Merchant MPIN/secure hash integration pending — see Jazz Commerce API"
        },
        status: "pending"
      });
      booking.paymentId = payment._id;
      booking.paymentMethod = "jazzcash";
      await booking.save();
      return res.status(201).json(payment);
    }

    const isCardApproved =
      paymentMethod === "cash" ||
      (String(card.number || "").replace(/\s+/g, "").length >= 12 &&
        String(card.name || "").trim().length > 1 &&
        String(card.expiry || "").trim().length >= 4 &&
        String(card.cvc || "").trim().length >= 3);

    const payment = await Payment.create({
      userId: booking.userId,
      bookingId: booking._id,
      amount: Number(service.price || 0),
      paymentMethod,
      transactionId: `txn_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      status: isCardApproved ? "success" : "failed"
    });

    await Transaction.create({
      paymentId: payment._id,
      gatewayResponse: {
        provider: paymentMethod === "card" ? "mock-card-gateway" : "cash-on-service",
        maskedCard: paymentMethod === "card" ? String(card.number || "").slice(-4).padStart(4, "*") : null
      },
      status: payment.status
    });

    booking.paymentId = payment._id;
    booking.paymentMethod = paymentMethod;
    if (payment.status === "success" && booking.status === "pending") booking.status = "confirmed";
    await booking.save();

    return res.status(201).json(payment);
  } catch (error) {
    return res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

router.post("/stripe/create-checkout-session", async (req, res) => {
  try {
    const { bookingId, customerEmail, clientOrigin } = req.body;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const normalized = normalizeEmail(String(customerEmail || ""));
    if (
      !normalized ||
      normalized !== String(booking.customerEmail || "").trim().toLowerCase()
    ) {
      return res.status(403).json({ message: "Booking ownership check failed" });
    }
    const out = await createStripeCheckoutSession({
      booking,
      customerEmail: normalized,
      clientOrigin: String(clientOrigin || "").trim()
    });
    return res.json(out);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || "Stripe session failed" });
  }
});

router.get("/stripe/complete", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ message: "session_id required" });
    const result = await completeStripeSessionById(String(sessionId));
    if (!result.ok) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || "Stripe complete failed" });
  }
});

router.post("/jazzcash/init", (_req, res) => {
  return res.status(501).json({
    message:
      "JazzCash is not fully integrated. Add merchant configuration (MSISDN, password hashing, return URL) per Jazz Commerce / Mobile Account docs, then complete payment server-side.",
    hint: "See Jazz sandbox documentation and map responses to POST /api/payments/checkout with method jazzcash."
  });
});

router.get("/mine", requireAuth, async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { userId: req.user.id };
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  const [payments, total] = await Promise.all([
    Payment.find(filter)
    .populate("bookingId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Payment.countDocuments(filter)
  ]);
  return res.json({ items: payments, page, limit, total });
});

router.get("/", requireAdmin, async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status).trim().toLowerCase();
  if (req.query.method) filter.paymentMethod = String(req.query.method).trim().toLowerCase();
  const [payments, total] = await Promise.all([
    Payment.find(filter)
    .populate("bookingId")
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Payment.countDocuments(filter)
  ]);
  return res.json({ items: payments, page, limit, total });
});

module.exports = router;
