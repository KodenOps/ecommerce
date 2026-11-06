import React from "react";
import Link from "next/link";
import { FiArrowRight, FiClock, FiTag } from "react-icons/fi";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Titles from "@/components/Titles";

const Promosection = () => {
  const deals = [...products]
    .filter((item) => item.oldprice)
    .sort((a, b) => (b.oldprice - b.price) / b.oldprice - (a.oldprice - a.price) / a.oldprice)
    .slice(0, 4);

  return (
    <section id="promos" className="section">
      <div className="relative overflow-hidden rounded-4xl border border-line bg-ink px-6 py-8 text-canvas sm:px-9">
        <div className="aurora -left-10 top-0 h-56 w-56 bg-accent/40" />
        <div className="aurora -bottom-16 right-0 h-56 w-56 bg-violet/30" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-canvas/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]">
              <FiTag size={11} /> Flash glow sale
            </span>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Up to <span className="text-accent">50% off</span> the glow shelf
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-canvas/75">
              A short, sweet window on our best formulas. When they&apos;re gone, they&apos;re
              back at full price — consider yourself warned.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-canvas/20 bg-canvas/10 px-4 py-2 text-xs font-semibold">
              <FiClock size={13} /> Ends Sunday, 11:59pm
            </span>
            <Link
              href="/Promos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-canvas px-6 py-3 text-sm font-semibold text-ink transition-transform duration-200 hover:scale-[1.02]"
            >
              See all promos
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Titles
          eyebrow="On sale now"
          title="Four routines, quietly reduced"
          subtext="The pieces our community restocks the moment they run low."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promosection;
