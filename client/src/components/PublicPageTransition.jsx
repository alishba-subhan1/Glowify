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
 * Enter-only route motion (opacity + translate + scale). No AnimatePresence / exit:
 * wait-mode exit frequently leaves a blank Outlet on client navigation until a full
 * refresh; enter-only avoids that while keeping a polished transition.
 */
export default function PublicPageTransition() {
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
    ? { duration: 0.14, ease: "linear" }
    : { duration: aureliaPageDuration * 0.82, ease: aureliaPageEase };

  return (
    <motion.div
      key={location.pathname + location.search}
      className="motion-page-root"
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.988, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={transition}
    >
      <div className="motion-page-text-layer">
        <Outlet />
      </div>
    </motion.div>
  );
}
