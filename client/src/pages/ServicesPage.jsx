import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { apiFetch } from "../lib/api";
import { showToast } from "../lib/toast";
import MotionSurface from "../components/MotionSurface";
import ScrollParallaxWrap from "../components/ScrollParallaxWrap";
import {
  aureliaHeroLine,
  aureliaHeroLinesContainer,
  aureliaInViewViewport,
  aureliaShopCardBody,
  aureliaShopCardImage,
  aureliaShopCardInnerReduced,
  aureliaShopCardMediaFrame,
  aureliaStaggerContainer,
  aureliaStaggerItem,
  aureliaStaggerItemShop
} from "../motion/aureliaPreset";

const categoryMeta = {
  makeup: { label: "💄 Makeup Services", image: "/images/hero-banner-3.png" },
  hair: { label: "💇 Hair Services", image: "/images/fkh1.jpg" },
  skin: { label: "✨ Skin & Facial Care", image: "/images/fkf1.jpg" },
  eyelash: { label: "👁 Eyelash Services", image: "/images/fkel.jpg" },
  nail: { label: "💅 Nail Services", image: "/images/hero-banner-2.png" },
  eyebrow: { label: "🌿 Eyebrow Services", image: "/images/fkeb.jpg" },
  waxing: { label: "🧴 Waxing Services", image: "/images/fkw1.jpg" }
};

const serviceImageByName = {
  "Bridal Makeup": "/images/bridal-user.png",
  "Event Makeup": "/images/event-user.png",
  "Festive Makeup": "/images/h1.jpg",
  "Mehndi Makeup": "/images/mehendi-user.png",
  "Mehendi Makeup": "/images/mehendi-user.png",

  "Hair Styling": "/images/fkh1.jpg",
  "Hair Curling": "/images/fkhc.jpg",
  "Hair Straightening": "/images/fkhs.jpg",
  "Hair Dry / Blow Dry": "/images/fkhb.jpg",
  "Hair Dye / Hair Coloring": "/images/fkhd.jpg",
  "Hair Coloring": "/images/fkhd.jpg",
  "Hair Colouring": "/images/fkhd.jpg",
  "Blow Dry": "/images/fkhb.jpg",
  "Other Hair Styling Needs": "/images/fkhr.jpg",

  "Facial Treatments": "/images/fkf1.jpg",
  "Skin Polishing": "/images/fkf2.jpg",
  "Anti-Shedding Treatment": "/images/fkas.jpg",

  "Eyelash Extensions": "/images/fkel.jpg",
  "Eyelash Extension": "/images/fkel.jpg",
  "Nail Extensions": "/images/hero-banner-2.png",
  "Nail Art": "/images/hero-banner-2.png",
  "Manicure": "/images/hero-banner-2.png",
  "Eyebrow Shaping": "/images/fkeb.jpg",

  "Full Body Waxing": "/images/fkw1.jpg",
  "Arms & Legs Waxing": "/images/fkw1.jpg"
};

const serviceImageByKey = new Map(
  Object.entries(serviceImageByName).map(([name, src]) => [name.trim().toLowerCase(), src])
);

/** When API names don’t match the catalog exactly, rotate per-category art so cards don’t all look identical. */
const categoryImagePool = {
  makeup: ["/images/hero-banner-3.png", "/images/event-makeup.jpg", "/images/pakistani-bridal-makeup.jpg", "/images/bridal-user.png"],
  hair: ["/images/fkh1.jpg", "/images/fkh2.jpg", "/images/fkh3.jpg", "/images/fkhc.jpg", "/images/fkhs.jpg"],
  skin: ["/images/fkf1.jpg", "/images/fkf2.jpg", "/images/fkas.jpg"],
  eyelash: ["/images/fkel.jpg", "/images/hero-banner-4.png"],
  nail: ["/images/hero-banner-2.png", "/images/fknl.jpg"],
  eyebrow: ["/images/fkeb.jpg", "/images/s3.jpg"],
  waxing: ["/images/fkw1.jpg", "/images/fkw2.jpg"]
};

const beautyCatalog = [
  { name: "Bridal Makeup", category: "makeup", price: 15000, durationMinutes: 180, description: "Premium bridal look with long-stay finish and detailed consultation." },
  { name: "Event Makeup", category: "makeup", price: 8000, durationMinutes: 120, description: "Glam look for parties, formal dinners, and special events." },
  { name: "Festive Makeup", category: "makeup", price: 6500, durationMinutes: 100, description: "Balanced festive look with skin prep, base, and eye enhancement." },
  { name: "Mehndi Makeup", category: "makeup", price: 10000, durationMinutes: 150, description: "Traditional mehndi makeup focused on camera-ready skin and eyes." },

  { name: "Hair Styling", category: "hair", price: 3500, durationMinutes: 60, description: "Classic and modern styling for casual or formal occasions." },
  { name: "Hair Curling", category: "hair", price: 2800, durationMinutes: 45, description: "Soft to defined curls using heat-protected professional techniques." },
  { name: "Hair Straightening", category: "hair", price: 3200, durationMinutes: 60, description: "Smooth straight finish with frizz control and shine boost." },
  { name: "Hair Dry / Blow Dry", category: "hair", price: 2000, durationMinutes: 40, description: "Quick blowout for volume, smoothness, and polished finish." },
  { name: "Hair Dye / Hair Coloring", category: "hair", price: 6000, durationMinutes: 120, description: "Root touch-up, global color, or fashion shades with safe products." },
  { name: "Other Hair Styling Needs", category: "hair", price: 4000, durationMinutes: 75, description: "Custom hair solutions based on your preferred style and event." },

  { name: "Facial Treatments", category: "skin", price: 4500, durationMinutes: 75, description: "Skin-refresh facial for glow, hydration, and deep cleansing." },
  { name: "Skin Polishing", category: "skin", price: 5000, durationMinutes: 80, description: "Exfoliation and polish treatment for brighter and smoother skin." },
  { name: "Anti-Shedding Treatment", category: "skin", price: 5500, durationMinutes: 90, description: "Targeted scalp and care routine to reduce excessive hair shedding." },

  { name: "Eyelash Extensions", category: "eyelash", price: 7000, durationMinutes: 110, description: "Natural to dramatic lash extensions customized to eye shape." },
  { name: "Nail Extensions", category: "nail", price: 6500, durationMinutes: 120, description: "Durable nail extension set with shape and finish of your choice." },
  { name: "Eyebrow Shaping", category: "eyebrow", price: 1200, durationMinutes: 25, description: "Neat eyebrow design to match face structure and style goals." },
  { name: "Full Body Waxing", category: "waxing", price: 6500, durationMinutes: 100, description: "Complete waxing care with hygiene-focused process and soothing finish." },
  { name: "Arms & Legs Waxing", category: "waxing", price: 3500, durationMinutes: 55, description: "Smooth waxing service for arms and legs with after-care guidance." }
];

function normServiceName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Map normalized catalog titles to the same art as `serviceImageByName` / category hero (API titles often differ only by spacing/case). */
const catalogImageByNorm = new Map();
for (const row of beautyCatalog) {
  const img =
    serviceImageByName[row.name] ||
    categoryMeta[row.category]?.image ||
    "/images/s1.jpg";
  catalogImageByNorm.set(normServiceName(row.name), img);
}

function normalizeCategory(raw) {
  const c = String(raw || "").trim().toLowerCase();
  if (categoryMeta[c]) return c;
  if (c.includes("makeup")) return "makeup";
  if (c.includes("hair")) return "hair";
  if (c.includes("skin") || c.includes("facial")) return "skin";
  if (c.includes("lash")) return "eyelash";
  if (c.includes("nail")) return "nail";
  if (c.includes("brow")) return "eyebrow";
  if (c.includes("wax")) return "waxing";
  return c || "hair";
}

function resolveServiceCardImage(service, listIndex) {
  const raw = (service.name || "").trim();
  const lower = raw.toLowerCase();
  const norm = normServiceName(raw);
  const exact = serviceImageByName[raw] || serviceImageByKey.get(lower);
  if (exact) return exact;

  const fromCatalog = catalogImageByNorm.get(norm);
  if (fromCatalog) return fromCatalog;

  if (lower.includes("lash")) return "/images/fkel.jpg";
  if (lower.includes("brow")) return "/images/fkeb.jpg";
  if (lower.includes("nail")) return "/images/hero-banner-2.png";
  if (lower.includes("wax")) return "/images/fkw1.jpg";
  if (lower.includes("facial") || lower.includes("skin") || lower.includes("polish")) return "/images/fkf1.jpg";
  if (lower.includes("bridal") || lower.includes("makeup") || lower.includes("mehndi") || lower.includes("glam"))
    return "/images/hero-banner-3.png";
  if (lower.includes("hair") || lower.includes("curl") || lower.includes("dry") || lower.includes("color"))
    return "/images/fkh3.jpg";

  const cat = String(service.category || "hair").toLowerCase();
  const pool = categoryImagePool[cat];
  const fallback = categoryMeta[cat]?.image || "/images/s1.jpg";
  if (!pool?.length) return fallback;
  return pool[listIndex % pool.length];
}

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [apiServices, setApiServices] = useState([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    apiFetch("/services")
      .then((data) => setApiServices(Array.isArray(data) ? data : []))
      .catch((err) => {
        setApiServices([]);
        showToast(err?.message || "Could not load services from server", "error");
      });
  }, []);

  const services = useMemo(() => {
    const catalogByName = new Map(
      beautyCatalog.map((item) => [item.name.toLowerCase(), item])
    );

    if (apiServices.length > 0) {
      return apiServices.map((service) => {
        const name = (service.name || service.title || "").trim();
        const catalogMatch = catalogByName.get(name.toLowerCase());
        return {
          _id: service._id,
          name,
          category: normalizeCategory(service.category || catalogMatch?.category),
          price: Number(service.price ?? catalogMatch?.price ?? 0),
          durationMinutes:
            service.durationMinutes || service.duration || catalogMatch?.durationMinutes || 45,
          description: service.description || catalogMatch?.description || ""
        };
      });
    }

    return beautyCatalog.map((item, index) => ({
      ...item,
      _id: `static-${index}-${item.name}`
    }));
  }, [apiServices]);

  const categories = useMemo(() => {
    const known = Object.keys(categoryMeta).filter((key) =>
      services.some((item) => item.category === key)
    );
    const custom = [
      ...new Set(
        services.map((item) => item.category).filter((cat) => cat && !categoryMeta[cat])
      )
    ];
    return ["all", ...known, ...custom];
  }, [services]);

  const filtered = services.filter((service) => {
    const category = String(service.category || "").toLowerCase();
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      service.name.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term) ||
      category.includes(term) ||
      (categoryMeta[category]?.label || "").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="space-y-8">
      <ScrollParallaxWrap>
      <MotionSurface as="section" className="relative h-[52vh] min-h-[360px] overflow-hidden" hoverLift={false}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/services-banner.png')"
          }}
        />
        <div className="absolute inset-0 bg-black/58" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-4">
          {reduceMotion ? (
            <div className="max-w-3xl text-center">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-200">Curated Beauty Collection</p>
              <h1 className="mb-3 text-4xl font-extrabold text-white md:text-5xl">Professional Services</h1>
              <p className="text-zinc-100">
                Explore premium options with clear duration, pricing, and details.
              </p>
            </div>
          ) : (
            <motion.div
              className="max-w-3xl text-center"
              variants={aureliaHeroLinesContainer}
              initial="hidden"
              animate="show"
            >
              <motion.p
                className="mb-2 text-xs uppercase tracking-[0.25em] text-zinc-200"
                variants={aureliaHeroLine}
              >
                Curated Beauty Collection
              </motion.p>
              <motion.h1
                className="mb-3 text-4xl font-extrabold text-white md:text-5xl"
                variants={aureliaHeroLine}
              >
                Professional Services
              </motion.h1>
              <motion.p className="text-zinc-100" variants={aureliaHeroLine}>
                Explore premium options with clear duration, pricing, and details.
              </motion.p>
            </motion.div>
          )}
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>

      <section className="page-shell space-y-6">
      <ScrollParallaxWrap invert>
      <MotionSurface className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-white p-5" shopFrame delay={0.02} inView>
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-green-300/35 blur-2xl" />
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="relative z-10">
            <h2 className="section-title">Our Services</h2>
            <p className="text-sm text-zinc-700">
              Forest-themed search experience with your maroon signature style.
            </p>
          </div>
          <p className="relative z-10 text-sm font-semibold text-zinc-900">{filtered.length} services available</p>
        </div>

        <div className="relative z-10 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="input border-emerald-300 bg-white/90"
            placeholder="Search service, category, or keywords..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  activeCategory === category
                    ? "bg-glowifyRed text-white"
                    : "border border-emerald-300 bg-white text-zinc-700 hover:border-glowifyRed hover:text-glowifyRed"
                }`}
              >
                {category === "all" ? "All Services" : categoryMeta[category]?.label || category}
              </button>
            ))}
          </div>
        </div>
      </MotionSurface>
      </ScrollParallaxWrap>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((service, index) => (
          <ScrollParallaxWrap key={service._id} invert={index % 2 === 1}>
          <MotionSurface
            as="article"
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm [transform-style:preserve-3d]"
            variants={aureliaStaggerItemShop}
            shopFrame
            inView
          >
            <motion.div
              variants={reduceMotion ? aureliaShopCardInnerReduced : aureliaShopCardMediaFrame}
              className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-zinc-100 md:min-h-[260px]"
            >
              <motion.img
                variants={reduceMotion ? aureliaShopCardInnerReduced : aureliaShopCardImage}
                src={resolveServiceCardImage(service, index)}
                alt={service.name}
                className="h-auto max-h-[280px] w-full object-contain object-center md:max-h-[320px]"
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.06,
                        y: -8,
                        transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.75 }
                      }
                }
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-wider text-zinc-900">
                {categoryMeta[service.category]?.label || service.category}
              </p>
            </motion.div>
            <motion.div variants={reduceMotion ? aureliaShopCardInnerReduced : aureliaShopCardBody} className="p-5">
              <h3 className="text-xl font-semibold tracking-tight">{service.name}</h3>
              <p className="my-3 min-h-12 text-zinc-600">{service.description}</p>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1">{service.durationMinutes} mins</span>
                <span className="font-semibold text-glowifyRed">PKR {service.price.toLocaleString()}</span>
              </div>
              <motion.a
                href="/book"
                className="btn-primary inline-block w-full text-center"
                whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Book This Service
              </motion.a>
            </motion.div>
          </MotionSurface>
          </ScrollParallaxWrap>
        ))}
      </div>

      {filtered.length === 0 && (
        <ScrollParallaxWrap>
        <MotionSurface as="article" className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700">
          No services matched your search. Try a different keyword or category.
        </MotionSurface>
        </ScrollParallaxWrap>
      )}

      <ScrollParallaxWrap>
      <MotionSurface className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-3 text-xl font-semibold">Why clients choose Glowify services</h3>
        <motion.div
          className="grid gap-3 md:grid-cols-3"
          {...(!reduceMotion
            ? {
                variants: aureliaStaggerContainer,
                initial: "hidden",
                whileInView: "show",
                viewport: aureliaInViewViewport
              }
            : { initial: false })}
        >
          <MotionSurface
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700"
            shopFrame
            variants={aureliaStaggerItem}
          >
            Certified beauticians and stylists for every category.
          </MotionSurface>
          <MotionSurface
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700"
            shopFrame
            variants={aureliaStaggerItem}
          >
            Transparent duration and price details before booking.
          </MotionSurface>
          <MotionSurface
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700"
            shopFrame
            variants={aureliaStaggerItem}
          >
            Live support and status tracking from one dashboard.
          </MotionSurface>
        </motion.div>
      </MotionSurface>
      </ScrollParallaxWrap>
      </section>
    </section>
  );
}
