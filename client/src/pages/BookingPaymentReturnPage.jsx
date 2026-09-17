import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import MotionSurface from "../components/MotionSurface";
import ScrollParallaxWrap from "../components/ScrollParallaxWrap";

export default function BookingPaymentReturnPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({ kind: "loading", message: "" });

  useEffect(() => {
    if (!sessionId) {
      setState({ kind: "error", message: "Missing payment session. Return to booking and try again." });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await apiFetch(`/payments/stripe/complete?session_id=${encodeURIComponent(sessionId)}`);
        if (!cancelled) setState({ kind: "ok", message: "Payment recorded. Your booking is confirmed pending salon approval." });
      } catch (err) {
        if (!cancelled) setState({ kind: "error", message: err.message || "Could not verify payment." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <section className="page-shell space-y-6 py-12">
      <ScrollParallaxWrap>
      <MotionSurface className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Payment return</h1>
        {state.kind === "loading" && <p className="mt-4 text-zinc-600">Verifying Stripe session…</p>}
        {state.kind === "ok" && <p className="mt-4 text-emerald-800">{state.message}</p>}
        {state.kind === "error" && <p className="mt-4 text-red-800">{state.message}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" to="/book">
            Book again
          </Link>
          <Link className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800" to="/">
            Home
          </Link>
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>
    </section>
  );
}
