import { motion } from "framer-motion";

export default function NotificationBell({ count }) {
  return (
    <div className="relative inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm">
      <span className="mr-2 text-zinc-700">Notifications</span>
      <motion.span
        key={count}
        initial={{ scale: 0.82 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-glowifyRed px-1 text-xs font-semibold text-white"
      >
        {count}
      </motion.span>
    </div>
  );
}
