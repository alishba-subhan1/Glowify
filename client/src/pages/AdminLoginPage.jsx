import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { showToast } from "../lib/toast";
import { saveAdminSession } from "../lib/adminSession";
import MotionSurface from "../components/MotionSurface";

export default function AdminLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alishbasubhan57@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      saveAdminSession(data.token, data.admin);
      onLoggedIn?.();
      showToast("Admin login successful", "success");
      navigate("/admin");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-shell flex min-h-[calc(100vh-120px)] items-center justify-center">
      <MotionSurface className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:grid-cols-2" hoverLift={false}>
        <div className="relative hidden min-h-[520px] lg:block">
          <img
            src="/images/h1.jpg"
            alt="Admin panel preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/65 to-zinc-900/20" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">Control Center</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Manage Glowify Operations Seamlessly</h2>
          </div>
        </div>
        <form className="space-y-4 p-6 md:p-8" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Admin Access</h1>
            <p className="text-sm text-zinc-600">Manage services, bookings, chat, and notifications.</p>
          </div>
          <div className="space-y-3">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              required
            />
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            Tip: Replace default credentials from `server/.env` before production deployment.
          </div>
          <Link to="/" className="block text-center text-sm text-zinc-600 hover:text-glowifyRed">
            Back to customer website
          </Link>
        </form>
      </MotionSurface>
    </section>
  );
}
