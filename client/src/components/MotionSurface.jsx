import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  aureliaEase as editorialEase,
  aureliaScrollDuration,
  aureliaInViewViewport,
  blurIn,
  blurInStrong,
  shopFrameDuration,
  aureliaStaggerItemReduced
} from "../motion/aureliaPreset";

function pickMotion(as) {
  switch (as) {
    case "article":
      return motion.article;
    case "section":
      return motion.section;
    case "aside":
      return motion.aside;
    case "form":
      return motion.form;
    case "li":
      return motion.li;
    case "p":
      return motion.p;
    default:
      return motion.div;
  }
}

/**
 * Mount-based reveals, scroll-based (`inView`) reveals, or Framer `variants` + stagger.
 */
export default function MotionSurface({
  as = "div",
  className = "",
  children,
  delay = 0,
  hoverLift = true,
  entrance = true,
  shopFrame = false,
  /** Animate when the block enters the viewport (cards, framed sections) */
  inView = false,
  variants: staggerVariants = null,
  preset,
  ...rest
}) {
  const { ref: refFromParent, ...restProps } = rest;
  const reduced = useReducedMotion();
  const MotionComponent = pickMotion(as);
  const isPopup = preset === "popup";

  const baseDuration = reduced ? 0.16 : shopFrame ? shopFrameDuration : aureliaScrollDuration;
  const duration = baseDuration;
  const transition = reduced
    ? { duration, delay, ease: "linear" }
    : { duration, delay, ease: editorialEase };

  const blurDone = reduced || shopFrame ? undefined : "blur(0px)";

  const hoverMotion =
    reduced || !hoverLift
      ? undefined
      : shopFrame
        ? {
            y: -8,
            scale: 1.014,
            rotateX: -3.5,
            rotateY: 2,
            boxShadow: "0 26px 60px rgba(17, 17, 17, 0.14)",
            transition: { type: "spring", stiffness: 320, damping: 34, mass: 0.85 }
          }
        : {
            y: -9,
            scale: 1.01,
            boxShadow: "0 24px 56px rgba(17, 17, 17, 0.11)",
            transition: { type: "spring", stiffness: 210, damping: 32, mass: 0.92 }
          };

  const tapMotion = reduced || !hoverLift ? undefined : { scale: 0.985 };

  const localRef = useRef(null);
  const setMergedRef = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof refFromParent === "function") refFromParent(node);
      else if (refFromParent) refFromParent.current = node;
    },
    [refFromParent]
  );

  if (isPopup) {
    return (
      <MotionComponent
        ref={setMergedRef}
        className={`motion-editorial ${className}`.trim()}
        initial={
          reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.96, filter: blurInStrong }
        }
        animate={
          reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
        }
        transition={transition}
        {...restProps}
      >
        {children}
      </MotionComponent>
    );
  }

  if (!entrance) {
    return (
      <MotionComponent
        ref={setMergedRef}
        className={`motion-editorial ${shopFrame ? "motion-shop-frame" : ""} ${className}`.trim()}
        whileHover={hoverMotion}
        whileTap={tapMotion}
        {...restProps}
      >
        {children}
      </MotionComponent>
    );
  }

  if (staggerVariants) {
    const v = reduced ? aureliaStaggerItemReduced : staggerVariants;
    return (
      <MotionComponent
        ref={setMergedRef}
        className={`motion-editorial ${shopFrame ? "motion-shop-frame" : ""} ${className}`.trim()}
        variants={v}
        initial="hidden"
        {...(inView
          ? { whileInView: "show", viewport: aureliaInViewViewport }
          : { animate: "show" })}
        whileHover={hoverMotion}
        whileTap={tapMotion}
        {...restProps}
      >
        {children}
      </MotionComponent>
    );
  }

  if (reduced) {
    if (inView) {
      return (
        <MotionComponent
          ref={setMergedRef}
          className={`motion-editorial ${shopFrame ? "motion-shop-frame" : ""} ${className}`.trim()}
          initial={{ opacity: 0, y: 6, x: -8 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={aureliaInViewViewport}
          transition={{ duration: 0.18, delay, ease: "linear" }}
          whileHover={hoverMotion}
          whileTap={tapMotion}
          {...restProps}
        >
          {children}
        </MotionComponent>
      );
    }
    return (
      <MotionComponent
        ref={setMergedRef}
        className={`motion-editorial ${shopFrame ? "motion-shop-frame" : ""} ${className}`.trim()}
        initial={{ opacity: 0, y: 6, x: -8 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.18, delay, ease: "linear" }}
        {...restProps}
      >
        {children}
      </MotionComponent>
    );
  }

  const shopInitial = {
    opacity: 0,
    y: 28,
    x: -16,
    scale: 0.94,
    rotateX: 8,
    transformPerspective: 1600
  };
  const shopAnimate = {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    rotateX: 0,
    transformPerspective: 1600
  };

  const editorialInitial = {
    opacity: 0,
    y: 24,
    x: 18,
    scale: 0.99,
    filter: blurIn
  };
  const editorialAnimate = {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: blurDone
  };

  if (inView) {
    return (
      <MotionComponent
        ref={setMergedRef}
        className={`motion-editorial ${shopFrame ? "motion-shop-frame" : ""} ${className}`.trim()}
        initial={shopFrame ? shopInitial : editorialInitial}
        whileInView={shopFrame ? shopAnimate : editorialAnimate}
        viewport={aureliaInViewViewport}
        transition={transition}
        whileHover={hoverMotion}
        whileTap={tapMotion}
        {...restProps}
      >
        {children}
      </MotionComponent>
    );
  }

  return (
    <MotionComponent
      ref={setMergedRef}
      className={`motion-editorial ${shopFrame ? "motion-shop-frame" : ""} ${className}`.trim()}
      initial={shopFrame ? shopInitial : editorialInitial}
      animate={shopFrame ? shopAnimate : editorialAnimate}
      transition={transition}
      whileHover={hoverMotion}
      whileTap={tapMotion}
      {...restProps}
    >
      {children}
    </MotionComponent>
  );
}
