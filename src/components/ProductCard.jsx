"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCheck, FiHeart, FiMinus, FiPlus, FiStar } from "react-icons/fi";
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";

const ProductCard = ({ product, compact = false }) => {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const saved = isFavorite(product.id);

  const options = useMemo(() => {
    if (Array.isArray(product.sizes) && product.sizes.length) return product.sizes;
    return [{ value: "default", label: "Standard", price: product.price, stock: product.stock }];
  }, [product]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(options[0]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedVariant(options[0] || null);
  }, [options]);

  const selectedPrice = Number(selectedVariant?.price ?? product.price ?? 0);
  const compareAt = Number(product.oldprice) || 0;
  const hasSaving = compareAt > selectedPrice;
  const discount = hasSaving
    ? Math.round(((compareAt - selectedPrice) / compareAt) * 100)
    : 0;

  const openPicker = () => {
    setSelectedVariant(options[0]);
    setQuantity(1);
    setPickerOpen(true);
  };

  const handleAdd = () => {
    addToCart(product.id, quantity, selectedVariant);
    setPickerOpen(false);
    setQuantity(1);
  };

  return (
    <>
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
            onClick={openPicker}
            className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-surface/95 py-2.5 text-xs font-semibold text-ink opacity-0 shadow-card backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
          >
            <FiPlus size={14} />
            Choose option{options.length > 1 ? ` (${options.length})` : ""}
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
              <span className="text-lg font-semibold text-ink">{formatNaira(selectedPrice)}</span>
              {hasSaving && (
                <span className="text-xs text-muted line-through">{formatNaira(compareAt)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={openPicker}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-all duration-200 hover:border-accent hover:bg-accent hover:text-accent-ink"
              aria-label={`Choose an option for ${product.title}`}
            >
              <FiPlus size={15} />
            </button>
          </div>
        </div>
      </article>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[28px] border border-line bg-surface p-4 shadow-elevated">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Choose option</p>
                <h3 className="font-display text-xl text-ink">{product.title}</h3>
              </div>
              <button type="button" onClick={() => setPickerOpen(false)} className="btn-ghost px-2 py-1 text-xs">
                Close
              </button>
            </div>              <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {options.map((option) => {
                  const optionPrice = Number(option.price ?? product.price ?? 0);
                  const active = selectedVariant?.value === option.value;
                  const hasMeta = Array.isArray(option.meta) && option.meta.length > 0;
                  const metaLines = hasMeta
                    ? option.meta
                        .map((meta) => `${meta.key}: ${meta.value}`)
                        .join(" · ")
                    : null;
                  return (
                    <button
                      key={`${product.id}-${option.value}`}
                      type="button"
                      onClick={() => setSelectedVariant(option)}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        active
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-surface-2 text-ink"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold">
                            {option.label || option.value}
                          </span>
                          {metaLines && (
                            <span className="block text-[11px] text-accent">{metaLines}</span>
                          )}
                        </div>
                        {active && <FiCheck size={14} className="mt-0.5" />}
                      </div>
                      <p className="mt-1 text-xs opacity-80">{formatNaira(optionPrice)}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-line bg-surface-2 px-3 py-2">
                <span className="text-sm text-ink-soft">Qty</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface-2 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">Final price</span>
                  <span className="text-lg font-semibold text-ink">{formatNaira(selectedPrice * quantity)}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted">{selectedVariant?.label || "Standard"} · {quantity} item(s)</p>
              </div>

              <button type="button" onClick={handleAdd} className="btn-primary w-full">
                Add to bag
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
