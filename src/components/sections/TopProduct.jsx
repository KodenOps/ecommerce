"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Titles from "@/components/Titles";

const FILTERS = ["All", "Skincare", "Mists & Toners", "Lips & Blush", "Body Glow", "Scented Candles", "Gifts & Sets"];

const TopProduct = () => {
  const [filter, setFilter] = useState("All");

  const visible = useMemo(() => {
    const list = filter === "All" ? products : products.filter((item) => item.category === filter);
    return list.slice(0, 8);
  }, [filter]);

  return (
    <section id="topProd" className="section">
      <Titles
        eyebrow="Bestsellers"
        title="The routines everyone keeps re-buying"
        subtext="Our most-loved formulas, ranked by the queens who actually finish the bottle."
        action={
          <Link href="/Shop" className="btn-secondary">
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg text-ink">Nothing in this routine yet</p>
          <p className="mt-1 text-sm text-ink-soft">Try another category — or browse the full shop.</p>
          <Link href="/Shop" className="btn-primary mt-5">
            Browse the shop
          </Link>
        </div>
      )}
    </section>
  );
};

export default TopProduct;
