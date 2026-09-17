const nodemailer = require("nodemailer");
const {
  adminAlertEmail,
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPass,
  smtpFrom
} = require("../config");

let cachedTransporter;

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    });
  }
  return cachedTransporter;
}

/**
 * Sends a plain-text email using SMTP_* env vars when set (admin alerts and customer booking mail).
 */
async function sendAdminEmailAlert({ subject, text, to: overrideTo, html, bcc }) {
  const to = (overrideTo || adminAlertEmail || "").trim().toLowerCase();
  const bccNorm = String(bcc || "")
    .trim()
    .toLowerCase();
  const bccList =
    bccNorm && bccNorm !== to ? bccNorm : undefined;
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("[email] Skipped send: SMTP not fully configured (SMTP_HOST/SMTP_USER/SMTP_PASS).");
    return false;
  }
  if (!to) {
    console.warn("[email] Skipped send: no recipient address.");
    return false;
  }
  try {
    const transport = getTransporter();
    if (!transport) {
      console.warn("[email] Skipped send: nodemailer transporter missing (check SMTP_*).");
      return false;
    }
    const from = smtpFrom || smtpUser || "Glowify <no-reply@glowify.com>";
    const subjectLine = String(subject || "Glowify admin alert").slice(0, 200);
    await transport.sendMail({
      from,
      to,
      ...(bccList ? { bcc: bccList } : {}),
      subject: subjectLine,
      text: String(text || "").slice(0, 8000),
      ...(html ? { html: String(html).slice(0, 12000) } : {})
    });
    console.log(`[email] Sent OK · ${subjectLine.slice(0, 72)}${subjectLine.length > 72 ? "…" : ""}`);
    return true;
  } catch (err) {
    console.warn("[email] Send failed:", err.message);
    return false;
  }
}

module.exports = { sendAdminEmailAlert };
