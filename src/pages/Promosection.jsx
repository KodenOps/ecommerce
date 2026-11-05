import React from "react";
import { products } from "@/data/products";
import Titles from "@/components/Titles";
import Link from "next/link";
import Image from "next/image";
import { BsStars, BsHeart } from "react-icons/bs";

const StarRating = ({ rate, count }) => (
  <div className="flex items-center gap-1 text-amber-400 text-xs">
    <BsStars size={12} fill="currentColor" />
    <span className="font-medium">{rate.toFixed(1)}</span>
  </div>
);

const Promosection = () => {
  return (
    <section className="py-[100px] relative overflow-hidden">
      {/* playful background blobs */}
      <div className="blob-1 opacity-70" />
      <div className="blob-2 opacity-60" />

      <div className="max-w-6xl mx-auto px-4 md:px-[70px] relative z-10">
        <Titles
          title="Flash Glow Sale"
          subtext="Short-lived magic: up to 50% off on ultra-glowy rituals. Because your skin deserves the spotlight — fast."
        />

        {/* playful promo decoration */}
        <div className="flex items-center justify-center lg:justify-start gap-3 mt-4 text-rose-500 text-lg font-semibold">
          <span>⚡ Flash</span>
          <span className="inline-block animate-pulse">Sale</span>
          <span className="text-amber-500">ends soon</span>
        </div>

        {/* product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {Promo.map((item) => {
            const discount = Math.round(((item.oldprice - item.price) / item.oldprice) * 100);
            return (
              <Link
                key={item.id}
                href={`/ProductPreview?id=${item.id}`}
                className="group petal-card bg-white overflow-hidden"
              >
                {/* playful header badge */}
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-500 to-purple-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  −{discount}%
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 aspect-square">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 240px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />

                  {/* playful overlay quick actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-500 shadow-md hover:bg-rose-50 transition-colors">
                      <BsHeart size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-rose-600 shadow-md hover:bg-rose-100 transition-colors">
                      <BsStars size={16} fill="currentColor" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-[#2b1a2e] text-sm leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-rose-500 font-medium mt-0.5">
                    {item.category}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-lg font-bold text-rose-600">${item.price}</span>
                      <span className="text-xs text-[#2b1a2e]/50 line-through ml-2">
                        ${item.oldprice}
                      </span>
                    </div>
                    <StarRating rate={item.rating.rate} count={item.rating.count} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Promosection;
