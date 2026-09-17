import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { apiFetch } from "../lib/api";
import { showToast } from "../lib/toast";
import MotionSurface from "./MotionSurface";

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function greetingLine(adminOnline) {
  if (adminOnline) {
    return (
      "Welcome to Glowify — an admin is online now. " +
      "Ask anything (services, offers, hours, booking) or type your question for a live reply. " +
      'Tip: try “what services do you offer?” or “any discounts today?”'
    );
  }
  return (
    "Hi, I am Glowify’s assistant while the team is away. " +
    "I answer common questions about services & offers, hours, location, and booking after you save your email. " +
    'Examples: “What services do you offer?” · “Discounts?” · “Hours today?”'
  );
}

export default function ChatWidget() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem("glowifyCustomerEmail") || "");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [adminOnline, setAdminOnline] = useState(false);

  const refreshSettings = useCallback(() => {
    apiFetch("/settings")
      .then((s) => setAdminOnline(Boolean(s?.adminOnline)))
      .catch(() => setAdminOnline(false));
  }, []);

  const loadMessages = useCallback(async (targetEmail) => {
    const e = String(targetEmail || "").trim().toLowerCase();
    if (!e || !isEmailValid(e)) return;
    try {
      const data = await apiFetch(`/chat/${encodeURIComponent(e)}`);
      setMessages(data);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, []);

  useEffect(() => {
    refreshSettings();
    const iv = setInterval(refreshSettings, 20000);
    return () => clearInterval(iv);
  }, [refreshSettings]);

  /** Auto-open once per browser tab so visitors notice chat. */
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return undefined;
    try {
      if (sessionStorage.getItem("glowify_chat_auto_open_v2")) return undefined;
      sessionStorage.setItem("glowify_chat_auto_open_v2", "1");
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    } catch {
      return undefined;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!open || !email || !isEmailValid(email)) return undefined;

    const normalized = email.trim().toLowerCase();
    let cancelled = false;
    const welcomeKey = `glowify_welcome_${normalized}`;

    async function bootstrapThread() {
      if (!sessionStorage.getItem(welcomeKey)) {
        try {
          await apiFetch("/chat/welcome", {
            method: "POST",
            body: JSON.stringify({ customerEmail: normalized })
          });
        } catch {
          /* ignore */
        } finally {
          sessionStorage.setItem(welcomeKey, "1");
        }
      }
      if (!cancelled) await loadMessages(normalized);
    }

    bootstrapThread();
    const timer = setInterval(() => loadMessages(normalized), 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [open, email, loadMessages]);

  async function handleSend(event) {
    event.preventDefault();
    if (!email || !text.trim() || !isEmailValid(email)) {
      showToast("Enter a valid email first", "error");
      return;
    }
    const normalized = email.trim().toLowerCase();
    localStorage.setItem("glowifyCustomerEmail", normalized);
    try {
      await apiFetch("/chat/customer", {
        method: "POST",
        body: JSON.stringify({ customerEmail: normalized, text })
      });
      setText("");
      await loadMessages(normalized);
      showToast("Message sent", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-full bg-glowifyRed px-5 py-3 font-semibold text-white shadow-xl shadow-red-900/25 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/80"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -4, 0]
              }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.8, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }
        }
      >
        {!reduceMotion && (
          <span className="flex items-center gap-1.5" aria-hidden>
            <motion.span
              className="block h-2 w-2 rounded-full bg-white"
              animate={{
                scaleY: [1, 0.12, 1, 1, 1, 0.12, 1]
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.06, 0.12, 0.55, 0.6, 0.66, 0.72]
              }}
            />
            <motion.span
              className="block h-2 w-2 rounded-full bg-white"
              animate={{
                scaleY: [1, 0.12, 1, 1, 1, 0.12, 1]
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.06, 0.12, 0.55, 0.6, 0.66, 0.72],
                delay: 0.05
              }}
            />
          </span>
        )}
        Chat
      </motion.button>

      {open && (
        <MotionSurface
          preset="popup"
          className="fixed bottom-20 right-5 z-[100] w-[min(100vw-2rem,21rem)] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl"
        >
          <h3 className="mb-1 text-sm font-semibold text-zinc-900">Glowify Support</h3>
          <p className="mb-2 text-[11px] font-medium text-zinc-600">
            {adminOnline ? (
              <span className="text-emerald-600">Admin online — live replies</span>
            ) : (
              <span className="text-amber-700">Admin offline — bot replies when you message</span>
            )}
          </p>
          <div className="mb-2 rounded-xl border border-amber-100 bg-amber-50/90 p-2 text-xs leading-relaxed text-zinc-800">
            {greetingLine(adminOnline)}
          </div>
          <input
            className="input mb-2 text-sm"
            placeholder="Your email (required)"
            value={email}
            onBlur={() => email && localStorage.setItem("glowifyCustomerEmail", email.trim().toLowerCase())}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="mb-2 h-52 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-sm">
            {messages.map((msg) => (
              <div key={msg._id} className={msg.sender === "customer" ? "text-right" : "text-left"}>
                <span className="inline-block rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-800">
                  <strong className="capitalize">{msg.sender === "bot" ? "Assistant" : msg.sender}: </strong>
                  {msg.text}
                </span>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-xs text-zinc-500">
                {isEmailValid(email) ? "Loading your thread…" : "Add your email above to load saved messages."}
              </p>
            )}
          </div>
          <form onSubmit={handleSend} className="space-y-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="input text-sm"
            />
            <button type="submit" className="btn-primary w-full">
              Send
            </button>
          </form>
        </MotionSurface>
      )}
    </>
  );
}
