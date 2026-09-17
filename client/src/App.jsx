import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "./components/Navbar";
import PublicPageTransition from "./components/PublicPageTransition";
import AdminPageTransition from "./components/AdminPageTransition";
import ChatWidget from "./components/ChatWidget";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import BookingPage from "./pages/BookingPage";
import BookingPaymentReturnPage from "./pages/BookingPaymentReturnPage";
import ContactPage from "./pages/ContactPage";
import ToastStack from "./components/ToastStack";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { clearAdminSession, getAdminSession } from "./lib/adminSession";
import SiteFooter from "./components/SiteFooter";

const MotionBookLink = motion.create(Link);

export default function App() {
  const [sessionVersion, setSessionVersion] = useState(0);
  const { token, admin } = useMemo(() => getAdminSession(), [sessionVersion]);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  function handleLogout() {
    clearAdminSession();
    setSessionVersion((prev) => prev + 1);
  }

  function refreshSession() {
    setSessionVersion((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3] text-zinc-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-float absolute -left-16 top-20 h-64 w-64 rounded-full bg-glowifyRed/10 blur-3xl" />
        <div className="animate-float absolute right-0 top-1/3 h-80 w-80 rounded-full bg-rose-300/20 blur-3xl" />
      </div>
      <div className="relative z-10">
      <Navbar />
      <Routes>
        <Route element={<PublicPageTransition />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/book/payment-return" element={<BookingPaymentReturnPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route element={<AdminPageTransition />}>
          <Route
            path="/admin/login"
            element={token ? <Navigate to="/admin" /> : <AdminLoginPage onLoggedIn={refreshSession} />}
          />
          <Route
            path="/admin"
            element={
              token ? (
                <AdminDashboardPage token={token} admin={admin} onLogout={handleLogout} />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastStack />
      {!location.pathname.startsWith("/admin") && <ChatWidget />}
      {!token && location.pathname !== "/book" && (
        <MotionBookLink
          to="/book"
          className="fixed bottom-5 left-5 z-[95] rounded-full bg-glowifyRed px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-red-900/30"
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Book Now
        </MotionBookLink>
      )}
      {!location.pathname.startsWith("/admin") && <SiteFooter />}
      </div>
    </div>
  );
}
