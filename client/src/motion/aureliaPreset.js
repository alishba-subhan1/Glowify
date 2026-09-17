/**
 * Editorial shop motion cues (Aurelia-style luxury catalogue):
 * soft ease-out, modest translate, light blur dissolves — not bouncy “startup” motion.
 */

/** Primary editorial ease — calm deceleration into rest */
export const aureliaEase = [0.33, 1, 0.68, 1];

/** Slightly slower in / out for full-page cross-fades (feels closer to high-end shop sites) */
export const aureliaPageEase = [0.22, 1, 0.36, 1];

export const aureliaScrollDuration = 0.52;

/** Boutique grid / product card reveals */
export const shopFrameDuration = 0.42;

/** Route shell: linger a touch so the frame read registers */
export const aureliaPageDuration = 0.46;

export const aureliaHeroDuration = 0.48;

export const blurIn = "blur(8px)";

export const blurInStrong = "blur(11px)";

export const blurOutHero = "blur(4px)";

/** Hero / testimonial line cross-fade */
export const bannerLineDuration = 0.24;

/** Parent: choreographs children like a shop masonry grid */
export const aureliaStaggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.068,
      delayChildren: 0.06
    }
  }
};

/** Editorial block (About-style sections) */
export const aureliaStaggerItem = {
  hidden: { opacity: 0, y: 32, x: -14, scale: 0.96, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: aureliaEase }
  }
};

/**
 * Product / service card frame: strong Y translate, scale, 3D tilt, blur dissolve;
 * `staggerChildren` drives inner media → body (reference-style layered reveal).
 */
export const aureliaStaggerItemShop = {
  hidden: {
    opacity: 0,
    y: 44,
    x: 20,
    scale: 0.9,
    rotateX: 11,
    filter: "blur(14px)",
    transformPerspective: 1600
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transformPerspective: 1600,
    transition: {
      duration: 0.68,
      ease: aureliaEase,
      staggerChildren: 0.12,
      delayChildren: 0.06
    }
  }
};

/** Inner: image “window” clips open inside the card */
export const aureliaShopCardMediaFrame = {
  hidden: { opacity: 0, clipPath: "inset(10% 8% 16% 8%)", scale: 0.97 },
  show: {
    opacity: 1,
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: 0.62, ease: aureliaEase }
  }
};

/** Inner: photo drifts up / scales into place */
export const aureliaShopCardImage = {
  hidden: { scale: 1.14, y: 28, opacity: 0.75, filter: "blur(8px)" },
  show: {
    scale: 1,
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.64, ease: aureliaEase }
  }
};

/** Inner: copy block rises after media */
export const aureliaShopCardBody = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: aureliaEase }
  }
};

export const aureliaStaggerItemReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.16, ease: "linear" } }
};

/** Reduced inner blocks — no clip / blur churn */
export const aureliaShopCardInnerReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.14, ease: "linear" } }
};

/** Hero copy: sequential lines */
export const aureliaHeroLinesContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.14 }
  }
};

export const aureliaHeroLine = {
  hidden: { opacity: 0, y: 26, x: -10, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.56, ease: aureliaEase }
  }
};

/** `whileInView` defaults: generous margin so elements in view after route change still fire; `once` keeps scroll smooth */
export const aureliaInViewViewport = {
  once: true,
  amount: "some",
  margin: "80px 0px 100px 0px"
};
