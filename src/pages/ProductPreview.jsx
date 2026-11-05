import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { BsStars, BsHeart, BsShare } from "react-icons/bs";
import { GiDaisy } from "react-icons/gi";
import { getProductById } from "@/data/products";

export default function ProductPreview() {
  const searchParams = useSearchParams();
  const idRaw = searchParams.get("id");
  const id = idRaw != null ? Number(idRaw) : NaN;
  const product = Number.isFinite(id) ? getProductById(id) : null;

  const item = product ?? {};

  const discount = item.oldprice
    ? Math.round(((item.oldprice - item.price) / item.oldprice) * 100)
    : 0;

  const hasProduct = !!product;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 to-transparent">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-[70px] py-8 md:py-12 relative z-10">
        {/* playful back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-rose-500 font-medium hover:text-rose-700 transition-colors mb-6 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">
            ←
          </span>
          Back to glow
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* visual side */}
          <div className="relative">
            {/* playful blobs */}
            <div className="blob-1 opacity-80" />
            <div className="blob-3 opacity-80" />

            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-100 via-amber-50 to-purple-100 aspect-square max-w-[520px] mx-auto shadow-2xl border border-white/40">
              {hasProduct && item.image ? (
                <Image
                  src={item.image}
                  alt={item.title || "glow ritual"}
                  fill
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 520px"
                  priority
                  style={{ position: "absolute", inset: 0 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-rose-400">
                  ✨
                </div>
              )}
              {/* playful overlay badge */}
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {              (product?.oldprice != null) ? `−${discount}%` : "✨ Best"}
              </div>
              {/* playful ripple decoration */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full blur-xl" />
            </div>

            {/* playful quick actions row */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button className="petal-card px-5 py-3 flex items-center gap-2 text-rose-600 bg-white shadow-md hover:shadow-xl transition-all">
                <BsHeart size={18} />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button className="petal-card px-5 py-3 flex items-center gap-2 text-rose-600 bg-white shadow-md hover:shadow-xl transition-all">
                <BsShare size={18} />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* details side */}
          <div className="flex flex-col gap-5">
            {/* playful breadcrumb tag */}
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-rose-500 font-medium">
              <GiDaisy size={14} />
              {product ? (item.category || "Ritual") : "Ritual"}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#2b1a2e] leading-tight">
              {product ? (item.title || "Glow Ritual") : "Glow Ritual"}
            </h1>

            {/* playful rating row */}              {product && (
                <div className="flex items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-1 text-amber-400">
                  <BsStars size={18} fill="currentColor" />
                  <span className="font-semibold text-[#2b1a2e]">
                    {item.rating?.rate ?? 4.8}
                  </span>
                  <span className="text-[#2b1a2e]/60">
                    ({item.rating?.count ?? 800} glows)
                  </span>
                </div>
              </div>
            )}

            {/* playful price card */}
            <div className="petal-card bg-white p-5 flex items-center justify-between">
              <div>
                <span className="block text-sm text-[#2b1a2e]/60 uppercase tracking-wide">
                  Total
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-bold text-rose-600">
                    {product && item.price != null ? `$${item.price}` : "—"}
                  </span>
                  {product?.oldprice != null && (
                    <span className="text-lg text-[#2b1a2e]/50 line-through">
                      ${item.oldprice}
                    </span>
                  )}
                </div>
              </div>
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold shadow-lg glow-accent sparkly-btn transition-all hover:scale-[1.03] active:scale-95">
                Add to Glow Bag
              </button>
            </div>

            {/* playful description */}
            <p className="text-[#2b1a2e]/80 leading-relaxed text-base">
              {product
                ? item.description ||
                  "A little luxury for your daily ritual — luminous, playful, and made to make you feel gorgeous."
                : "Pick a ritual from the collection and this page will fill with all the glowing details."}
            </p>

            {/* playful detail rails */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Reformulation", value: "Clean & cruelty-free" },
                { label: "Scent family", value: "Floral · soft vanilla" },
                { label: "Skin type", value: "All glow-levels welcome" },
                { label: "Vibe check", value: "Fresh, dreamy, sparkly" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="petal-card bg-white p-3 flex flex-col gap-0.5"
                >
                  <span className="text-[#2b1a2e]/50 text-[10px] uppercase tracking-wider">
                    {row.label}
                  </span>
                  <span className="font-medium text-[#2b1a2e]">{row.value}</span>
                </div>
              ))}
            </div>

            {/* playful cta strip */}
            <div className="mt-2 flex items-center gap-2 text-sm text-rose-500">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Free glowy samples with every order</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
