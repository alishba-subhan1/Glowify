const dotenv = require("dotenv");

dotenv.config();

/** Gmail app passwords are 16 letters/digits; paste sometimes includes quotes or hidden chars. */
function normalizeGmailAppPassword(host, pass) {
  const t = String(pass || "").trim();
  if (!String(host || "").toLowerCase().includes("gmail")) return t;
  const alnum = t.replace(/[^a-zA-Z0-9]/g, "");
  return alnum.length === 16 ? alnum : t;
}

/** Dotenv sometimes leaves wrapping quotes in values — breaks mail From headers. */
function stripEnvQuotes(value) {
  const s = String(value || "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/glowify",
  corsOrigins: [process.env.CLIENT_URL, ...(process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174").split(",")]
    .map((origin) => String(origin || "").trim())
    .filter(Boolean)
    .filter((origin, index, origins) => origins.indexOf(origin) === index),
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  defaultAdminEmail: process.env.ADMIN_EMAIL || "admin@glowify.com",
  defaultAdminPassword: process.env.ADMIN_PASSWORD || "admin123",
  /** Where admin alert emails are sent (defaults to admin login email). */
  adminAlertEmail: (process.env.ADMIN_ALERT_EMAIL || process.env.ADMIN_EMAIL || "admin@glowify.com")
    .trim()
    .toLowerCase(),
  smtpHost: (process.env.SMTP_HOST || "").trim(),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  smtpUser: (process.env.SMTP_USER || "").trim(),
  smtpPass: normalizeGmailAppPassword(process.env.SMTP_HOST, process.env.SMTP_PASS),
  smtpFrom: stripEnvQuotes(process.env.SMTP_FROM || ""),

  /** Public URL of the SPA (Stripe return URLs, emails). */
  clientPublicUrl: (process.env.CLIENT_PUBLIC_URL || "http://localhost:5173").replace(/\/$/, ""),
  stripeSecretKey: (process.env.STRIPE_SECRET_KEY || "").trim(),
  stripeWebhookSecret: (process.env.STRIPE_WEBHOOK_SECRET || "").trim(),
  /** Stripe Checkout currency (e.g. pkr, usd). */
  stripeCurrency: (process.env.STRIPE_CURRENCY || "pkr").trim().toLowerCase(),

  twilioAccountSid: (process.env.TWILIO_ACCOUNT_SID || "").trim(),
  twilioAuthToken: (process.env.TWILIO_AUTH_TOKEN || "").trim(),
  twilioFromNumber: (process.env.TWILIO_FROM_NUMBER || "").trim(),

  openaiApiKey: (process.env.OPENAI_API_KEY || "").trim(),
  openaiModel: (process.env.OPENAI_MODEL || "gpt-4o-mini").trim()
};
