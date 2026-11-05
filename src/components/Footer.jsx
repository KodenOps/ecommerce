import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaPinterestP } from "react-icons/fa";
import { FiArrowRight, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { GiDaisy } from "react-icons/gi";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All rituals", href: "/Shop" },
      { label: "Skincare", href: "/Shop?category=Skincare" },
      { label: "Lips & blush", href: "/Shop?category=Lips%20%26%20Blush" },
      { label: "Body glow", href: "/Shop?category=Body%20Glow" },
      { label: "Gift sets", href: "/Shop?category=Gifts%20%26%20Sets" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "Promos", href: "/Promos" },
      { label: "Orders", href: "/Orders" },
      { label: "Saved rituals", href: "/Favorites" },
      { label: "Your bag", href: "/Cart" },
      { label: "Contact", href: "/Contact" },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "Shipping & delivery", href: "/Contact" },
      { label: "Returns", href: "/Contact" },
      { label: "Ingredients", href: "/Contact" },
      { label: "Stockists", href: "/Contact" },
      { label: "Press", href: "/Contact" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line bg-canvas-soft">
      <div className="aurora -left-24 top-0 h-64 w-64 bg-accent/25" />
      <div className="aurora -right-16 bottom-0 h-72 w-72 bg-violet/20" />

      <div className="shell relative py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))_1.4fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
                <GiDaisy size={20} />
              </span>
              <div>
                <p className="font-display text-lg font-semibold leading-none text-ink">Bloom</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-accent">
                  &amp; Glow
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Luminous skincare and quiet little luxuries, made for the ritual you
              keep coming back to. Clean, cruelty-free, and a touch dreamy.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[FaInstagram, FaPinterestP, FaFacebookF].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="Social link"
                  className="btn-icon h-9 w-9 hover:text-accent"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="label">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-ink-soft transition-colors duration-200 hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="label">The glow letter</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Weekly notes on rituals, restocks, and members-only drops.
            </p>
            <form className="mt-4 flex flex-col gap-2" onSubmit={(event) => event.preventDefault()}>
              <div className="relative">
                <FiMail
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="field pl-10"
                  aria-label="Email address"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-xs">
                Subscribe
                <FiArrowRight size={14} />
              </button>
            </form>
            <div className="mt-5 flex flex-col gap-1.5 text-xs text-muted">
              <span className="flex items-center gap-2">
                <FiPhone size={13} /> +1 (555) 014-8820
              </span>
              <span className="flex items-center gap-2">
                <FiMapPin size={13} /> 24 Petal Lane, Brooklyn
              </span>
            </div>
          </div>
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Bloom &amp; Glow Beauty Bar. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/Contact" className="transition-colors hover:text-accent">
              Privacy
            </Link>
            <Link href="/Contact" className="transition-colors hover:text-accent">
              Terms
            </Link>
            <Link href="/Contact" className="transition-colors hover:text-accent">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
