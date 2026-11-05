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
    description: "Serums, creams, and balms for your daily glow ritual.",
    icon: FiDroplet,
    tint: "from-accent/20 to-violet/10",
  },
  {
    name: "Mists & Toners",
    description: "A spritz of calm, any hour of the day.",
    icon: FiWind,
    tint: "from-violet/20 to-accent/10",
  },
  {
    name: "Lips & Blush",
    description: "Glossy smiles and flushed cheeks, naturally.",
    icon: FiHeart,
    tint: "from-accent/20 to-gold/10",
  },
  {
    name: "Body Glow",
    description: "Shimmer, scrub, and self-care that lingers.",
    icon: FiSun,
    tint: "from-gold/20 to-accent/10",
  },
  {
    name: "Scented Candles",
    description: "Warm, quiet evenings in a single note.",
    icon: FiMoon,
    tint: "from-violet/20 to-surface-2",
  },
  {
    name: "Gifts & Sets",
    description: "Curated boxes for the people you adore.",
    icon: FiGift,
    tint: "from-accent/20 to-violet/15",
  },
];

const Categories = () => {
  return (
    <section id="rituals" className="section">
      <Titles
        eyebrow="Shop by ritual"
        title="Pick the mood, we'll bring the glow"
        subtext="Six small worlds of beauty — each one built around the moment you want to make for yourself."
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
        {["Cruelty-free", "Clean ingredients", "Vegan options", "Paraben-free", "Recyclable glass"].map(
          (badge) => (
            <span key={badge} className="chip">
              {badge}
            </span>
          )
        )}
      </div>
    </section>
  );
};

export default Categories;
