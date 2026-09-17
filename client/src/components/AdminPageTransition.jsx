import { Outlet, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { aureliaPageDuration, aureliaPageEase } from "../motion/aureliaPreset";

function scrollDocumentTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Admin shell: never start at opacity 0 (avoids blank dashboard after login).
 * Subtle slide only; scroll reset on route change.
 */
export default function AdminPageTransition() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    scrollDocumentTop();
    const raf = requestAnimationFrame(() => {
      scrollDocumentTop();
      requestAnimationFrame(scrollDocumentTop);
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.search]);

  const transition = reduceMotion
    ? { duration: 0.1, ease: "linear" }
    : { duration: aureliaPageDuration * 0.55, ease: aureliaPageEase };

  return (
    <motion.div
      key={location.pathname + location.search}
      className="motion-admin-page-root"
      initial={reduceMotion ? false : { opacity: 1, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <Outlet />
    </motion.div>
  );
}
