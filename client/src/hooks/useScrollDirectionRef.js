import { useEffect, useRef } from "react";

/**
 * Tracks latest vertical scroll intent ("down" | "up") with a small pixel threshold.
 * Safe for SSR (uses window after mount).
 */
export default function useScrollDirectionRef(thresholdPx = 4) {
  const dirRef = useRef("down");

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < thresholdPx) return;
      dirRef.current = y > lastY ? "down" : "up";
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdPx]);

  return dirRef;
}
