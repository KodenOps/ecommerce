"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiPlus, FiStar } from "react-icons/fi";
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";

const ProductCard = ({ product, compact = false }) => {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const saved = isFavorite(product.id);
  const discount = product.oldprice
    ? Math.round(((product.oldprice - product.price) / product.oldprice) * 100)
    : 0;

  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden">
      <div
        className={`relative overflow-hidden ${
          compact ? "aspect-[5/4]" : "aspect-square"
        } bg-gradient-to-br from-accent-soft via-surface-2 to-violet-soft`}
      >
        <Link
          href={`/ProductPreview?id=${product.id}`}
          aria-label={product.title}
          className="absolute inset-0"
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          {discount > 0 ? (
            <span className="pointer-events-auto rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-ink shadow-glow">
              −{discount}%
            </span>
          ) : (
            <span className="pointer-events-auto rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft backdrop-blur">
              New
            </span>
          )}

          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-label={saved ? "Remove from saved" : "Save for later"}
            aria-pressed={saved}
            className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-200 ${
              saved
                ? "border-accent bg-accent text-accent-ink"
                : "border-line/70 bg-surface/80 text-ink-soft hover:border-accent/50 hover:text-accent"
            }`}
          >
            <FiHeart size={15} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-surface/95 py-2.5 text-xs font-semibold text-ink opacity-0 shadow-card backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          <FiPlus size={14} />
          Add to bag
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gold">
            <FiStar size={11} fill="currentColor" />
            {product.rating?.rate?.toFixed(1) ?? "4.8"}
            <span className="text-muted">({product.rating?.count ?? 0})</span>
          </span>
        </div>

        <Link
          href={`/ProductPreview?id=${product.id}`}
          className="font-display text-[15px] leading-snug text-ink transition-colors duration-200 hover:text-accent"
        >
          {product.title}
        </Link>

        {!compact && (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-ink">{formatNaira(product.price)}</span>
            {product.oldprice && (
              <span className="text-xs text-muted line-through">{formatNaira(product.oldprice)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-all duration-200 hover:border-accent hover:bg-accent hover:text-accent-ink"
            aria-label={`Add ${product.title} to bag`}
          >
            <FiPlus size={15} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
