import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const colorByType = {
  info: "bg-white border-zinc-300 text-zinc-900",
  success: "bg-emerald-50 border-emerald-300 text-emerald-900",
  error: "bg-red-50 border-red-300 text-red-900"
};

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onToast(event) {
      const toast = event.detail;
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 2800);
    }

    window.addEventListener("glowify-toast", onToast);
    return () => window.removeEventListener("glowify-toast", onToast);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16, scale: 0.96 }}
            transition={
              reduceMotion
                ? { duration: 0.18, ease: "linear" }
                : { type: "spring", stiffness: 560, damping: 34, mass: 0.72 }
            }
            className={`max-w-sm rounded-lg border px-4 py-2 text-sm shadow-xl ${colorByType[toast.type] || colorByType.info}`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
