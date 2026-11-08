"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiDroplet,
  FiGift,
  FiHeart,
  FiMoon,
  FiSun,
  FiTrendingUp,
  FiWind,
} from "react-icons/fi";
import Titles from "@/components/Titles";

/* Editorial copy for the categories the shop already ships with. */
const PRESETS = {
  Skincare: {
    description: "Zobo serums, black soap and creams for harmattan-proof glow.",
    icon: FiDroplet,
    tint: "from-accent/20 to-violet/10",
  },
  "Mists & Toners": {
    description: "A spritz of calm for hot Lagos afternoons.",
    icon: FiWind,
    tint: "from-violet/20 to-accent/10",
  },
  "Lips & Blush": {
    description: "Hibiscus tints and nudes made for melanin-rich lips.",
    icon: FiHeart,
    tint: "from-accent/20 to-gold/10",
  },
  "Body Glow": {
    description: "Shea and baobab shimmer for owambe nights.",
    icon: FiSun,
    tint: "from-gold/20 to-accent/10",
  },
  "Scented Candles": {
    description: "Warm, quiet evenings after a loud day in the city.",
    icon: FiMoon,
    tint: "from-violet/20 to-surface-2",
  },
  "Gifts & Sets": {
    description: "Curated boxes for bridal trains and best friends.",
    icon: FiGift,
    tint: "from-accent/20 to-violet/15",
  },
};

const FALLBACK_ICONS = [FiDroplet, FiWind, FiHeart, FiSun, FiMoon, FiGift];
const FALLBACK_TINTS = [
  "from-accent/20 to-violet/10",
  "from-violet/20 to-accent/10",
  "from-accent/20 to-gold/10",
  "from-gold/20 to-accent/10",
  "from-violet/20 to-surface-2",
  "from-accent/20 to-violet/15",
];

const DEFAULT_CATEGORIES = Object.entries(PRESETS).map(([name, preset]) => ({
  name,
  description: preset.description,
  icon: preset.icon,
  tint: preset.tint,
  units: 0,
}));

const toCard = (row, index) => {
  const preset = PRESETS[row.name];
  return {
    name: row.name,
    description:
      preset?.description ||
      `${row.products} ${row.products === 1 ? "product" : "products"} ready to ship.`,
    icon: preset?.icon || FALLBACK_ICONS[index % FALLBACK_ICONS.length],
    tint: preset?.tint || FALLBACK_TINTS[index % FALLBACK_TINTS.length],
    units: row.units,
  };
};

const TRUST_BADGES = [
  "100% Original",
  "Tested & Trusted",
  "Nationwide Delivery",
  "Verified Naija Brand",
  "Pay on Delivery in Lagos",
  "Real Customer Reviews",
];

const Categories = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/categories/demand?limit=6", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const rows = payload?.categories || [];
        if (!active || rows.length === 0) return;
        setCategories(rows.map(toCard));
        setLive(true);
      })
      .catch(() => {
        /* keep the curated list when the shop is offline */
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="routines" className="section">
      <Titles
        eyebrow="Shop by Routines"
        title={live ? "The moods everyone is buying" : "Pick the mood, we'll bring the glow"}
        subtext={
          live
            ? "Ranked by what actually sold this month — join the crowd or find your own ritual, shipped from Lagos."
            : "Six small worlds of beauty — each one built around the moment you want to make for yourself, shipped from Lagos."
        }
        action={
          <Link href="/shop" className="btn-secondary">
            View everything
            <FiArrowUpRight size={14} />
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
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
                  {category.units > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                      <FiTrendingUp size={10} /> {category.units} sold this month
                    </p>
                  )}
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
