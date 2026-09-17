import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import MotionSurface from "../components/MotionSurface";
import ScrollParallaxWrap from "../components/ScrollParallaxWrap";
import { aureliaEase, aureliaInViewViewport } from "../motion/aureliaPreset";

const coreValues = [
  {
    title: "Trust",
    text: "Trust is the cornerstone of our relationships with users, professionals, and partners. We prioritize customer satisfaction and mutual respect in every interaction."
  },
  {
    title: "Teamwork",
    text: "Beauty results are not the work of one person alone. We build a collaborative community where beauticians, suppliers, and clients grow together."
  },
  {
    title: "Time",
    text: "We value your time and keep booking, consultation, and service delivery smooth so every visit feels organized and dependable."
  },
  {
    title: "Quality",
    text: "Quality includes service excellence, cost-effectiveness, product standards, and customer care. We maintain high standards at every step."
  },
  {
    title: "Respect",
    text: "Respect is fundamental to our culture. Every member of our community is treated with dignity, professionalism, and care."
  }
];

const whyChooseUs = [
  {
    no: "01",
    title: "Personalized Experience",
    text: "Your beauty journey is unique. We prioritize personalization with curated services tailored to your style and goals."
  },
  {
    no: "02",
    title: "Community-Centric Approach",
    text: "Join a vibrant community of beauty enthusiasts and professionals where tips, recommendations, and growth are shared."
  },
  {
    no: "03",
    title: "Unparalleled Convenience",
    text: "Browse services, compare options, and book appointments quickly from home with clear details and hassle-free flow."
  },
  {
    no: "04",
    title: "Commitment to Quality",
    text: "We partner with trained professionals and trusted products to deliver consistently high-quality beauty experiences."
  },
  {
    no: "05",
    title: "Safety and Hygiene",
    text: "Your health and safety come first. Our partners maintain strict hygiene and cleanliness standards."
  }
];

const joinCards = [
  {
    title: "Join As Beautician",
    text: "Are you a skilled beautician looking to showcase your talent to a wider audience? Join us and expand your clientele today!",
    image: "/images/jbt.jpg"
  },
  {
    title: "Join As Celebrity",
    text: "Seeking state-of-the-art beauty services in your region? Join our platform and explore a world of beauty options.",
    image: "/images/jcl.jpg"
  },
  {
    title: "Join As User",
    text: "Are you a renowned figure in the beauty industry? Join our community and connect while boosting your visibility.",
    image: "/images/jus.png"
  },
  {
    title: "Join As Supplier",
    text: "Do you offer beauty products or services? Join as a supplier and connect with professionals and enthusiasts.",
    image: "/images/jsp.jpg"
  }
];

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="page-shell space-y-8">
      <ScrollParallaxWrap>
      <MotionSurface as="section" className="rounded-2xl border border-zinc-200 bg-white p-6 text-center md:p-8" inView>
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-glowifyRed">About us</p>
        <h1 className="text-4xl font-extrabold text-zinc-900 md:text-5xl">
          Welcome to <span className="text-glowifyRed">Glowify</span>
        </h1>
        <p className="mx-auto mt-4 max-w-6xl text-sm leading-7 text-zinc-700 md:text-base">
          Welcome to Glowify, where beauty is not just a service, but a personalized experience tailored for you. We
          understand the importance of feeling confident and beautiful, and we are dedicated to making your beauty
          journey effortless, enjoyable, and rewarding.
        </p>
        <p className="mx-auto mt-4 max-w-6xl text-sm leading-7 text-zinc-700 md:text-base">
          At Glowify, we are more than an online platform for finding beauty services. We are a community of beauty
          enthusiasts, professionals, and trendsetters. Our goal is to empower every individual to embrace their
          unique beauty with diverse services for every style, occasion, and preference.
        </p>
      </MotionSurface>
      </ScrollParallaxWrap>

      <ScrollParallaxWrap invert>
      <MotionSurface as="section" className="overflow-hidden rounded-2xl border border-zinc-200 bg-white" inView>
        <img
          src="/images/ab3.png"
          alt="Woman with makeup kit and mirror"
          className="h-[320px] w-full bg-[#efefef] object-contain md:h-[430px]"
        />
      </MotionSurface>
      </ScrollParallaxWrap>

      <ScrollParallaxWrap>
      <MotionSurface as="section" className="rounded-2xl border border-zinc-200 bg-[#faf1f5] p-6 md:p-8" inView delay={0.02}>
        <h2 className="text-3xl font-bold text-zinc-900">
          Our <span className="text-glowifyRed">Vision</span>
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-700 md:text-base">
          Our vision is simple yet ambitious: to create one of the largest beauty communities of beauticians and
          beauty services. We aim to redefine the beauty experience, making it accessible, convenient, and inclusive
          for everyone through innovation, creativity, and community engagement.
        </p>
      </MotionSurface>
      </ScrollParallaxWrap>

      <ScrollParallaxWrap invert>
      <MotionSurface as="section" className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8" delay={0.02}>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-glowifyRed">Our Core Values</p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-900">How We Work</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ScrollParallaxWrap>
          <MotionSurface className="flex min-h-48 items-center justify-center rounded-xl border border-glowifyRed bg-glowifyRed p-4 text-center" hoverLift={false} inView>
            <h3 className="text-4xl font-extrabold text-white">Our Core Values</h3>
          </MotionSurface>
          </ScrollParallaxWrap>
          {coreValues.map((item, index) => (
            <ScrollParallaxWrap key={item.title} invert={index % 2 === 1}>
            <MotionSurface
              className={`rounded-xl border p-4 ${
                index % 2 === 0 ? "border-[#8f1239] bg-[#8f1239]" : "border-[#a30f43] bg-[#a30f43]"
              }`}
              delay={index * 0.022}
              hoverLift={false}
              inView
            >
              <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm leading-6 text-white/95">{item.text}</p>
            </MotionSurface>
            </ScrollParallaxWrap>
          ))}
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>

      <ScrollParallaxWrap>
      <MotionSurface as="section" className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8" delay={0.03}>
        <h2 className="mb-4 text-2xl font-semibold">
          Why <span className="text-glowifyRed">Choose Us?</span>
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, index) => (
            <ScrollParallaxWrap key={item.no} invert={index % 2 === 1}>
            <MotionSurface
              className="rounded-xl border border-[#edd6de] bg-[#fcf4f7] p-4"
              delay={index * 0.028}
              inView
            >
              <p className="text-3xl font-bold tracking-[0.18em] text-[#c65a7f]">{item.no}</p>
              <h3 className="mt-1 text-base font-semibold text-glowifyRed">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-700">{item.text}</p>
            </MotionSurface>
            </ScrollParallaxWrap>
          ))}
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>

      <ScrollParallaxWrap invert>
      <MotionSurface as="section" className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8" delay={0.04}>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-glowifyRed">Join Beautician Community</p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-900">
            Explore <span className="text-glowifyRed">Endless Opportunities</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-700">
            Ready to be part of something special? Join our beauty community and grow with us.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
        {joinCards.map((item, index) => (
            <ScrollParallaxWrap key={item.title} invert={index % 2 === 1}>
            <MotionSurface
              as="article"
              className="group relative overflow-hidden rounded-xl border border-[#e8d7de] bg-white shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-[#7a001b]/20"
              delay={index * 0.038}
              hoverLift={true}
              inView
            >
              <div className="absolute inset-y-0 right-0 w-[44%] overflow-hidden">
                {reduceMotion ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    initial={{ scale: 1.12, opacity: 0.8 }}
                    whileInView={{
                      scale: 1,
                      opacity: 1,
                      transition: { duration: 0.62, ease: aureliaEase }
                    }}
                    viewport={aureliaInViewViewport}
                  />
                )}
                <div className="absolute inset-0 bg-black/10" />
              </div>
              <div className="absolute inset-y-0 right-[38%] w-24 rounded-r-full bg-white" />
              <div className="relative z-10 w-[68%] p-4 md:p-5">
                <h3 className="text-3xl font-semibold text-glowifyRed">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-700">{item.text}</p>
                <Link to="/book" className="btn-primary mt-4 inline-block rounded-full px-5 py-2 text-sm">
                  JOIN NOW
                </Link>
              </div>
          </MotionSurface>
            </ScrollParallaxWrap>
        ))}
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>

    </section>
  );
}
