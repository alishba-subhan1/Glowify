const mongoose = require("mongoose");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Transaction = require("../models/Transaction");
const {
  stripeSecretKey,
  stripeCurrency,
  clientPublicUrl
} = require("../config");
const { normalizeEmail } = require("./validators");

function getStripe() {
  if (!stripeSecretKey) return null;
  return new Stripe(stripeSecretKey);
}

/**
 * After Stripe Checkout succeeds (redirect or webhook), create/update Payment and Booking.
 */
async function finalizeStripeCheckoutSession(session) {
  const bookingId = session.metadata && session.metadata.bookingId;
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    console.warn("[stripe] session missing valid bookingId in metadata");
    return null;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.warn("[stripe] booking not found", bookingId);
    return null;
  }

  if (session.payment_status && session.payment_status !== "paid") {
    console.warn("[stripe] session not paid:", session.payment_status);
    return null;
  }

  const service = await Service.findById(booking.serviceId || booking.service);
  const amount = Number(service?.price || 0);
  const pi = session.payment_intent;
  const txId =
    typeof pi === "string" ? pi : (pi && pi.id) ? pi.id : String(session.id || "");

  let payment = await Payment.findOne({ bookingId: booking._id });
  if (payment && payment.status === "success" && payment.paymentMethod === "stripe") {
    return payment;
  }

  if (payment) {
    payment.status = "success";
    payment.paymentMethod = "stripe";
    payment.transactionId = txId || payment.transactionId;
    payment.amount = amount || payment.amount;
    await payment.save();
  } else {
    payment = await Payment.create({
      userId: booking.userId,
      bookingId: booking._id,
      amount,
      paymentMethod: "stripe",
      transactionId: txId || `stripe_${session.id}`,
      status: "success"
    });
  }

  const existingTx = await Transaction.findOne({ paymentId: payment._id });
  if (!existingTx) {
    await Transaction.create({
      paymentId: payment._id,
      gatewayResponse: {
        provider: "stripe-checkout",
        sessionId: session.id,
        currency: session.currency
      },
      status: "success"
    });
  }

  booking.paymentId = payment._id;
  booking.paymentMethod = "stripe";
  if (booking.status === "pending") booking.status = "confirmed";
  await booking.save();

  return payment;
}

/**
 * @param {{ booking: object, customerEmail: string, clientOrigin?: string }}
 */
async function createStripeCheckoutSession({ booking, customerEmail, clientOrigin }) {
  const stripe = getStripe();
  if (!stripe) {
    const err = new Error("Stripe is not configured (set STRIPE_SECRET_KEY)");
    err.status = 503;
    throw err;
  }

  const normalized = normalizeEmail(String(customerEmail || ""));
  if (String(booking.customerEmail || "").trim().toLowerCase() !== normalized) {
    const err = new Error("Email does not match booking");
    err.status = 403;
    throw err;
  }

  const existing = await Payment.findOne({ bookingId: booking._id });
  if (existing && existing.status === "success") {
    const err = new Error("Payment already recorded for this booking");
    err.status = 409;
    throw err;
  }

  const service = await Service.findById(booking.serviceId || booking.service);
  if (!service) {
    const err = new Error("Service not found");
    err.status = 404;
    throw err;
  }

  const serviceName = (service.title || service.name || "Glowify service").slice(0, 120);
  const unitAmount = Math.round(Number(service.price || 0) * 100);
  if (!Number.isFinite(unitAmount) || unitAmount < 50) {
    const err = new Error("Service price must be at least 0.50 in your Stripe currency units");
    err.status = 400;
    throw err;
  }

  const origin = String(clientOrigin || clientPublicUrl || "http://localhost:5173").replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: normalized,
    client_reference_id: booking._id.toString(),
    metadata: { bookingId: booking._id.toString() },
    success_url: `${origin}/book/payment-return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book?payment=cancelled`,
    line_items: [
      {
        price_data: {
          currency: stripeCurrency,
          unit_amount: unitAmount,
          product_data: { name: serviceName }
        },
        quantity: 1
      }
    ]
  });

  return { url: session.url, sessionId: session.id };
}

async function completeStripeSessionById(sessionId) {
  const stripe = getStripe();
  if (!stripe) {
    const err = new Error("Stripe is not configured");
    err.status = 503;
    throw err;
  }
  const session = await stripe.checkout.sessions.retrieve(String(sessionId || ""));
  if (session.payment_status !== "paid") {
    return { ok: false, message: "Payment not completed yet" };
  }
  const payment = await finalizeStripeCheckoutSession(session);
  return { ok: true, payment };
}

module.exports = {
  getStripe,
  finalizeStripeCheckoutSession,
  createStripeCheckoutSession,
  completeStripeSessionById
};
