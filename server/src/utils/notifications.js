const Notification = require("../models/Notification");
const Setting = require("../models/Setting");
const { sendAdminEmailAlert } = require("./email");
const { adminAlertEmail } = require("../config");
const { isValidEmail, normalizeEmail } = require("./validators");

async function resolveAdminAlertEmail() {
  const s = await Setting.findOne({ key: "global" }).select("adminNotificationEmail").lean();
  const fromDb = String(s?.adminNotificationEmail || "").trim().toLowerCase();
  if (fromDb && fromDb.includes("@")) return fromDb;
  return adminAlertEmail;
}

async function createNotification({ userId, recipientType, recipientId, title, message, emailSubject, emailHtml }) {
  try {
    const doc = await Notification.create({
      userId,
      recipientType,
      recipientId,
      title,
      message
    });
    const adminInbox = await resolveAdminAlertEmail();

    if (recipientType === "admin") {
      const sent = await sendAdminEmailAlert({
        to: adminInbox,
        subject: emailSubject || `[Glowify] ${title}`,
        text: `${message}\n\n---\nGlowify Admin / Notifications tab`
      });
      if (!sent) {
        console.warn(
          "[email] In-app admin notification saved, but SMTP did not deliver. Fix SMTP_* and check server logs above."
        );
      }
    }
    if (recipientType === "customer") {
      const to = normalizeEmail(String(recipientId || ""));
      if (isValidEmail(to)) {
        const sent = await sendAdminEmailAlert({
          to,
          bcc: to !== adminInbox ? adminInbox : undefined,
          subject: emailSubject || `[Glowify] ${title}`,
          text: `${message}\n\n---\nGlowify`,
          html: emailHtml
        });
        if (!sent) {
          console.warn(
            "[email] In-app customer notification saved, but email was not delivered. Verify SMTP_* in server/.env."
          );
        }
      }
    }
    return doc;
  } catch (err) {
    console.error("[notification] Could not create notification or send email (booking still OK):", err.message);
    return null;
  }
}
module.exports = { createNotification };
