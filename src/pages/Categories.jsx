import React from "react";
import Titles from "@/components/Titles";
import { GiDaisy } from "react-icons/gi";

const categories = [
  {
    name: "Skincare",
    desc: "Serums, creams, cleansers — your daily glow ritual.",
    icon: GiDaisy,
    color: "from-rose-400 to-pink-300",
    bg: "bg-rose-50 text-rose-600",
  },
  {
    name: "Mists & Toners",
    desc: "Spritz, refresh, reset — little moments of calm.",
    icon: GiDaisy,
    color: "from-purple-400 to-violet-300",
    bg: "bg-purple-50 text-purple-600",
  },
  {
    name: "Lips & Blush",
    desc: "Glossy smiles and flushed cheeks, naturally playful.",
    icon: GiDaisy,
    color: "from-rose-400 to-amber-300",
    bg: "bg-amber-50 text-amber-600",
  },
  {
    name: "Body Glow",
    desc: "Shimmer, scrub, and self-care that lingers.",
    icon: GiDaisy,
    color: "from-amber-300 to-yellow-200",
    bg: "bg-yellow-50 text-amber-700",
  },
  {
    name: "Scented Candles",
    desc: "Warm vibes and cozy rituals for any mood.",
    icon: GiDaisy,
    color: "from-peach-300 to-rose-200",
    bg: "bg-rose-50 text-rose-500",
  },
  {
    name: "Gifts & Sets",
    desc: "Beauty boxes that make everyone smile.",
    icon: GiDaisy,
    color: "from-purple-400 to-pink-300",
    bg: "bg-purple-50 text-purple-600",
  },
];

const Categories = () => {
  return (
    <section className="py-[110px] relative overflow-hidden bg-gradient-to-b from-transparent via-rose-50/30 to-transparent">
      {/* playful background blobs */}
      <div className="blob-1 opacity-60" />
      <div className="blob-2 opacity-50" />

      <div className="max-w-6xl mx-auto px-4 md:px-[70px] relative z-10">
        <Titles
          title="Shop by Ritual"
          subtext="Tailor your beauty journey — pick a mood, a moment, or a little luxury, and let your glow lead the way."
          decoration
        />

        {/* playful category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-12">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className={`group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-white/60 p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 card-lift` }
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* playful gradient icon button */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <Icon />
                </div>

                <h4 className="font-bold text-[#2b1a2e] text-base">{cat.name}</h4>
                <p className="text-xs text-[#2b1a2e]/60 leading-relaxed max-w-[140px]">{cat.desc}</p>

                {/* playful arrow */}
                <div className="mt-1 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 group-hover:bg-rose-200 transition-colors">
                  <span className="text-sm">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* playful extra strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-[#2b1a2e]/70">
          {[
            "✨ Cruelty-free",
            "🌿 Clean ingredients",
            "💄 Vegan options",
            "🌸 Paraben-free",
          ].map((badge) => (
            <span key={badge} className="px-4 py-1.5 rounded-full bg-white/70 border border-rose-200 shadow-sm">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;