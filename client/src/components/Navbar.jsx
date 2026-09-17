import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "../lib/i18n";
import { aureliaEase } from "../motion/aureliaPreset";

/** Main routes — editorial text row (Aurelia-style shop nav) */
const shopNav = [
  { to: "/", key: "nav.home", fallback: "Home" },
  { to: "/about", key: "nav.about", fallback: "About" },
  { to: "/services", key: "nav.services", fallback: "Services" },
  { to: "/book", key: "nav.book", fallback: "Book" },
  { to: "/contact", key: "nav.contact", fallback: "Contact" }
];

const utilityNav = [{ to: "/admin", key: "nav.admin", fallback: "Admin" }];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const linkBase =
    "inline-block border-b-2 border-transparent pb-1 text-[10px] font-semibold uppercase tracking-[0.36em] transition-[color,border-color] duration-300";

  const navContainer = reduceMotion
    ? {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.015, delayChildren: 0.012 }
        }
      }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.022, delayChildren: 0.035 }
        }
      };

  const navItem = reduceMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.14, ease: "linear" } }
      }
    : {
        hidden: { opacity: 0, y: 6 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.28, ease: aureliaEase }
        }
      };

  return (
    <motion.header
      className={`top-0 z-40 w-full ${
        isHome
          ? "absolute border-b border-white/10 bg-gradient-to-b from-black/55 via-black/25 to-transparent"
          : "sticky border-b border-zinc-200/70 bg-[#f8f6f3]/90 backdrop-blur-md"
      }`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.16, ease: "linear" }
          : { duration: 0.38, ease: aureliaEase }
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 py-5 md:px-10 md:py-6">
        <Link
          to="/"
          className={`shrink-0 font-display text-[1.65rem] font-medium lowercase leading-none tracking-[-0.02em] transition-opacity hover:opacity-85 md:text-[2rem] ${
            isHome ? "text-white" : "text-zinc-950"
          }`}
        >
          Glow
          <span className="text-glowifyRed">ify</span>
          <span
            className={`ml-1.5 text-[0.45em] font-sans font-medium normal-case tracking-[0.22em] ${
              isHome ? "text-white/45" : "text-zinc-400"
            }`}
          >
            Parlour
          </span>
        </Link>

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border md:hidden ${
            isHome ? "border-white/35 text-white" : "border-zinc-300 text-zinc-800"
          }`}
        >
          <span className="flex flex-col gap-1" aria-hidden>
            <span className="h-1 w-1 rounded-full bg-current" />
            <span className="h-1 w-1 rounded-full bg-current" />
            <span className="h-1 w-1 rounded-full bg-current" />
          </span>
        </button>

        <motion.nav
          className={`${mobileOpen ? "flex" : "hidden"} absolute left-4 right-4 top-full flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl md:static md:flex md:flex-row md:items-end md:justify-end md:gap-x-7 md:gap-y-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-x-10`}
          variants={navContainer}
          initial="hidden"
          animate="show"
        >
          {shopNav.map((item) => (
            <motion.span key={item.to} className="contents" variants={navItem}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    linkBase,
                    isHome
                      ? isActive
                        ? "border-white text-white"
                        : "text-white/55 hover:border-white/35 hover:text-white"
                      : isActive
                        ? "border-glowifyRed text-zinc-900"
                        : "text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
                  ].join(" ")
                }
              >
                onClick={() => setMobileOpen(false)}
                {t(item.key, item.fallback)}
              </NavLink>
            </motion.span>
          ))}

          {utilityNav.map((item) => (
            <motion.span key={item.to} className="contents" variants={navItem}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    linkBase,
                    "ml-1 md:ml-3 md:border-l md:pl-8",
                    isHome ? "md:border-white/18" : "md:border-zinc-200",
                    isHome
                      ? isActive
                        ? "border-white text-white"
                        : "text-white/45 hover:border-white/30 hover:text-white/85"
                      : isActive
                        ? "border-glowifyRed text-zinc-800"
                        : "text-zinc-400 hover:border-zinc-300 hover:text-zinc-700"
                  ].join(" ")
                }
              >
                onClick={() => setMobileOpen(false)}
                {t(item.key, item.fallback)}
              </NavLink>
            </motion.span>
          ))}
        </motion.nav>
      </div>
    </motion.header>
  );
}
