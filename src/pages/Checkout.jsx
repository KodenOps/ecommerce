"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Titles from "@/components/Titles";
import { useStore } from "@/store/store";

const Checkout = () => {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, setCart, favorites } = useStore();

  const [step, setStep] = React.useState("shipping");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "United Kingdom",
  });

  const total = cart.reduce((sum, line) => sum + (Number(line.price) || 0) * (Number(line.quantity) || 0), 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlace = (e) => {
    e.preventDefault();
    setStep("confirming");
  };

  return (
    <div className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <div className="max-w-2xl">
          <Titles title="Checkout" subtext="Two or three quick steps, then you can put your pieces on and get on with your day." />
        </div>

        <div className="mt-8 flex flex-col gap-6 border-b border-[var(--line)] pb-8">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "shipping" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--paper-2)]"}`}
            onClick={() => setStep("shipping")}
          >
            Shipping
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "payment" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--paper-2)]"}`}
            onClick={() => setStep("payment")}
          >
            Payment
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === "confirming" ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--paper-2)]"}`}
            onClick={() => setStep("confirming")}
          >
            Confirm
          </button>
        </div>

        {step === "shipping" && (
          <form onSubmit={handlePlace} className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-card space-y-4">
            <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Delivery address</h3>
            <div>
              <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Name</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Address</label>
              <input type="text" name="address" required value={form.address} onChange={handleChange} className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide">City</label>
                <input type="text" name="city" required value={form.city} onChange={handleChange} className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Postcode</label>
                <input type="text" name="zip" required value={form.zip} onChange={handleChange} className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Country</label>
              <select name="country" value={form.country} onChange={handleChange} className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none">
                <option>United Kingdom</option>
                <option>United States</option>
                <option>France</option>
                <option>Germany</option>
                <option>Australia</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-3 rounded-full bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--ink-soft)] transition-colors">
                Continue to payment
              </button>
            </div>
          </form>
        )}

        {step === "payment" && (
          <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-card space-y-6">
            <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Payment details</h3>
            <p className="text-sm text-[var(--muted)]">
              We accept cards, Apple Pay, Google Pay, and bank transfer. When your order is placed, we will send a dedicated account receipt for the exact amount due.
            </p>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 border border-[var(--line)] rounded-md p-3 hover:bg-[var(--paper-2)] cursor-pointer">
                <input type="radio" name="payment" defaultChecked />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-[var(--ink)]">Card or digital wallet</p>
                  <p className="text-xs text-[var(--muted)]">Secure checkout, no saved details.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 border border-[var(--line)] rounded-md p-3 hover:bg-[var(--paper-2)] cursor-pointer">
                <input type="radio" name="payment" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-[var(--ink)]">Bank transfer</p>
                  <p className="text-xs text-[var(--muted)]">A dedicated account is sent to you for this order.</p>
                </div>
              </label>
            </div>
            <div className="border-t border-[var(--line)] pt-4 flex justify-between text-sm font-medium text-[var(--ink)]">
              <span>Total due</span>
              <span>€{total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Exclusive of applicable local taxes</span>
              <span>~4% estimate</span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep("confirming")}
                className="px-6 py-3 rounded-full bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--ink-soft)] transition-colors"
              >
                Review order
              </button>
            </div>
          </div>
        )}

        {step === "confirming" && (
          <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-card space-y-5">
            <h3 className="text-lg font-serif font-semibold text-[var(--ink)]">Review your order</h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-3">
                <p className="text-sm font-medium text-[var(--ink)]">{form.name}</p>
                <p className="text-sm text-[var(--muted)]">{form.email}</p>
                <p className="text-sm text-[var(--muted)]">{form.address}</p>
                <p className="text-sm text-[var(--muted)]">{form.city} {form.zip}</p>
              </div>
            </div>

            <div className="border-b border-[var(--line)] pb-4 space-y-2">
              {cart.map((line) => (
                <div key={line.id} className="flex justify-between text-sm text-[var(--ink)]">
                  <span>{line.title || "Product"} × {line.quantity}</span>
                  <span>€{(Number(line.price) || 0 * (Number(line.quantity) || 0)).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-medium text-[var(--ink)]">
              <span>Total</span>
              <span>€{total.toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Receipt sent to</span>
              <span>{form.email}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Direct account sent to</span>
              <span>{form.email}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Delivery estimate</span>
              <span>5-7 working days</span>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep("shipping")}
                className="px-4 py-2 rounded-full border border-[var(--line)] text-sm font-medium hover:bg-[var(--paper-2)] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setCart([]);
                  router.push("/orders");
                }}
                className="px-6 py-3 rounded-full bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--ink-soft)] transition-colors"
              >
                Place order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
