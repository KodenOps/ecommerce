import React from "react";
import { products } from "@/data/products";
import Titles from "@/components/Titles";
import Image from "next/image";
import { BsStars, BsHeart } from "react-icons/bs";

const StarRating = ({ rate, count }) => (
  <div className="flex items-center gap-1.5 text-amber-400 text-sm">
    <BsStars size={14} fill="currentColor" />
    <span className="font-medium">{rate.toFixed(1)}</span>
    <span className="text-[#2b1a2e]/50 text-xs">({count})</span>
  </div>
);

const TopProduct = () => {
  return (
    <section className="py-[120px] px-4 md:px-[70px] bg-gradient-to-b from-transparent via-rose-50/40 to-transparent" id="topProd">
      <div className="max-w-6xl mx-auto">
        <Titles
          title="Bestsellers & Glow Favorites"
          subtext="The picks our beauty-obsessed community can’t stop raving about — glowy, dreamy, and dangerously good for your routine."
          decoration
        />

        {/* playful filter pills */}
        <div className="flex flex-wrap gap-3 mt-10 justify-center lg:justify-start">
          {["All", "Skincare", "Mists", "Lips", "Body", "Candles"].map((tag) => (
            <button
              key={tag}
              className="px-5 py-2 rounded-full bg-white/70 border border-rose-200 text-sm font-medium text-[#2b1a2e] hover:bg-rose-100 hover:border-rose-300 transition-all shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {products.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="group petal-card card-lift p-4 bg-white"
            >
              {/* playful top-right badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="ribbon">{item.oldprice ? `−${Math.round(((item.oldprice - item.price) / item.oldprice) * 100)}%` : "✨ Best"}</span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 aspect-square mb-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 220px"
                />
                {/* overlay blend */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />

                {/* playful hover quick actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-500 shadow-md hover:bg-rose-50 transition-colors">
                    <BsHeart size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-600 shadow-md hover:bg-rose-100 transition-colors">
                    <BsStars size={18} fill="currentColor" />
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[#2b1a2e] text-sm leading-snug truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-rose-500 font-medium uppercase tracking-wide mt-0.5">
                    {item.category}
                  </p>
                  <StarRating rate={item.rating.rate} count={item.rating.count} />
                </div>
                <div className="ml-3 text-right flex-shrink-0">
                  <span className="text-lg font-bold text-rose-600">${item.price}</span>
                  <span className="block text-xs text-[#2b1a2e]/50 line-through">
                    ${item.oldprice}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* playful cta strip */}
        <div className="mt-12 text-center lg:text-left">
          <p className="text-sm text-[#2b1a2e]/70">
            Still glowing? There’s more where that came from —{" "}
            <button className="text-rose-500 font-semibold underline decoration-2 underline-offset-4 hover:decoration-rose-400 transition-colors cursor-pointer">
              explore the full ritual catalog
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TopProduct;
