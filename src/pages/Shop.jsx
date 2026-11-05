"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Titles from "@/components/Titles";
import { products } from "@/data/products";
import { useStore } from "@/store/store";

const CATEGORIES = [
  { name: "All", value: "" },
  { name: "Skincare", value: "Skincare" },
  { name: "Mists & Toners", value: "Mists & Toners" },
  { name: "Lips & Blush", value: "Lips & Blush" },
  { name: "Body Glow", value: "Body Glow" },
  { name: "Scented Candles", value: "Scented Candles" },
  { name: "Gifts & Sets", value: "Gifts & Sets" },
];

const SORTS = [
  { value: "latest", label: "Newest" },
  { value: "best", label: "Best Sellers" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const StarRating = ({ item }) => (
  <div className="flex items-center gap-1.5 text-xs">
    <span className="text-[var(--accent)]">★</span>
    <span className="text-[var(--ink-soft)] font-medium">{item.rating.rate.toFixed(1)}</span>
    <span className="text-[var(--muted)]">({item.rating.count})</span>
  </div>
);

const Shop = () => {
  const { addToCart, toggleFavorite } = useStore();
  const [category, setCategory] = React.useState("");
  const [sort, setSort] = React.useState("latest");

  const filtered = React.useMemo(() => {
    let list = products.filter((item) => !category || item.category === category);
    if (sort === "latest") {
      list = [...list].sort((a, b) => b.id - a.id);
    } else if (sort === "best") {
      list = [...list].sort((a, b) => b.rating.rate - a.rating.rate);
    } else if (sort === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [category, sort]);

  return (
    <div className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Titles title="Shop" subtext="Filter, sort, and build a small collection of pieces worth keeping." />
          </div>
          <Link href="/cart" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--line)] text-sm font-medium hover:bg-[var(--paper-2)] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            Cart
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !category ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--paper-2)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="text-sm text-[var(--muted)]">Sort by</span>
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sort === s.value ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--paper-2)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div key={item.id} className="group flex gap-4">
              <div className="relative flex-shrink-0 overflow-hidden rounded-xl bg-[var(--paper-2)] aspect-[3/4] shadow-card">
                <Image src={item.image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 160px" />
              </div>
              <div className="flex flex-col justify-between gap-2 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[var(--ink)] truncate">{item.title}</h4>
                  <button
                    onClick={() => toggleFavorite(item)}
                    className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    aria-label="Save to favorites"
                  >
                    <span className="text-base">♥</span>
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{item.category}</p>
                <p className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                  <span className="text-[var(--accent)]">${item.price}</span>
                  {item.oldprice && <span className="text-xs text-[var(--muted)] line-through">${item.oldprice}</span>}
                </p>
                <button
                  onClick={() => addToCart(item)}
                  className="mt-2 px-3 py-2 rounded-full text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
