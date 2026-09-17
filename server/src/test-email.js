/**
 * Verify SMTP after you paste SMTP_PASS into server/.env:
 *   npm run test:email
 *
 * Google App Password must be created by you at:
 * https://myaccount.google.com/apppasswords
 */
require("dotenv").config();
const { adminAlertEmail } = require("./config");
const { sendAdminEmailAlert } = require("./utils/email");

async function main() {
  const ok = await sendAdminEmailAlert({
    subject: "Glowify SMTP test",
    text: "If you received this, booking alert emails will work.\n\nRestart the API and try a test booking."
  });
  if (!ok) {
    console.error(`
[test:email] FAILED

Check server/.env has all of:
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your@gmail.com
  SMTP_PASS=<16-char App Password from Google (no spaces)>

Create App Password: https://myaccount.google.com/apppasswords
Alerts go to: ${adminAlertEmail || "(set ADMIN_ALERT_EMAIL)"}
`);
    process.exit(1);
  }
  console.log(`[test:email] OK — check inbox: ${adminAlertEmail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
