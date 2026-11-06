"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { FREE_DELIVERY_THRESHOLD, useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";

const Cart = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    savings,
    delivery,
    total,
    setQuantity,
    removeFromCart,
    clearCart,
  } = useStore();

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Your bag"
          title={cartCount > 0 ? "Your QueenFizzie bag" : "Your bag is having a quiet moment"}
          description={
            cartCount > 0
              ? `${cartCount} ${cartCount === 1 ? "item" : "items"} waiting for you — free delivery unlocks at ${formatNaira(FREE_DELIVERY_THRESHOLD)}.`
              : "Nothing in here yet. Start with a bestseller and the rest tends to follow."
          }
          crumbs={[{ label: "Home", href: "/" }, { label: "Bag" }]}
          actions={
            cartCount > 0 && (
              <button type="button" onClick={clearCart} className="btn-secondary">
                <FiTrash2 size={14} /> Empty bag
              </button>
            )
          }
        />

        {cartCount === 0 ? (
          <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FiShoppingBag size={26} />
            </span>
            <div>
              <p className="font-display text-xl text-ink">Your bag is empty</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Start with our zobo serum, a body mist, or the shea glow oil — the
                pieces our Lagos customers keep restocking.
              </p>
            </div>
            <Link href="/Shop" className="btn-primary">
              Browse the shop
              <FiArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="flex flex-col gap-4">
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-xs text-ink-soft">
                  <FiTruck size={14} className="text-accent" />
                  {remaining > 0 ? (
                    <span>
                      You&apos;re <strong className="text-ink">{formatNaira(remaining)}</strong> from free
                      delivery
                    </span>
                  ) : (
                    <span className="text-accent">Free delivery unlocked — nicely done</span>
                  )}
                  <div className="ml-auto hidden w-32 overflow-hidden rounded-full bg-surface-2 sm:block">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ul className="divide-y divide-line">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex gap-4 p-4">
                      <Link
                        href={`/ProductPreview?id=${item.id}`}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-2 sm:h-28 sm:w-24"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                              {item.category}
                            </p>
                            <Link
                              href={`/ProductPreview?id=${item.id}`}
                              className="mt-0.5 block truncate font-display text-sm text-ink hover:text-accent sm:text-[15px]"
                            >
                              {item.title}
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted transition-colors hover:text-accent"
                            aria-label={`Remove ${item.title}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                          <div className="flex items-center gap-1 rounded-full border border-line bg-surface-2 p-1">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, item.qty - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-accent"
                              aria-label="Decrease quantity"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold tabular-nums">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.id, item.qty + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-accent"
                              aria-label="Increase quantity"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-ink">
                              {formatNaira(item.price * item.qty)}
                            </p>
                            {item.oldprice && (
                              <p className="text-[11px] text-muted line-through">
                                {formatNaira(item.oldprice * item.qty)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/Shop" className="btn-ghost self-start px-0 text-xs">
                <FiArrowRight size={13} className="rotate-180" /> Continue shopping
              </Link>
            </div>

            <aside className="card sticky top-24 p-5">
              <h2 className="font-display text-lg text-ink">Order summary</h2>
              <dl className="mt-4 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="font-medium text-ink">{formatNaira(subtotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">You save</dt>
                    <dd className="font-medium text-accent">−{formatNaira(savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Delivery</dt>
                  <dd className="font-medium text-ink">
                    {delivery === 0 ? "Free" : formatNaira(delivery)}
                  </dd>
                </div>
                <div className="divider my-1" />
                <div className="flex items-baseline justify-between">
                  <dt className="font-display text-base text-ink">Total</dt>
                  <dd className="font-display text-2xl text-ink">{formatNaira(total)}</dd>
                </div>
              </dl>

              <Link href="/Checkout" className="btn-primary mt-5 w-full">
                Go to checkout
                <FiArrowRight size={15} />
              </Link>

              <div className="mt-4 flex flex-col gap-1.5 text-[11px] text-muted">
                <span>Bank transfer · receipt verified before dispatch</span>
                <span>Nationwide delivery in 1–5 working days</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
