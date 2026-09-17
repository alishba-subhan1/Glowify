import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import MotionSurface from "../components/MotionSurface";
import ScrollParallaxWrap from "../components/ScrollParallaxWrap";
import {
  aureliaEase,
  aureliaInViewViewport,
  bannerLineDuration
} from "../motion/aureliaPreset";

const MotionLink = motion.create(Link);

const heroSlides = [
  {
    tagline: "Glowify parlour · Lahore",

    title: "Colour, skin & camera-ready makeup tutorials",

    lines: ["Brushes, blends & honest product talk", "Book your chair · MM Alam Road"],

    focalDesktop: "center 42%",

    focalMobile: "56% 28%",

    image: "/images/hero-banner-1.png",
  },

  {
    tagline: "Hands & nails studio",

    title: "Manicures that stay glossy through your week",

    lines: ["Shaping · gel · spa soak", "Quiet room · careful detail"],

    focalDesktop: "center 38%",

    focalMobile: "center 35%",

    image: "/images/hero-banner-2.png",
  },

  {
    tagline: "Colour & lips",

    title: "Rich pigments and soft, even finish",

    lines: ["Editorial lips · bridal trials · evening glam", "Palettes curated for our light"],

    focalDesktop: "center 32%",

    focalMobile: "center 30%",

    image: "/images/hero-banner-3.png",
  },

  {
    tagline: "Bridal parlour suite",

    title: "Wedding-ready looks, peacefully timed",

    lines: ["Trials · mehndi-eve glam · reception polish", "Stylists & artists · MM Alam Rd"],

    focalDesktop: "center 30%",

    focalMobile: "52% 28%",

    image: "/images/hero-banner-4.png",
  },
];

const scheduleMarquee = [
  "Mon – Sat · 10:00 – 19:00",

  "Sunday · By appointment",

  "Call · +92 300 0000000",

  "MM Alam Road · Lahore",
];

const services = [
  { title: "Cut / Colour / Style", image: "/images/s1.jpg" },

  { title: "Hair extension", image: "/images/fkh3.jpg" },

  { title: "Eyelash extension", image: "/images/fkel.jpg" },

  { title: "Semi-permanent eyebrow", image: "/images/fkeb.jpg" },

  { title: "Makeup art", image: "/images/hero-banner-3.png" },

  { title: "Bridal / wedding", image: "/images/bridal-user.png" },
];

const testimonials = [
  {
    name: "Teresa R.",

    text: "Top notch service — stylists who understand what reads on camera and in real life.",
  },

  {
    name: "Gillian F.",

    text: "A calm room, careful hands, and the kind of attention you wish every appointment had.",
  },

  {
    name: "Nadia N.",

    text: "Gorgeous space and real talent. I left feeling like myself, only sharper.",
  },
];

const testimonialAvatars = [
  { src: "/images/hero-banner-1.png", cls: "left-2 top-2 rotate-[-4deg]" },

  { src: "/images/c1.jpg", cls: "left-28 top-10 rotate-[3deg]" },

  { src: "/images/hero-banner-2.png", cls: "left-10 top-28 rotate-[2deg]" },

  { src: "/images/hero-banner-4.png", cls: "right-2 top-2 rotate-[4deg]" },

  { src: "/images/c2.jpg", cls: "right-28 top-12 rotate-[-3deg]" },

  { src: "/images/hero-banner-3.png", cls: "right-10 top-32 rotate-[3deg]" },
];

const galleryShots = [
  "/images/s1.jpg",
  "/images/fkh3.jpg",
  "/images/fkel.jpg",
  "/images/hero-banner-3.png",
  "/images/fkeb.jpg",
  "/images/bridal-user.png",
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const reduceMotion = useReducedMotion();

  const sectionReveal = useMemo(
    () => ({
      parent: {
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduceMotion ? 0 : 0.045,
            delayChildren: reduceMotion ? 0 : 0.025,
          },
        },
      },
      item: {
        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduceMotion ? 0.1 : 0.3,
            ease: aureliaEase,
          },
        },
      },
    }),
    [reduceMotion],
  );

  const viewSoft = { once: true, amount: 0.14, margin: "0px 0px -12% 0px" };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5800);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5200);

    return () => clearInterval(timer);
  }, []);

  const marqueeItems = [...scheduleMarquee, ...scheduleMarquee];

  const heroTextInitial = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 10 };

  const heroTextAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  const heroTextExit = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -6 };

  return (
    <section className="bg-[#f7f6f4]">
      <section className="relative min-h-[640px] h-[min(92vh,900px)] overflow-hidden bg-zinc-950">
        <div className="slider-shell !rounded-none">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`slider-slide ${index === activeSlide ? "is-active" : ""}`}
              style={{
                "--hero-focus-desktop": slide.focalDesktop,

                "--hero-focus-mobile": slide.focalMobile,
              }}
            >
              <img
                className="slider-slide-img"
                src={slide.image}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/80 via-black/45 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent" />

        <div className="editorial-marquee-shell absolute left-0 right-0 top-[5.5rem] z-20 overflow-hidden border-y border-white/10 bg-black/35 backdrop-blur-[3px]">
          <div className="editorial-marquee-track">
            {marqueeItems.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex shrink-0 items-center gap-4"
              >
                <span className="whitespace-nowrap">{item}</span>

                <span className="text-[7px] text-white/20" aria-hidden>
                  ●
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 pt-[11rem] md:px-10 md:pb-14 md:pt-[12.5rem] lg:px-14 lg:pb-20 lg:pt-[13rem]">
          <div className="w-full translate-y-2 md:translate-y-6 lg:max-w-[32rem] lg:translate-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={heroTextInitial}
                animate={heroTextAnimate}
                exit={heroTextExit}
                transition={{
                  duration: reduceMotion ? 0.12 : bannerLineDuration,
                  ease: aureliaEase,
                }}
              >
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-glowifyRed/90">
                  {heroSlides[activeSlide].tagline}
                </p>

                <div className="mb-5 h-1 w-16 bg-glowifyRed" aria-hidden />

                <h1 className="font-display text-[2.35rem] font-medium lowercase leading-[1.28] tracking-[-0.02em] text-glowifyRed drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] sm:text-[3rem] md:text-[3.65rem] md:leading-[1.24]">
                  {heroSlides[activeSlide].title}
                </h1>

                <ul
                  className="mt-6 space-y-2.5 border-l border-white/35 pl-4 font-sans"
                  aria-label="Highlights"
                >
                  {heroSlides[activeSlide].lines.map((line) => (
                    <li
                      key={line}
                      className="text-[10px] font-medium uppercase tracking-[0.34em] text-white"
                    >
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-wrap gap-3">
                  <MotionLink
                    to="/services"
                    className="inline-flex border border-white/25 px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.34em] text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-900"
                    whileHover={
                      reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
                    }
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  >
                    View services
                  </MotionLink>

                  <MotionLink
                    to="/book"
                    className="inline-flex items-center bg-glowifyRed px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.34em] text-white transition-colors hover:bg-red-900"
                    whileHover={
                      reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
                    }
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  >
                    Book now
                  </MotionLink>
                </div>
              </motion.div>
              {/* <MotionLink
  to="/contact"
  className="inline-flex bg-glowifyRed px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.34em] text-white transition-colors hover:bg-red-900"
  whileHover={
    reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
  }
  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
>
  contact us
</MotionLink> */}
            </AnimatePresence>
          </div>

          <div className="mt-12 flex w-full flex-wrap items-end justify-between gap-6 lg:max-w-7xl">
            <div className="flex gap-4">
              {heroSlides.map((slide, index) => (
                <motion.button
                  key={slide.title}
                  type="button"
                  layout
                  className={`h-1 rounded-full ${activeSlide === index ? "bg-white" : "bg-white/35 hover:bg-white/55"}`}
                  animate={{
                    width: activeSlide === index ? 56 : 32,
                    opacity: activeSlide === index ? 1 : 0.55,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="hidden gap-2 sm:flex">
              <motion.button
                type="button"
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center border border-white/20 text-lg text-white hover:border-glowifyRed hover:text-glowifyRed"
                whileHover={
                  reduceMotion
                    ? undefined
                    : { scale: 1.06, borderColor: "rgba(250, 250, 250, 0.55)" }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                onClick={() =>
                  setActiveSlide((prev) =>
                    prev === 0 ? heroSlides.length - 1 : prev - 1,
                  )
                }
              >
                ‹
              </motion.button>

              <motion.button
                type="button"
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center border border-white/20 text-lg text-white hover:border-glowifyRed hover:text-glowifyRed"
                whileHover={
                  reduceMotion
                    ? undefined
                    : { scale: 1.06, borderColor: "rgba(250, 250, 250, 0.55)" }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                onClick={() =>
                  setActiveSlide((prev) => (prev + 1) % heroSlides.length)
                }
              >
                ›
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell space-y-20 py-16 md:py-24">
        <section className="space-y-12">
          <ScrollParallaxWrap>
          <motion.div
            className="mx-auto flex max-w-4xl flex-col items-center border-b border-zinc-200 pb-12 text-center"
            variants={sectionReveal.item}
            initial="hidden"
            whileInView="show"
            viewport={viewSoft}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-glowifyRed">
              The studio
            </p>

            <h2 className="font-display mt-4 text-4xl font-medium lowercase text-zinc-900 md:text-6xl md:tracking-[-0.03em]">
              About styles
            </h2>

            <p className="mx-auto mt-6 max-w-2xl font-sans text-sm font-normal leading-7 tracking-wide text-zinc-600 md:text-[15px]">
              Glowify is a salon experience shaped like a small editorial —
              thoughtful lighting, unhurried service, and details you feel more
              than you see.
            </p>
          </motion.div>
          </ScrollParallaxWrap>

          <motion.div
            className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12"
            variants={sectionReveal.parent}
            initial="hidden"
            whileInView="show"
            viewport={viewSoft}
          >
            <ScrollParallaxWrap invert={false}>
            <motion.div variants={sectionReveal.item}>
              <MotionSurface
                as="article"
                className="space-y-4"
                delay={0.02}
                hoverLift={false}
                shopFrame
              >
                <motion.div
                  className="overflow-hidden border border-zinc-200/90 bg-zinc-100"
                  whileHover={
                    reduceMotion ? undefined : { scale: 1.01, transition: { duration: 0.35 } }
                  }
                >
                  <motion.img
                    className="h-[min(52vw,440px)] w-full object-cover object-top md:h-[460px]"
                    src="/images/girl.png"
                    alt="Makeup ritual"
                    whileHover={
                      reduceMotion ? undefined : { scale: 1.04, transition: { duration: 0.45 } }
                    }
                  />
                </motion.div>
              </MotionSurface>
            </motion.div>
            </ScrollParallaxWrap>

            <ScrollParallaxWrap invert>
            <motion.div variants={sectionReveal.item}>
              <MotionSurface
                as="article"
                className="flex h-full flex-col justify-center border border-zinc-200/90 bg-[#fdfcfb] px-6 py-8 md:p-10"
                delay={0.06}
                hoverLift={false}
                shopFrame
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.36em] text-glowifyRed">
                  Editorial brief
                </p>

                <h3 className="font-display mt-3 text-[2.5rem] font-medium lowercase leading-none text-zinc-900 md:text-[3rem] md:tracking-[-0.03em]">
                  Time for a change?
                </h3>

                <motion.div
                  className="my-8 h-px w-full origin-left bg-zinc-200/90"
                  initial={reduceMotion ? false : { scaleX: 0.35, opacity: 0.5 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, ease: aureliaEase }}
                />

                <p className="font-sans text-[15px] font-normal leading-8 tracking-wide text-zinc-700">
                  In a calm, elegant setting we design looks that suit your rhythm
                  — consultation, ritual, finish. Bridal, glam, or everyday
                  polish: one quiet booking flow, predictable timing, luminous
                  results.
                </p>

                <div className="mt-10 flex flex-wrap gap-6 border-t border-zinc-200/80 pt-10">
                  <MotionLink
                    to="/about"
                    className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-800 underline decoration-glowifyRed/55 underline-offset-8 hover:text-glowifyRed"
                    whileHover={reduceMotion ? undefined : { x: 4 }}
                  >
                    Story
                  </MotionLink>

                  <MotionLink
                    to="/book"
                    className="text-[10px] font-semibold uppercase tracking-[0.3em] text-glowifyRed hover:opacity-80"
                    whileHover={reduceMotion ? undefined : { x: 4 }}
                  >
                    Reserve →
                  </MotionLink>
                </div>
              </MotionSurface>
            </motion.div>
            </ScrollParallaxWrap>
          </motion.div>
        </section>

        <section>
          <ScrollParallaxWrap>
          <motion.div
            className="mb-12 flex flex-col gap-8 border-b border-zinc-200 pb-12 md:flex-row md:items-end md:justify-between md:gap-4"
            variants={sectionReveal.item}
            initial="hidden"
            whileInView="show"
            viewport={viewSoft}
          >
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-glowifyRed">
                Treatments · Shop-style index
              </p>

              <h2 className="font-display mt-3 text-4xl font-medium lowercase tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
                Featured services
              </h2>
            </div>

            <MotionLink
              to="/services"
              className="inline-flex shrink-0 self-start text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-600 underline decoration-glowifyRed/50 underline-offset-[10px] hover:text-glowifyRed md:self-auto"
              whileHover={reduceMotion ? undefined : { y: -2 }}
            >
              Browse catalogue
            </MotionLink>
          </motion.div>
          </ScrollParallaxWrap>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((item, index) => (
              <ScrollParallaxWrap key={item.title} invert={index % 2 === 1} className="h-full">
              <motion.div
                variants={sectionReveal.item}
                initial="hidden"
                whileInView="show"
                viewport={aureliaInViewViewport}
                className="h-full"
              >
                <MotionSurface
                  as="article"
                  className="group flex h-full flex-col border border-zinc-200/90 bg-[#fafaf8]"
                  entrance={false}
                  shopFrame
                >
                  <div className="overflow-hidden">
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      className="aspect-[3/4] w-full object-cover"
                      initial={reduceMotion ? false : { scale: 1.09, opacity: 0.85 }}
                      whileInView={
                        reduceMotion
                          ? undefined
                          : { scale: 1, opacity: 1, transition: { duration: 0.65, ease: aureliaEase } }
                      }
                      viewport={aureliaInViewViewport}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { scale: 1.06, transition: { type: "spring", stiffness: 280, damping: 28 } }
                      }
                    />
                  </div>

                  <div className="flex flex-1 flex-col border-t border-zinc-200/80 px-5 py-6">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-900">
                      {item.title}
                    </h3>

                    <MotionLink
                      to="/services"
                      className="mt-5 inline-flex text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-500 underline decoration-transparent underline-offset-8 transition hover:text-glowifyRed hover:decoration-glowifyRed/70"
                      whileHover={reduceMotion ? undefined : { x: 3 }}
                    >
                      View · From menu
                    </MotionLink>
                  </div>
                </MotionSurface>
              </motion.div>
              </ScrollParallaxWrap>
            ))}
          </div>
        </section>

        <motion.div
          className="grid gap-0 border-y border-zinc-200 lg:grid-cols-2"
          variants={sectionReveal.parent}
          initial="hidden"
          whileInView="show"
          viewport={viewSoft}
        >
          <ScrollParallaxWrap invert={false}>
          <motion.div variants={sectionReveal.item}>
            <MotionSurface
              as="article"
              className="h-full border-zinc-200 px-6 py-12 lg:border-r lg:px-10 lg:py-16"
              delay={0}
              hoverLift={false}
              shopFrame
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-glowifyRed">
                01
              </span>

              <h3 className="font-display mt-4 text-3xl font-medium lowercase md:text-[2.125rem]">
                A warm welcome
              </h3>

              <p className="mt-6 font-sans text-sm leading-7 tracking-wide text-zinc-600 md:text-[15px]">
                Personal attention, restrained interiors, staff who listen before
                they reach for a brush.
              </p>
            </MotionSurface>
          </motion.div>
          </ScrollParallaxWrap>

          <ScrollParallaxWrap invert>
          <motion.div variants={sectionReveal.item}>
            <MotionSurface
              as="article"
              className="h-full px-6 py-12 lg:px-10 lg:py-16"
              delay={0.05}
              hoverLift={false}
              shopFrame
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-glowifyRed">
                02
              </span>

              <h3 className="font-display mt-4 text-3xl font-medium lowercase md:text-[2.125rem]">
                Ready to glowify?
              </h3>

              <p className="mt-6 font-sans text-sm leading-7 tracking-wide text-zinc-600 md:text-[15px]">
                We choreograph appointments so you spend less time coordinating
                and more time enjoying the reveal.
              </p>

              <MotionLink
                to="/book"
                className="mt-10 inline-block border border-zinc-900 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-900 transition hover:border-glowifyRed hover:bg-glowifyRed hover:text-white"
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Book
              </MotionLink>
            </MotionSurface>
          </motion.div>
          </ScrollParallaxWrap>
        </motion.div>

        <ScrollParallaxWrap>
        <MotionSurface
          as="section"
          className="relative border border-zinc-200/90 bg-[#f3f1ee] px-5 py-14 md:px-12 md:py-20"
          hoverLift={false}
          shopFrame
        >
          <div className="mx-auto mb-8 grid max-w-md grid-cols-3 gap-3 md:hidden">
            {testimonialAvatars.map((item, index) => (
              <MotionSurface
                key={`${item.src}-${index}-mobile`}
                className="overflow-hidden rounded-sm border border-zinc-200/90"
                delay={index * 0.04}
                hoverLift
                shopFrame
              >
                <img
                  src={item.src}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              </MotionSurface>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-6 hidden h-[200px] md:block">
            {testimonialAvatars.map((item, index) => (
              <motion.img
                key={`${item.src}-${index}-floater`}
                src={item.src}
                alt=""
                className={`absolute h-[5.35rem] w-[5.35rem] rounded-sm border border-zinc-300/90 object-cover shadow-sm lg:h-28 lg:w-28 ${item.cls}`}
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -8, 0] }
                }
                transition={{
                  duration: 3.6 + index * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-3xl pt-8 text-center md:pt-44">
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-glowifyRed">
              Testimonials
            </p>

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeTestimonial}
                initial={heroTextInitial}
                animate={heroTextAnimate}
                exit={heroTextExit}
                transition={{
                  duration: reduceMotion ? 0.12 : bannerLineDuration,
                  ease: aureliaEase,
                }}
                className="mt-10 font-display text-[1.875rem] font-normal lowercase leading-snug tracking-tight text-zinc-900 md:text-[2.75rem]"
              >
                “{testimonials[activeTestimonial].text}”
              </motion.blockquote>
            </AnimatePresence>

            <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500">
              — {testimonials[activeTestimonial].name}
            </p>

            <MotionLink
              to="/about"
              className="mt-12 inline-flex border border-zinc-900 px-10 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-900 transition hover:border-glowifyRed hover:bg-glowifyRed hover:text-white"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Read stories
            </MotionLink>

            <div className="mt-12 flex justify-center gap-6">
              {testimonials.map((item, index) => (
                <motion.button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTestimonial(index)}
                  layout
                  className={`h-px rounded-none ${
                    index === activeTestimonial ? "bg-glowifyRed" : "bg-zinc-300 hover:bg-zinc-400"
                  }`}
                  animate={{
                    width: index === activeTestimonial ? 56 : 24,
                    opacity: index === activeTestimonial ? 1 : 0.55,
                  }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  aria-label={`Testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </MotionSurface>
        </ScrollParallaxWrap>

          <ScrollParallaxWrap>
        <MotionSurface
          as="section"
          className="border border-zinc-200/90 bg-white p-6 md:p-10"
          hoverLift={false}
          shopFrame
        >
          <motion.div
            className="mb-10 flex flex-col gap-6 border-b border-zinc-200 pb-10 md:flex-row md:items-end md:justify-between"
            variants={sectionReveal.item}
            initial="hidden"
            whileInView="show"
            viewport={viewSoft}
          >
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-glowifyRed">
                Lookbook
              </p>

              <h2 className="font-display mt-2 text-3xl font-medium lowercase md:text-[2.375rem]">
                Inside Glowify
              </h2>
            </div>

            <MotionLink
              to="/services"
              className="inline-flex shrink-0 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-500 underline underline-offset-[10px] decoration-glowifyRed/35 hover:text-glowifyRed"
              whileHover={reduceMotion ? undefined : { y: -2 }}
            >
              See treatments
            </MotionLink>
          </motion.div>

          <div className="gallery-shell overflow-hidden border border-zinc-200/70">
            <div className="gallery-track">
              {[...galleryShots, ...galleryShots].map((image, index) => (
                <MotionSurface
                  className="gallery-card rounded-none border-none"
                  key={`${image}-${index}`}
                  entrance={false}
                  delay={Math.min(index, 12) * 0.025}
                >
                  <motion.img
                    src={image}
                    alt=""
                    className="h-full min-h-[200px] w-full object-cover"
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { scale: 1.05, transition: { duration: 0.35, ease: aureliaEase } }
                    }
                  />
                </MotionSurface>
              ))}
            </div>
          </div>
        </MotionSurface>
        </ScrollParallaxWrap>

        <MotionSurface
          as="section"
          className="relative overflow-hidden border border-zinc-800 bg-gradient-to-br from-[#161616] via-zinc-900 to-[#3a0814] px-8 py-14 text-white md:px-16 md:py-20"
          hoverLift={false}
          shopFrame
        >
          <motion.div
            className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-glowifyRed/25 blur-[100px]"
            aria-hidden
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }
            }
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <ScrollParallaxWrap>
          <motion.div
            className="relative mx-auto max-w-3xl text-center"
            variants={sectionReveal.item}
            initial="hidden"
            whileInView="show"
            viewport={viewSoft}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-glowifyRed">
              Private booking
            </p>

            <h2 className="font-display mt-5 text-4xl font-medium lowercase md:text-5xl">
              Your next appointment
            </h2>

            <p className="mx-auto mt-6 max-w-lg font-sans text-sm leading-7 tracking-wide text-zinc-300">
              Choose a slot, receive confirmation, arrive to a calm room already
              prepared for you.
            </p>

            <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
              <MotionLink
                to="/book"
                className="inline-flex w-full max-w-[220px] justify-center bg-white px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-900 transition hover:bg-zinc-200"
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Start
              </MotionLink>

              <MotionLink
                to="/services"
                className="inline-flex w-full max-w-[220px] justify-center border border-white/30 px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-white transition hover:border-white"
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Catalogue
              </MotionLink>
            </div>
          </motion.div>
          </ScrollParallaxWrap>
        </MotionSurface>
      </section>
    </section>
  );
}
