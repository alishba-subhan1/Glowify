import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-driven motion: horizontal (+ slight vertical) drift tied to how the block moves through the viewport.
 * Uses scroll progress only — not hover/click. Pure transforms; layout unchanged.
 */
export default function ScrollParallaxWrap({
  children,
  className = "",
  /** Max horizontal shift in px between entering and leaving the viewport */
  strength = 22,
  /** Flip drift direction (useful for alternating grid columns) */
  invert = false,
  /** Vertical drift as a fraction of strength (0 = horizontal only) */
  verticalRatio = 0.12
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const xLo = invert ? strength : -strength;
  const xHi = invert ? -strength : strength;
  /** Linear tie = motion visibly tracks finger / wheel while scrolling */
  const x = useTransform(scrollYProgress, [0, 1], [xLo, xHi]);

  const vy = strength * verticalRatio;
  const yLo = invert ? vy : -vy;
  const yHi = invert ? -vy : vy;
  const y = useTransform(scrollYProgress, [0, 1], [yLo, yHi]);

  const cn = `motion-scroll-float w-full min-w-0 ${className}`.trim();

  if (reduced) {
    return (
      <div ref={ref} className={cn}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={cn} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
