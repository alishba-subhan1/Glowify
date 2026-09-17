import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import MotionSurface from "./MotionSurface";
import ScrollParallaxWrap from "./ScrollParallaxWrap";
import { aureliaEase, aureliaInViewViewport } from "../motion/aureliaPreset";

/** Top-level footer: CTA → column grid → legal strip */
const footerOrchestra = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.05 }
  }
};

/** Four columns inside dark band */
const footerColumnOrchestra = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.02 }
  }
};

function footerBlockVariants(reduceMotion) {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, y: 0, scale: 1 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } }
    };
  }
  return {
    hidden: { opacity: 0, y: 36, scale: 0.97, filter: "blur(7px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.58, ease: aureliaEase }
    }
  };
}

export default function SiteFooter() {
  const reduceMotion = useReducedMotion();
  const block = footerBlockVariants(reduceMotion);

  return (
    <footer className="mt-10 border-t border-zinc-200">
      <motion.div
        variants={footerOrchestra}
        initial="hidden"
        whileInView="visible"
        viewport={aureliaInViewViewport}
      >
        <motion.div variants={block}>
          <ScrollParallaxWrap>
          <MotionSurface as="section" className="bg-glowifyRed px-4 py-10 text-center text-white" hoverLift={false} entrance={false}>
            <h3 className="text-3xl font-bold md:text-4xl">Contact us for More Information</h3>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              We&apos;d love to assist you! 7 days a week from 9am to 8pm
            </p>
            <p className="mt-3 text-base font-medium">Call 963-920-8030</p>
            <p className="mt-1 text-base font-medium">mybeautyparlour.com@gmail.com</p>
          </MotionSurface>
          </ScrollParallaxWrap>
        </motion.div>

        <motion.div variants={footerColumnOrchestra} className="bg-black text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={block}>
              <ScrollParallaxWrap>
                <MotionSurface className="h-full rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4" hoverLift={false} entrance={false}>
                  <p className="mb-3 text-2xl font-semibold">More About MBP</p>
                  <div className="h-1 w-20 rounded-full bg-glowifyRed" />
                  <div className="mt-4 space-y-2 text-base text-zinc-200">
                    <Link className="block transition-colors hover:text-pink-300" to="/about">
                      About us
                    </Link>
                    <Link className="block transition-colors hover:text-pink-300" to="/contact">
                      Contact us
                    </Link>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      How it Work
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Career
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Privacy Policy
                    </a>
                  </div>
                </MotionSurface>
              </ScrollParallaxWrap>
            </motion.div>

            <motion.div variants={block}>
              <ScrollParallaxWrap invert>
                <MotionSurface className="h-full rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4" hoverLift={false} entrance={false}>
                  <p className="mb-3 text-2xl font-semibold">More Information</p>
                  <div className="h-1 w-20 rounded-full bg-glowifyRed" />
                  <div className="mt-4 space-y-2 text-base text-zinc-200">
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      All Project
                    </a>
                    <Link className="block transition-colors hover:text-pink-300" to="/services">
                      Home Service Salon
                    </Link>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      All Offers
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Promotion
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Advertisement
                    </a>
                  </div>
                </MotionSurface>
              </ScrollParallaxWrap>
            </motion.div>

            <motion.div variants={block}>
              <ScrollParallaxWrap>
                <MotionSurface className="h-full rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4" hoverLift={false} entrance={false}>
                  <p className="mb-3 text-2xl font-semibold">Follow us on</p>
                  <div className="h-1 w-20 rounded-full bg-glowifyRed" />
                  <div className="mt-4 flex gap-3">
                    {["Y", "I", "F", "in", "X"].map((item) => (
                      <span
                        key={item}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-sm text-zinc-100 transition-opacity hover:opacity-90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </MotionSurface>
              </ScrollParallaxWrap>
            </motion.div>

            <motion.div variants={block}>
              <ScrollParallaxWrap invert>
                <MotionSurface className="h-full rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4" hoverLift={false} entrance={false}>
                  <p className="mb-3 text-2xl font-semibold">Payment Policy</p>
                  <div className="h-1 w-20 rounded-full bg-glowifyRed" />
                  <div className="mt-4 space-y-2 text-base text-zinc-200">
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Privacy Policy
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Terms & Conditions
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Return & Cancellation Policy
                    </a>
                    <a className="block transition-colors hover:text-pink-300" href="#" onClick={(event) => event.preventDefault()}>
                      Shipping & Delivery Policy
                    </a>
                  </div>
                </MotionSurface>
              </ScrollParallaxWrap>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={block} className="border-t border-zinc-800 bg-black py-4 text-center text-xs text-zinc-400">
          <ScrollParallaxWrap>
          <span className="inline-block">
          © {new Date().getFullYear()} My Beauty Parlour. All Rights Reserved.
          </span>
          </ScrollParallaxWrap>
        </motion.div>
      </motion.div>
    </footer>
  );
}
