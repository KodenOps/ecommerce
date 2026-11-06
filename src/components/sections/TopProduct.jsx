"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import Titles from "@/components/Titles";
import { useStore } from "@/store/store";

const FILTERS = ["All", "Skincare", "Mists & Toners", "Lips & Blush", "Body Glow", "Scented Candles", "Gifts & Sets"];

const TopProduct = () => {
  const { catalog, catalogLoading } = useStore();
  const [filter, setFilter] = useState("All");

  const visible = useMemo(() => {
    const list = filter === "All" ? catalog : catalog.filter((item) => item.category === filter);
    return list.slice(0, 8);
  }, [catalog, filter]);

  return (
    <section id="topProd" className="section">
      <Titles
        eyebrow="Bestsellers"
        title="The routines everyone keeps re-buying"
        subtext="Our most-loved formulas, ranked by the queens who actually finish the bottle."
        action={
          <Link href="/shop" className="btn-secondary">
            Shop everything
            <FiArrowRight size={14} />
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setFilter(tag)}
            className={`chip ${filter === tag ? "chip-active" : ""}`}
            aria-pressed={filter === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      {catalogLoading && visible.length === 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card animate-pulse overflow-hidden">
              <div className="aspect-square bg-surface-2" />
              <div className="space-y-2 p-4">
                <div className="h-2 w-1/3 rounded bg-surface-2" />
                <div className="h-3 w-4/5 rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!catalogLoading && visible.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg text-ink">Nothing in this ritual yet</p>
          <p className="mt-1 text-sm text-ink-soft">Try another category — or browse the full shop.</p>
          <Link href="/shop" className="btn-primary mt-5">
            Browse the shop
          </Link>
        </div>
      )}
    </section>
  );
};

export default TopProduct;
