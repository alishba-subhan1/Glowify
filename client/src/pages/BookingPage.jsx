import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { showToast } from "../lib/toast";
import { useI18n } from "../lib/i18n";
import MotionSurface from "../components/MotionSurface";

const initialForm = {
  customerName: "",
  customerEmail: localStorage.getItem("glowifyCustomerEmail") || "",
  customerPhone: "",
  serviceId: "",
  date: "",
  slot: "",
  notes: "",
  paymentMethod: "cash",
  cardNumber: "",
  cardName: "",
  cardExpiry: "",
  cardCvc: ""
};

const bookingHeroImage = "/images/booking-banner-user.png";
const bookingTipsImage = "/images/event-user.png";
// Keep in sync with server default timeSlots (see server/src/utils/migrations.js)
const defaultTimeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const websiteServices = [
  { name: "Bridal Makeup", price: 15000 },
  { name: "Event Makeup", price: 8000 },
  { name: "Festive Makeup", price: 6500 },
  { name: "Mehndi Makeup", price: 10000 },
  { name: "Hair Styling", price: 3500 },
  { name: "Hair Curling", price: 2800 },
  { name: "Hair Straightening", price: 3200 },
  { name: "Hair Dry / Blow Dry", price: 2000 },
  { name: "Hair Dye / Hair Coloring", price: 6000 },
  { name: "Other Hair Styling Needs", price: 4000 },
  { name: "Facial Treatments", price: 4500 },
  { name: "Skin Polishing", price: 5000 },
  { name: "Anti-Shedding Treatment", price: 5500 },
  { name: "Eyelash Extensions", price: 7000 },
  { name: "Nail Extensions", price: 6500 },
  { name: "Eyebrow Shaping", price: 1200 },
  { name: "Full Body Waxing", price: 6500 },
  { name: "Arms & Legs Waxing", price: 3500 }
];

export default function BookingPage() {
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState(defaultTimeSlots);
  const [suggestQuery, setSuggestQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/services"), apiFetch("/settings")])
      .then(([serviceData, settings]) => {
        setServices(serviceData);
        const configuredSlots = Array.isArray(settings?.timeSlots)
          ? settings.timeSlots.map((slot) => String(slot).trim()).filter(Boolean)
          : [];
        setSlots(configuredSlots.length > 0 ? configuredSlots : defaultTimeSlots);
      })
      .catch((err) => {
        setSlots(defaultTimeSlots);
        showToast(err.message, "error");
      });
  }, []);

  const serviceOptions = useMemo(() => {
    const apiByName = new Map();
    for (const service of services) {
      const n = (service.name || "").trim().toLowerCase();
      const t = (service.title || "").trim().toLowerCase();
      if (n) apiByName.set(n, service);
      if (t && t !== n) apiByName.set(t, service);
    }
    const websiteNames = new Set(websiteServices.map((service) => service.name.toLowerCase()));

    const fromWebsiteCatalog = websiteServices.map((service) => {
      const match = apiByName.get(service.name.toLowerCase());
      if (match) return match;
      return {
        _id: `catalog::${service.name}`,
        name: service.name,
        price: service.price,
        fromCatalogOnly: true
      };
    });

    const apiExtras = services
      .filter((service) => {
        const nl = (service.name || "").trim().toLowerCase();
        const tl = (service.title || "").trim().toLowerCase();
        return !(websiteNames.has(nl) || websiteNames.has(tl));
      })
      .map((service) => ({ ...service }));

    return [...fromWebsiteCatalog, ...apiExtras];
  }, [services]);

  async function loadSuggestions() {
    const q = suggestQuery.trim();
    if (q.length < 2) {
      showToast("Type at least 2 characters (e.g. bridal, hair, party).", "error");
      return;
    }
    setSuggestLoading(true);
    try {
      const data = await apiFetch(`/ai/booking-suggestions?q=${encodeURIComponent(q)}`);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      showToast(err.message, "error");
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.serviceId.startsWith("catalog::")) {
      showToast("This service is shown on website but not yet activated in admin panel.", "error");
      return;
    }
    try {
      const booking = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          serviceId: form.serviceId,
          date: form.date,
          slot: form.slot,
          notes: form.notes,
          paymentMethod: form.paymentMethod
        })
      });

      const emailKey = form.customerEmail.toLowerCase().trim();
      localStorage.setItem("glowifyCustomerEmail", emailKey);

      if (form.paymentMethod === "stripe") {
        const out = await apiFetch("/payments/stripe/create-checkout-session", {
          method: "POST",
          body: JSON.stringify({
            bookingId: booking._id,
            customerEmail: emailKey,
            clientOrigin: window.location.origin
          })
        });
        if (out?.url) {
          window.location.href = out.url;
          return;
        }
        showToast("Stripe Checkout URL missing — set STRIPE_SECRET_KEY on the server.", "error");
        return;
      }

      await apiFetch("/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking._id,
          customerEmail: emailKey,
          paymentMethod: form.paymentMethod,
          card:
            form.paymentMethod === "card"
              ? {
                  number: form.cardNumber,
                  name: form.cardName,
                  expiry: form.cardExpiry,
                  cvc: form.cardCvc
                }
              : {}
        })
      });

      showToast("Booking and payment created successfully.", "success");
      setForm((prev) => ({ ...initialForm, customerEmail: prev.customerEmail }));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  return (
    <section className="space-y-8">
      <MotionSurface as="section" className="relative h-[48vh] min-h-[320px] overflow-hidden" hoverLift={false}>
        <div className="absolute inset-0">
          <img
            src={bookingHeroImage}
            alt="Booking banner"
            className="h-full w-full object-cover object-[center_28%] brightness-110 contrast-110 saturate-110"
          />
        </div>
        <div className="absolute inset-0 bg-black/8" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-4">
          <div className="max-w-3xl text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-200">Appointment Desk</p>
            <h1 className="mb-3 text-4xl font-extrabold text-white md:text-5xl">{t("booking.title", "Book Appointment")}</h1>
            <p className="text-zinc-100">{t("booking.subtitle", "Reserve your preferred service, date, and time slot in minutes.")}</p>
          </div>
        </div>
      </MotionSurface>

      <section className="page-shell">
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {[
          ["Step 1", "Select service"],
          ["Step 2", "Choose date & time"],
          ["Step 3", "Share details"],
          ["Step 4", "Get approval"]
        ].map((item, index) => (
          <MotionSurface
            as="article"
            key={item[0]}
            className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
            delay={index * 0.035}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item[0]}</p>
            <p className="text-sm font-semibold">{item[1]}</p>
          </MotionSurface>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <MotionSurface className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-3xl font-semibold tracking-tight">Book Appointment</h2>
          <p className="mb-4 text-sm text-zinc-600">Reserve your preferred service, date, and time slot.</p>
          <MotionSurface className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4" hoverLift={false}>
            <p className="text-sm font-semibold text-zinc-800">AI-assisted suggestions</p>
            <p className="mt-1 text-xs text-zinc-600">
              Describe your occasion (optional). Uses keyword rules; add <code className="rounded bg-white px-1">OPENAI_API_KEY</code> on the server for smarter picks.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="input flex-1"
                placeholder="e.g. wedding bridal look, party glam, hair only"
                value={suggestQuery}
                onChange={(e) => setSuggestQuery(e.target.value)}
              />
              <button type="button" className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800" onClick={loadSuggestions} disabled={suggestLoading}>
                {suggestLoading ? "Suggesting…" : "Suggest"}
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={String(s._id)}
                    type="button"
                    className="rounded-full border border-glowifyRed/40 bg-white px-3 py-1.5 text-left text-xs text-zinc-800"
                    onClick={() => setForm((f) => ({ ...f, serviceId: String(s._id) }))}
                  >
                    <span className="font-semibold">{s.title || s.name}</span>
                    <span className="text-zinc-500"> · PKR {Number(s.price || 0).toLocaleString()}</span>
                    <span className="mt-0.5 block text-[10px] text-zinc-500">{s.reason}</span>
                  </button>
                ))}
              </div>
            )}
          </MotionSurface>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <input
              required
              placeholder="Your Name"
              className="input"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Your Email"
              className="input"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
            <input
              required
              placeholder="Phone Number"
              className="input"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
            <select
              required
              className="input"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            >
              <option value="">Select Service</option>
              {serviceOptions.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - PKR {service.price}
                </option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <select
                required
                className="input"
                value={form.slot}
                onChange={(e) => setForm({ ...form, slot: e.target.value })}
              >
                <option value="">Select Time Slot</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Notes (optional)"
              className="input min-h-24"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <MotionSurface className="rounded-xl border border-zinc-200 bg-zinc-50 p-3" delay={0.06} hoverLift={false}>
              <p className="mb-2 text-sm font-semibold text-zinc-700">Payment Method</p>
              <select
                className="input"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="cash">Cash at salon</option>
                <option value="card">Demo card (mock gateway)</option>
                <option value="stripe">Stripe Checkout (real card — needs STRIPE_SECRET_KEY)</option>
                <option value="jazzcash">JazzCash (pending — creates placeholder payment)</option>
              </select>
              {form.paymentMethod === "card" && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    className="input sm:col-span-2"
                    placeholder="Card Number"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  />
                  <input
                    required
                    className="input"
                    placeholder="Card Holder Name"
                    value={form.cardName}
                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                  />
                  <input
                    required
                    className="input"
                    placeholder="MM/YY"
                    value={form.cardExpiry}
                    onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })}
                  />
                  <input
                    required
                    className="input"
                    placeholder="CVC"
                    value={form.cardCvc}
                    onChange={(e) => setForm({ ...form, cardCvc: e.target.value })}
                  />
                </div>
              )}
            </MotionSurface>
            <button className="btn-primary" type="submit">
              {t("booking.submit", "Confirm Booking")}
            </button>
          </form>
        </MotionSurface>

        <MotionSurface as="aside" className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm" delay={0.04}>
          <img
            className="h-64 w-full object-cover object-center"
            src={bookingTipsImage}
            alt="Salon booking"
          />
          <div className="space-y-4 p-5">
            <h3 className="text-xl font-semibold">Booking Tips</h3>
            <ul className="list-none space-y-2 text-sm text-zinc-700">
              {[
                "Choose the exact slot you can attend on time.",
                "Use your real email to receive status notifications.",
                "Mention any special requirements in notes."
              ].map((text, index) => (
                <MotionSurface
                  as="li"
                  key={text}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-2"
                  delay={0.05 + index * 0.032}
                  hoverLift={false}
                >
                  {text}
                </MotionSurface>
              ))}
            </ul>
            <p className="text-xs text-zinc-500">
              Questions? Use{" "}
              <Link className="font-medium text-glowifyRed underline" to="/contact">
                Contact us
              </Link>{" "}
              or the chat button — we&apos;ll reply as soon as we can.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {["Fast Response", "Flexible Slots", "Secure Data"].map((label, index) => (
                <MotionSurface
                  key={label}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-center text-zinc-700"
                  delay={0.12 + index * 0.028}
                  hoverLift={true}
                >
                  {label}
                </MotionSurface>
              ))}
            </div>
          </div>
        </MotionSurface>
      </div>
      </section>
    </section>
  );
}
