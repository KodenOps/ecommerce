"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Titles from "@/components/Titles";
import { products } from "@/data/products";
import { useStore } from "@/store/store";

const Promos = () => {
  const { addToCart, toggleFavorite } = useStore();

  const featured = products.slice(0, 3);

  const others = products
    .filter((item) => !featured.some((f) => f.id === item.id))
    .slice(0, 8);

  return (
    <div className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Titles title="Promotions" subtext="Limited windows. Quiet discounts. Pieces you will actually reach for." />
          </div>
          <Link href="/cart" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--line)] text-sm font-medium hover:bg-[var(--paper-2)] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            Cart
          </Link>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((item, index) => (
              <div key={item.id} className="relative overflow-hidden rounded-xl bg-[var(--paper-2)] shadow-card aspect-[3/4] md:aspect-[4/5]">
                <Image src={item.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 180px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)] to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{item.category}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-sm font-semibold text-[var(--accent)]">${item.price}</span>
                  {item.oldprice && <span className="block text-xs text-[var(--muted)] line-through">${item.oldprice}</span>}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => addToCart(item)}
                    className="px-5 py-2.5 rounded-full bg-[var(--ink)] text-white text-sm font-semibold shadow-card hover:bg-[var(--ink-soft)] transition-colors"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-[var(--ink)]">Current drop</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">A short look at what is available now — no noise, just pieces in season.</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {others.map((item) => (
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
    </div>
  );
};

export default Promos;
