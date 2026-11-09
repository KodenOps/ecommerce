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
            <Link href="/shop" className="btn-primary">
              Browse the shop
              <FiArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-line px-4 py-3 text-xs text-ink-soft">
                <span className="label">Items</span>
                <FiTruck size={14} className="text-accent shrink-0" />
                {remaining > 0 ? (
                  <span>
                    You&apos;re <strong className="text-ink">{formatNaira(remaining)}</strong> from free delivery
                  </span>
                ) : (
                  <span className="text-accent">Free delivery unlocked — nicely done</span>
                )}
                {remaining > 0 && (
                  <div className="flex flex-1 items-center min-w-0 rounded-full bg-surface-2 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Free delivery progress">
                    <div
                      className="h-1.5 w-full shrink-0 rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                {remaining === 0 && (
                  <span className="flex items-center gap-2 ml-auto text-accent">
                    <span className="relative h-2 w-2 overflow-hidden rounded-full bg-accent border border-accent/40">
                      <span className="absolute inset-0 bg-accent animate-pulse" />
                    </span>
                    No delivery fee today
                  </span>
                )}
              </div>

              <ul className="divide-y divide-line">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-4">
                    <Link
                      href={`/ProductPreview?id=${item.id}`}
                      className="relative shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-2 sm:h-16 sm:w-16"
                      aria-label={item.title}
                      style={{ aspectRatio: "1 / 1", height: "auto", width: "100%", maxWidth: "160px" }}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 64px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex flex-1 flex-col sm:gap-4">
                      <div className="flex gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                            {item.category}
                          </p>
                          <Link
                            href={`/ProductPreview?id=${item.id}`}
                            className="mt-0.5 block truncate font-display text-sm text-ink hover:text-accent"
                          >
                            {item.title}
                          </Link>
                          {item.selectedVariantDetail && (
                            <p className="mt-0.5 truncate text-[11px] text-accent">
                              {item.selectedVariantDetail}
                            </p>
                          )}
                        </div>
                        <div className="min-w-0 shrink-0 mt-auto sm:inline-flex sm:mt-0 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted transition-colors hover:text-accent"
                            aria-label={`Remove ${item.title}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                          <div className="text-right sm:ml-auto">
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

                      <div className="mt-1 flex items-center gap-1.5 border border-line rounded-full bg-surface-2 p-1 self-start sm:self-auto sm:ml-auto sm:justify-self-end">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.id, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-accent"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-semibold tabular-nums">
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
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="card hidden sm:block sm:sticky sm:top-24 lg:max-w-[360px]">
              <div className="flex items-center justify-between border-b border-b-surface-2 pb-3">
                <h2 className="font-display text-base text-ink">Order summary</h2>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
              </div>

              <dl className="mt-4 flex flex-col gap-x-3 gap-y-2 text-sm">
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
                <div className="flex items-baseline justify-between pt-1">
                  <dt className="font-display text-base text-ink">Total</dt>
                  <dd className="font-display text-xl text-ink">{formatNaira(total)}</dd>
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

            <Link href="/shop" className="btn-ghost self-start px-0 text-xs">
              <FiArrowRight size={13} className="rotate-180" /> Continue shopping
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
