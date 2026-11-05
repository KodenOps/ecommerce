"use client";
import React from "react";
import Link from "next/link";
import Titles from "@/components/Titles";
import { useStore } from "@/store/store";

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  const total = cart.reduce((sum, line) => sum + (Number(line.price) || 0) * (Number(line.quantity) || 0), 0);

  if (cart.length === 0) {
    return (
      <div className="bg-[var(--paper)]">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--paper-2)] flex items-center justify-center text-[var(--muted)] mx-auto">
            <span className="text-2xl">🛒</span>
          </div>
          <h3 className="mt-5 text-xl font-serif font-semibold text-[var(--ink)]">Your bag is empty</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">Add a piece or two before we finish.</p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--ink)] text-white font-medium hover:bg-[var(--ink-soft)] transition-colors">
            Explore the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <Titles title="Cart" subtext="Review your pieces and adjust quantities before you leave." />
          </div>
          <Link href="/shop" className="px-5 py-2 rounded-full border border-[var(--line)] text-sm font-medium hover:bg-[var(--paper-2)] transition-colors">
            Keep shopping
          </Link>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.map((line) => (
              <div key={line.id} className="flex gap-4 rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-card">
                <div className="relative w-20 h-20 rounded-lg bg-[var(--paper-2)] overflow-hidden flex-shrink-0">
                  <img
                    src={line.image}
                    alt=""
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--ink)]">{line.title || "Product"}</h4>
                      <p className="text-xs text-[var(--muted)] capitalize">{line.category || ""}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(line.id)}
                      className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                      aria-label="Remove item"
                    >
                      <span className="text-base">×</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(line.id, Math.max(1, Number(line.quantity) - 1))}
                        className="w-7 h-7 rounded-full border border-[var(--line)] text-sm font-medium hover:bg-[var(--paper-2)] transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-[var(--ink)]">{line.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(line.id, Number(line.quantity) + 1)}
                        className="w-7 h-7 rounded-full border border-[var(--line)] text-sm font-medium hover:bg-[var(--paper-2)] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium text-[var(--ink)]">€{(Number(line.price) || 0 * (Number(line.quantity) || 0)).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-[var(--line)] pt-4 space-y-3">
              <div className="flex justify-between text-sm text-[var(--muted)]">
                <span>Subtotal</span>
                <span>€{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--muted)]">
                <span>Estimated delivery</span>
                <span>5-7 working days</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[var(--ink)]">
                <span>Total</span>
                <span>€{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 space-y-4">
            <div className="rounded-xl bg-[var(--card)] border border-[var(--line)] p-5 shadow-card">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Accepted payments</h4>
              <p className="mt-1 text-xs text-[var(--muted)]">We accept card, cash, and bank transfer.</p>
            </div>
            <div className="rounded-xl bg-[var(--card)] border border-[var(--line)] p-5 shadow-card">
              <h4 className="text-sm font-semibold text-[var(--ink)]">Delivery</h4>
              <p className="mt-1 text-xs text-[var(--muted)]">£2.99 flat rate within Europe.</p>
            </div>
            <Link href="/checkout" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--ink-soft)] transition-colors">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
