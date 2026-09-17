const Stripe = require("stripe");
const { stripeSecretKey, stripeWebhookSecret } = require("./config");
const { finalizeStripeCheckoutSession } = require("./utils/stripeCheckout");

/**
 * Raw body route — must be registered before express.json().
 */
async function stripeWebhookHandler(req, res) {
  if (!stripeSecretKey || !stripeWebhookSecret) {
    return res.status(400).json({ message: "Stripe webhook not configured" });
  }
  const stripe = new Stripe(stripeSecretKey);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    try {
      await finalizeStripeCheckoutSession(event.data.object);
    } catch (e) {
      console.warn("[stripe] webhook finalize error:", e.message);
    }
  }

  return res.json({ received: true });
}

module.exports = { stripeWebhookHandler };
