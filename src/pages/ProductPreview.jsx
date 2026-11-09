"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheck,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShare2,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";
import { FREE_DELIVERY_OVER } from "@/lib/pricing";
import { createServerSupabase } from "@/lib/supabase/server";
import { toStoreProduct } from "@/lib/productMapper";

const DETAILS = [
  { label: "Authenticity", value: "100% Original" },
  { label: "Trust", value: "Tested & trusted" },
  { label: "Skin tone", value: "Made for melanin-rich skin" },
  { label: "Dispatch", value: "Ships from Shomolu, Lagos" },
];

export async function getServerSideProps(ctx) {
  const id = typeof ctx.query.id === "string" ? ctx.query.id : "";
  if (!id) return { props: { initialProduct: null, productId: "" } };

  try {
    const supabase = createServerSupabase(ctx.req, ctx.res);
    const { data } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .maybeSingle();
    return { props: { initialProduct: data ? toStoreProduct(data) : null, productId: id } };
  } catch (error) {
    return { props: { initialProduct: null, productId: id } };
  }
}

export default function ProductPreview({ initialProduct, productId = "" }) {
  const { addToCart, toggleFavorite, isFavorite, catalog, catalogLoading } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = useMemo(() => {
    if (initialProduct) return initialProduct;
    if (!productId) return null;
    return catalog.find((item) => String(item.id) === String(productId)) || null;
  }, [initialProduct, productId, catalog]);
  const productImages = useMemo(() => {
    if (!product) return [];
    const rawImages = Array.isArray(product.images) && product.images.length ? product.images : [];
    const fallback = product.image ? [product.image] : [];
    return [...new Set([...rawImages, ...fallback].filter(Boolean))].slice(0, 3);
  }, [product]);
  const [selectedImage, setSelectedImage] = useState(productImages[0] || "");
  const variantOptions = useMemo(
    () =>
      product && Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : [{ value: "default", label: "Standard", price: product?.price ?? 0, stock: product?.stock ?? 0, synthetic: true }],
    [product]
  );
  const [selectedVariantValue, setSelectedVariantValue] = useState(variantOptions[0]?.value || "default");
  // A product with no saved options still needs a price-only fallback, but it
  // should not show a one-item picker.
  const hasOptions = variantOptions.some((option) => !option.synthetic);

  useEffect(() => {
    setSelectedVariantValue(variantOptions[0]?.value || "default");
  }, [variantOptions]);

  useEffect(() => {
    setSelectedImage(productImages[0] || "");
  }, [productImages]);

  const selectedVariant =
    variantOptions.find((option) => String(option.value) === String(selectedVariantValue)) || variantOptions[0];
  const selectedPrice = Number(selectedVariant?.price ?? product?.price ?? 0);
  const compareAt = Number(product?.oldprice) || 0;
  const hasSaving = compareAt > selectedPrice;
  const discount = hasSaving
    ? Math.round(((compareAt - selectedPrice) / compareAt) * 100)
    : 0;

  if (!product) {
    return (
      <Layout>
        <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <FiShoppingBag size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl text-ink">
              {catalogLoading ? "Fetching this ritual…" : "This ritual has wandered off"}
            </h1>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              {catalogLoading
                ? "One moment while we open the shelf."
                : "The piece you're looking for isn't here — but the shelf is full of good company."}
            </p>
          </div>
          <Link href="/shop" className="btn-primary">
            Browse the shop
          </Link>
        </div>
      </Layout>
    );
  }

  const saved = isFavorite(product.id);
  const soldOut = product.stock <= 0;
  const related = catalog.filter((item) => item.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product.id, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <Link href="/shop" className="btn-ghost self-start px-0 text-xs">
          <FiArrowLeft size={13} /> Back to the shop
        </Link>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-4xl border border-line bg-gradient-to-br from-accent-soft via-surface-2 to-violet-soft shadow-card">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
              ) : null}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-ink shadow-glow">
                  −{discount}% today
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                aria-pressed={saved}
                aria-label={saved ? "Remove from saved" : "Save for later"}
                className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition-all ${
                  saved
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line/70 bg-surface/85 text-ink-soft hover:text-accent"
                }`}
              >
                <FiHeart size={16} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {productImages.length > 0 ? (
                productImages.map((imageUrl, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border transition-all ${selectedImage === imageUrl ? "border-accent ring-2 ring-accent/25" : "border-line bg-surface-2"}`}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <Image src={imageUrl} alt={`${product.title} ${index + 1}`} fill sizes="120px" className="object-cover opacity-90" />
                  </button>
                ))
              ) : (
                related.slice(0, 3).map((item) => (
                  <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
                    <Image src={item.image} alt={item.title} fill sizes="120px" className="object-cover opacity-90" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">{product.category}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-gold">
                  <FiStar size={11} fill="currentColor" />
                  {product.rating?.rate?.toFixed?.(1) ?? "4.8"}
                  <span className="text-muted">({product.rating?.count ?? 0})</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    soldOut ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-soft"
                  }`}
                >
                  {soldOut ? "Sold out" : `${product.stock} in stock`}
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
                {product.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                {product.description}
              </p>
            </div>

            {hasOptions && (
              <div className="card p-4">
                <p className="label">{product.variantTitle || "Options"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variantOptions.map((option) => {
                    const active =
                      String(selectedVariantValue) === String(option.value);
                    return (
                      <button
                        key={`${product.id}-${option.value}`}
                        type="button"
                        onClick={() => setSelectedVariantValue(option.value)}
                        className={`rounded-2xl border px-3 py-1.5 text-left text-xs font-medium transition-all ${
                          active
                            ? "border-accent bg-accent text-accent-ink"
                            : "border-line bg-surface-2 text-ink-soft hover:border-accent/60 hover:text-accent"
                        }`}
                      >
                        <span className="block">
                          {option.label || option.value}
                        </span>
                        <span className="block text-[10px] opacity-70">
                          {formatNaira(Number(option.price ?? product.price ?? 0))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card flex flex-wrap items-end justify-between gap-4 p-5">
              <div>
                <p className="label">Price</p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-3xl text-ink">{formatNaira(selectedPrice)}</span>
                  {hasSaving && (
                    <span className="text-sm text-muted line-through">{formatNaira(compareAt)}</span>
                  )}
                  {discount > 0 && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
                      Save {discount}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-accent"
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={13} />
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock || 1), q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-accent"
                  aria-label="Increase quantity"
                >
                  <FiPlus size={13} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={soldOut}
                className="btn-primary flex-1"
              >
                {added ? <FiCheck size={15} /> : <FiShoppingBag size={15} />}
                {soldOut
                  ? "Sold out"
                  : added
                  ? "Added to bag"
                  : `Add to bag · ${formatNaira((Number(selectedVariant?.price ?? product.price ?? 0) * quantity))}`}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className="btn-secondary"
                aria-pressed={saved}
              >
                <FiHeart size={15} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: product.title, url: window.location.href }).catch(() => {});
                  }
                }}
                className="btn-secondary px-4"
                aria-label="Share this ritual"
              >
                <FiShare2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DETAILS.map((detail) => (
                <div key={detail.label} className="rounded-2xl border border-line bg-surface-2/60 p-3.5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{detail.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2/50 p-4 text-xs text-ink-soft">
              <span className="flex items-center gap-2">
                <FiTruck size={13} className="text-accent" /> Free delivery over{" "}
                {formatNaira(FREE_DELIVERY_OVER)} · nationwide in 1–5 days
              </span>
              <span className="flex items-center gap-2">
                <FiShield size={13} className="text-accent" /> 100% original · tested &amp; trusted
              </span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Pairs nicely</span>
                <h2 className="mt-1 font-display text-2xl text-ink">Complete the ritual</h2>
              </div>
              <Link href="/shop" className="btn-ghost text-xs">
                All routines
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
