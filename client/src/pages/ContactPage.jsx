import { useState } from "react";
import { apiFetch } from "../lib/api";
import { showToast } from "../lib/toast";
import { useI18n } from "../lib/i18n";
import MotionSurface from "../components/MotionSurface";
import ScrollParallaxWrap from "../components/ScrollParallaxWrap";

const initial = {
  name: "",
  email: "",
  phone: "",
  address: "", 
  message: ""
};
const addressOptions = [
  { value: "", label: "Select Address / Branch" },
  { value: "karachi-dha", label: "Karachi — DHA Branch" },
  { value: "karachi-clifton", label: "Karachi — Clifton Branch" },
  { value: "lahore-gulberg", label: "Lahore — Gulberg Branch" },
  { value: "islamabad-f6", label: "Islamabad — F-6 Branch" }
];

export default function ContactPage() {
  const { t } = useI18n();
  const [form, setForm] = useState(initial);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const data = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form)
      });
      showToast(data.message || "Sent!", "success");
      setForm(initial);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="page-shell space-y-8">
      <ScrollParallaxWrap>
      <MotionSurface as="section" className="relative h-[42vh] min-h-[260px] overflow-hidden rounded-2xl border border-zinc-200" hoverLift={false}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/b1.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-200">{t("contact.kicker", "Get in touch")}</p>
            <h1 className="text-4xl font-extrabold text-white md:text-5xl">{t("contact.title", "Contact us")}</h1>
            <p className="mx-auto mt-3 max-w-xl text-zinc-100">{t("contact.subtitle", "Send an enquiry — we reply by email.")}</p>
          </div>
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
        <ScrollParallaxWrap>
        <MotionSurface as="article" className="card space-y-4">
          <h2 className="text-xl font-semibold">{t("contact.formTitle", "Enquiry form")}</h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              required
              className="input"
              placeholder={t("contact.namePlaceholder", "Your name")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              className="input"
              placeholder={t("contact.emailPlaceholder", "Your email")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              placeholder={t("contact.phonePlaceholder", "Phone (optional)")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <select
  required
  className="input"
  value={form.address}
  onChange={(e) => setForm({ ...form, address: e.target.value })}
>
  {addressOptions.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>
            <textarea
              required
              rows={6}
              className="input"
              placeholder={t("contact.messagePlaceholder", "Your message or enquiry")}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button className="btn-primary w-full" type="submit" disabled={sending}>
              {sending ? t("contact.sending", "Sending…") : t("contact.submit", "Send enquiry")}
            </button>
          </form>
        </MotionSurface>
        </ScrollParallaxWrap>

        <ScrollParallaxWrap invert>
        <MotionSurface as="article" className="card space-y-4" delay={0.04}>
          <h2 className="text-xl font-semibold">{t("contact.directTitle", "Direct email")}</h2>
          <p className="text-sm text-zinc-700">{t("contact.directHint", "Prefer email? Reach us directly:")}</p>
          <a
            href="mailto:alishbasubhan57@gmail.com"
            className="inline-flex break-all text-lg font-semibold text-glowifyRed underline hover:opacity-90"
          >
            alishbasubhan57.com@gmail.com
          </a>
          <p className="text-sm text-zinc-600">Call {t("contact.call", "03406047077")}</p>
          <MotionSurface className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700" hoverLift={false}>
            {t("contact.note", "Your enquiry appears in Admin → Notifications. For live help, use the Chat button.")}
          </MotionSurface>
        </MotionSurface>
        </ScrollParallaxWrap>
      </div>
    </section>
  );
}
