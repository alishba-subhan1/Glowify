const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = require("../config");

let twilioClient;

function getTwilio() {
  if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) return null;
  if (!twilioClient) {
    twilioClient = require("twilio")(twilioAccountSid, twilioAuthToken);
  }
  return twilioClient;
}

/** E.164 preferred; prepends +92 for 10–11 digit PK-style numbers if no + */
function normalizeSmsTo(to) {
  let n = String(to || "").replace(/[^\d+]/g, "");
  if (n.startsWith("+")) return n;
  if (n.startsWith("92")) return `+${n}`;
  if (n.length >= 10 && n.length <= 11) return `+92${n.replace(/^0/, "")}`;
  return n.startsWith("+") ? n : `+${n}`;
}

/**
 * Optional SMS after booking — only sends if Twilio env is set.
 */
async function sendBookingSmsOptional({ phone, message }) {
  const client = getTwilio();
  if (!client) return false;
  const to = normalizeSmsTo(phone);
  if (to.length < 10) return false;
  const body = String(message || "").slice(0, 1400);
  try {
    await client.messages.create({
      from: twilioFromNumber,
      to,
      body
    });
    console.log("[sms] Sent booking SMS to", to);
    return true;
  } catch (err) {
    console.warn("[sms] Failed:", err.message);
    return false;
  }
}

module.exports = { sendBookingSmsOptional, normalizeSmsTo };
