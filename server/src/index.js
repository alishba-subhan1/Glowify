const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { mongoUri, port, corsOrigins, adminAlertEmail, smtpHost, smtpUser, smtpPass } = require("./config");
const { bootstrapDefaults } = require("./utils/bootstrap");

const authRoutes = require("./routes/auth.routes");
const serviceRoutes = require("./routes/services.routes");
const bookingRoutes = require("./routes/bookings.routes");
const chatRoutes = require("./routes/chat.routes");
const notificationRoutes = require("./routes/notifications.routes");
const settingRoutes = require("./routes/settings.routes");
const userRoutes = require("./routes/users.routes");
const categoryRoutes = require("./routes/categories.routes");
const paymentRoutes = require("./routes/payments.routes");
const transactionRoutes = require("./routes/transactions.routes");
const reviewRoutes = require("./routes/reviews.routes");
const translationRoutes = require("./routes/translations.routes");
const adminDataRoutes = require("./routes/admin-data.routes");
const contactRoutes = require("./routes/contact.routes");
const aiBookingRoutes = require("./routes/ai-booking.routes");
const { stripeWebhookHandler } = require("./stripeWebhook");

const app = express();
let isDatabaseConnected = false;
let databasePromise;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true
  })
);
app.post("/api/payments/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Glowify API",
    database: isDatabaseConnected ? "connected" : "disconnected"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/admin/data", adminDataRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ai", aiBookingRoutes);
app.use((err, req, res, next) => {
  return res.status(500).json({ message: "Unexpected error", error: err.message });
});

/**
 * In development, tries the configured port then the next ports if EADDRINUSE.
 * Production (or PORT_STRICT=1) uses only the configured port.
 */
async function createServerOnAvailablePort(appHandler, preferredPort) {
  const start = Number(preferredPort) || 5000;
  const strict = process.env.PORT_STRICT === "1" || process.env.NODE_ENV === "production";
  const maxPort = strict ? start : start + 9;

  const listenOnce = (srv, p) =>
    new Promise((resolve, reject) => {
      const onErr = (err) => {
        srv.removeListener("error", onErr);
        reject(err);
      };
      srv.once("error", onErr);
      srv.listen(p, () => {
        srv.removeListener("error", onErr);
        resolve();
      });
    });

  let sawAddrInUse = false;
  for (let p = start; p <= maxPort; p++) {
    const srv = http.createServer(appHandler);
    try {
      await listenOnce(srv, p);
      return { server: srv, port: p };
    } catch (err) {
      await new Promise((resolve) => srv.close(() => resolve()));
      if (err.code === "EADDRINUSE") {
        sawAddrInUse = true;
        if (p < maxPort) continue;
      } else {
        console.error("[listen]", err.message);
        process.exit(1);
      }
    }
  }

  console.error(
    `[listen] Port${strict ? "" : "s"} ${start}${strict ? "" : `–${maxPort}`} ${strict ? "is" : "are all"} in use.\n` +
      `  Free one: netstat -ano | findstr :${start}\n` +
      `  Or set PORT in server/.env. (Dev auto-tries next ports unless PORT_STRICT=1.)\n`
  );
  if (sawAddrInUse) process.exit(1);
  process.exit(1);
}

async function connectDatabase() {
  if (databasePromise) return databasePromise;

  databasePromise = (async () => {
  isDatabaseConnected = false;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    isDatabaseConnected = true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (mongoUri.includes("mongodb+srv://")) {
      console.error(
        "Atlas tip: verify username/password, network access list, and connection string in server/.env"
      );
    } else {
      console.error("Local MongoDB tip: start mongod service or switch to Atlas URI in server/.env");
    }
    console.warn("API will start, but database-backed routes will fail until MongoDB is reachable.");
  }

  if (isDatabaseConnected) {
    try {
      await bootstrapDefaults();
    } catch (err) {
      console.error("[bootstrap] Warning (server still listening):", err.message);
    }
  }
  })();

  return databasePromise;
}

async function start() {
  await connectDatabase();

  const { server: httpServer, port: actualPort } = await createServerOnAvailablePort(app, port);

  if (actualPort !== Number(port)) {
    console.warn(
      `\n[listen] Default port ${port} was busy; API is on http://localhost:${actualPort}\n` +
        `  Set server/.env: PORT=${actualPort}\n` +
        `  Set client/.env: VITE_API_URL=http://localhost:${actualPort}/api\n`
    );
  }

  console.log(`Glowify server running on http://localhost:${actualPort}`);
  console.log(`Allowed frontend origins: ${corsOrigins.join(", ")}`);
  console.log(`Database status: ${isDatabaseConnected ? "connected" : "disconnected"}`);
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      `[email] SMTP not configured — booking alerts will NOT reach ${adminAlertEmail}. Set SMTP_HOST, SMTP_USER, SMTP_PASS in server/.env.`
    );
  } else {
    console.log(`[email] Alerts will be sent to: ${adminAlertEmail}`);
  }

  httpServer.on("error", (err) => {
    console.error("[server]", err.message);
  });
}

if (require.main === module) {
  start();
}

module.exports = { app, connectDatabase };
