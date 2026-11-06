import React from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiDroplet,
  FiGift,
  FiHeart,
  FiMoon,
  FiSun,
  FiWind,
} from "react-icons/fi";
import Titles from "@/components/Titles";

const CATEGORIES = [
  {
    name: "Skincare",
    description: "Zobo serums, black soap and creams for harmattan-proof glow.",
    icon: FiDroplet,
    tint: "from-accent/20 to-violet/10",
  },
  {
    name: "Mists & Toners",
    description: "A spritz of calm for hot Lagos afternoons.",
    icon: FiWind,
    tint: "from-violet/20 to-accent/10",
  },
  {
    name: "Lips & Blush",
    description: "Hibiscus tints and nudes made for melanin-rich lips.",
    icon: FiHeart,
    tint: "from-accent/20 to-gold/10",
  },
  {
    name: "Body Glow",
    description: "Shea and baobab shimmer for owambe nights.",
    icon: FiSun,
    tint: "from-gold/20 to-accent/10",
  },
  {
    name: "Scented Candles",
    description: "Warm, quiet evenings after a loud day in the city.",
    icon: FiMoon,
    tint: "from-violet/20 to-surface-2",
  },
  {
    name: "Gifts & Sets",
    description: "Curated boxes for bridal trains and best friends.",
    icon: FiGift,
    tint: "from-accent/20 to-violet/15",
  },
];

const TRUST_BADGES = [
  "100% Original",
  "Tested & Trusted",
  "Nationwide Delivery",
  "Verified Naija Brand",
  "Pay on Delivery in Lagos",
  "Real Customer Reviews",
];

const Categories = () => {
  return (
    <section id="rituals" className="section">
      <Titles
        eyebrow="Shop by ritual"
        title="Pick the mood, we'll bring the glow"
        subtext="Six small worlds of beauty — each one built around the moment you want to make for yourself, shipped from Lagos."
        action={
          <Link href="/Shop" className="btn-secondary">
            View everything
            <FiArrowUpRight size={14} />
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={`/Shop?category=${encodeURIComponent(category.name)}`}
              className="card card-hover group relative overflow-hidden p-5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.tint} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface/80 text-accent shadow-soft">
                    <Icon size={18} />
                  </span>
                  <FiArrowUpRight
                    size={16}
                    className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </div>

                <div>
                  <h3 className="font-display text-[15px] text-ink">{category.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TRUST_BADGES.map((badge) => (
          <span key={badge} className="chip">
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
};

export default Categories;
