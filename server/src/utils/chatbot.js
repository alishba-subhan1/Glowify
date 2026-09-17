/** More specific rules first — `find` returns first match */
const fallbackRules = [
  {
    keywords: [
      "what do you offer",
      "services you offer",
      "what services",
      "list of service",
      "treatments",
      "catalogue",
      "catalog",
      "price menu",
      "menu"
    ],
    reply:
      "We offer makeup (bridal, event, festive, mehndi), hair styling and colour, facials and skin care, lash extensions, nails, brows, and waxing. Open the Services page for full menus and PKR prices, then use Book to reserve."
  },
  {
    keywords: ["offer", "offers", "discount", "deal", "deals", "promo", "promotion", "sale", "package"],
    reply:
      "Offers and packages change by season. Check Services for current prices, or tell us which treatment you want — we will confirm the best rate before you book."
  },
  {
    keywords: ["bridal", "wedding makeup"],
    reply:
      "Bridal makeup includes consultation, long-wear finish, and trials by arrangement. See Services for bridal timing and price, or ask for a custom quote with your date."
  },
  {
    keywords: ["hair", "haircut", "colour", "color", "blow"],
    reply:
      "Hair services include styling, curls, straightening, blow dry, and colour. Durations and prices are listed under Hair on the Services page."
  },
  {
    keywords: ["nail", "manicure", "pedicure"],
    reply:
      "We do nail extensions and related care — see Nail Services on the Services page for duration and pricing."
  },
  {
    keywords: ["lash", "eyelash"],
    reply:
      "Lash extensions are customised to your eye shape. Full details are under Eyelash Services on the Services page."
  },
  {
    keywords: [
      "owner",
      "who owns",
      "who is the owner",
      "parlour owner",
      "parlor owner",
      "salon owner",
      "founder",
      "proprietor",
      "who runs",
      "malik",
      "owner kon",
      "owner kaun"
    ],
    reply:
      "Glowify Parlour is owned and managed by Alishba Subhan. For business enquiries, use the Contact page or leave your message here — our team will reply."
  },
  {
    keywords: ["location", "address", "where are you", "direction", "map"],
    reply:
      "We are Glowify Parlour in Lahore — MM Alam Road area (see Contact or your booking confirmation for the exact pin). Ask in chat if you need landmark-based directions."
  },
  {
    keywords: ["contact", "phone", "whatsapp", "call", "email"],
    reply:
      "Use the Contact page for details, or leave your question here with email — an admin or this bot will reply. When admin is online, you get live answers."
  },
  {
    keywords: ["parking"],
    reply:
      "Ask at booking if you need parking notes for your time slot — we will share the easiest option near the studio."
  },
  {
    keywords: ["cancel", "reschedule", "change appointment"],
    reply:
      "To change or cancel, open Contact or reply in this chat with your booking details. Please give as much notice as you can so we can offer your slot to someone else."
  },
  {
    keywords: ["pay", "payment", "card", "cash", "installment"],
    reply:
      "Payment methods are confirmed when you book or at the desk — ask for your preferred option (cash, card, etc.) when you message us."
  },
  {
    keywords: ["hygiene", "safe", "clean", "sanit"],
    reply:
      "We follow strict hygiene: disposables where needed, sanitised tools, and fresh linens. Ask if you have allergy or sensitivity concerns before your service."
  },
  {
    keywords: ["gift", "voucher", "certificate"],
    reply:
      "Gift ideas and vouchers may be available — ask an admin in chat when online, or leave a note with your request."
  },
  {
    keywords: ["refund"],
    reply:
      "Refund and cancellation rules depend on the service and timing. Share your booking reference here and the team will advise."
  },
  {
    keywords: ["hello", "hi ", "hi!", "hey", "good morning", "good afternoon", "good evening"],
    reply:
      "Hello — welcome to Glowify. Ask about services, hours, location, or booking; if an admin is online, they can jump in live."
  },
  {
    keywords: ["thank", "thanks", "thx"],
    reply: "You are welcome — happy to help!"
  },
  {
    keywords: ["price", "pricing", "cost", "charge", "fee", "how much", "pk", "pkr"],
    reply:
      "Each service has PKR pricing on the Services page (duration is listed too). Tell us the service name if you want a quick summary here."
  },
  {
    keywords: ["hour", "hours", "open", "opening", "close", "timing", "time do you", "when open"],
    reply:
      "Glowify is typically open 10:00 AM – 7:00 PM, Monday–Saturday. Check Contact or ask us to confirm on holidays."
  },
  {
    keywords: ["book", "appointment", "booking", "reserve", "slot"],
    reply:
      "Go to Book, pick your service, date, and time, then submit. You can also say what you want in this chat and we will guide you."
  }
];

function chatbotReply(text) {
  const normalized = (text || "").toLowerCase();
  if (normalized === "__welcome__") {
    return offlineWelcomeText();
  }
  const matched = fallbackRules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );
  return (
    matched?.reply ||
    "Thanks for your message. Our team will pick this up soon — meanwhile browse Services and Book on the site, or ask about hours, location, and offers."
  );
}

function welcomeMessage(adminOnline) {
  if (adminOnline) {
    return (
      "Welcome to Glowify — an admin is online now. " +
      "Ask anything (services, offers, hours, booking) or type your question for a live reply. " +
      "Tip: try “what services do you offer?” or “any discounts today?”"
    );
  }
  return offlineWelcomeText();
}

function offlineWelcomeText() {
  return (
    "Hi, I am Glowify’s assistant while the team is away. " +
    "Automatic answers work for: services & offers, opening hours, location, booking steps, payments, and more — just ask in plain language after saving your email. " +
    "Examples: “What services do you offer?” · “Discounts?” · “Hours today?”"
  );
}

module.exports = { chatbotReply, welcomeMessage };
