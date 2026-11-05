"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiShoppingBag,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/store";

const money = (value) => `$${Number(value).toFixed(2)}`;

const STEPS = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
];

const PAYMENT_METHODS = [
  {
    id: "paystack-card",
    title: "Card · Paystack",
    description: "Visa, Mastercard, or Verve through Paystack's secure checkout.",
    icon: FiCreditCard,
  },
  {
    id: "paystack-transfer",
    title: "Bank transfer · dedicated account",
    description: "Paystack issues a one-time account number for this order.",
    icon: FiSmartphone,
  },
  {
    id: "cod",
    title: "Pay on delivery",
    description: "Cash or transfer when your parcel arrives. Lagos & Abuja only.",
    icon: FiTruck,
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  notes: "",
};

const Checkout = () => {
  const { cartItems, cartCount, subtotal, delivery, total, placeOrder } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState("paystack-card");
  const [placed, setPlaced] = useState(null);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const shippingComplete =
    form.name && form.email && form.address && form.city && form.state;

  const handlePlaceOrder = () => {
    const order = placeOrder({ customer: form, payment });
    if (order) setPlaced(order);
  };

  if (placed) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <div className="aurora -top-16 left-1/2 h-56 w-56 -translate-x-1/2 bg-accent/30" />
            <div className="relative mx-auto flex max-w-md flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-glow">
                <FiCheckCircle size={28} />
              </span>
              <h1 className="mt-5 font-display text-3xl text-ink">Your glow is on its way</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Order <strong className="text-ink">{placed.id}</strong> is confirmed. A receipt
                is heading to {placed.customer?.email || "your inbox"}.
              </p>

              <div className="mt-6 w-full rounded-2xl border border-line bg-surface-2 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Items</span>
                  <span className="font-medium text-ink">
                    {placed.items.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Paid with</span>
                  <span className="font-medium capitalize text-ink">
                    {placed.payment.replace("paystack-", "").replace("-", " ")}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Total</span>
                  <span className="font-semibold text-ink">{money(placed.total)}</span>
                </div>
              </div>

              <div className="mt-7 flex w-full flex-col gap-2 sm:flex-row">
                <Link href="/Orders" className="btn-primary flex-1">
                  Track my order
                </Link>
                <Link href="/Shop" className="btn-secondary flex-1">
                  Keep shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (cartCount === 0) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Checkout"
            title="Nothing to check out — yet"
            description="Your bag is empty. Add a ritual and this page will pick up right where you left off."
            crumbs={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
          />
          <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FiShoppingBag size={22} />
            </span>
            <Link href="/Shop" className="btn-primary">
              Browse the shop
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Checkout"
          title="Three quiet steps"
          description="Shipping, payment, then a last look before your rituals are on their way."
          crumbs={[{ label: "Home", href: "/" }, { label: "Bag", href: "/Cart" }, { label: "Checkout" }]}
          actions={
            <Link href="/Cart" className="btn-secondary">
              <FiArrowLeft size={14} /> Back to bag
            </Link>
          }
        />

        <div className="flex items-center gap-2">
          {STEPS.map((item, index) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => (done || item.id === step ? setStep(item.id) : null)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "border-accent bg-accent text-accent-ink shadow-glow"
                      : done
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-line bg-surface/60 text-muted"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px]">
                    {done ? <FiCheck size={11} /> : item.id}
                  </span>
                  {item.label}
                </button>
                {index < STEPS.length - 1 && <span className="h-px flex-1 bg-line" />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="card p-5 sm:p-6">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink">Where should it go?</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    We ship within 1–2 business days from Brooklyn.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="label">
                      Full name
                    </label>
                    <input
                      id="name"
                      value={form.name}
                      onChange={update("name")}
                      className="field mt-1.5"
                      placeholder="Ada Nwosu"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className="field mt-1.5"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">
                      Phone
                    </label>
                    <input
                      id="phone"
                      value={form.phone}
                      onChange={update("phone")}
                      className="field mt-1.5"
                      placeholder="+234 800 000 0000"
                      autoComplete="tel"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="label">
                      Street address
                    </label>
                    <input
                      id="address"
                      value={form.address}
                      onChange={update("address")}
                      className="field mt-1.5"
                      placeholder="24 Petal Lane, Apt 3B"
                      autoComplete="street-address"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="label">
                      City
                    </label>
                    <input
                      id="city"
                      value={form.city}
                      onChange={update("city")}
                      className="field mt-1.5"
                      placeholder="Brooklyn"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="label">
                      State / region
                    </label>
                    <input
                      id="state"
                      value={form.state}
                      onChange={update("state")}
                      className="field mt-1.5"
                      placeholder="New York"
                      autoComplete="address-level1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="label">
                      Delivery notes (optional)
                    </label>
                    <input
                      id="notes"
                      value={form.notes}
                      onChange={update("notes")}
                      className="field mt-1.5"
                      placeholder="Leave with the concierge"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!shippingComplete}
                  className="btn-primary mt-1 self-start"
                >
                  Continue to payment
                  <FiArrowRight size={15} />
                </button>
                {!shippingComplete && (
                  <p className="text-[11px] text-muted">
                    Name, email, address, city, and state are needed to continue.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink">How would you like to pay?</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Payments are processed securely — this demo does not charge a card.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const active = payment === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayment(method.id)}
                        aria-pressed={active}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? "border-accent bg-accent-soft/60 shadow-soft"
                            : "border-line bg-surface/60 hover:border-line-strong"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            active ? "bg-accent text-accent-ink" : "bg-surface-2 text-ink-soft"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {method.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                            {method.description}
                          </span>
                        </span>
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            active ? "border-accent bg-accent text-accent-ink" : "border-line-strong"
                          }`}
                        >
                          {active && <FiCheck size={11} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[11px] text-ink-soft">
                  <FiLock size={13} className="text-accent" />
                  Encrypted checkout · we never store card details
                </div>

                <div className="mt-1 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setStep(3)} className="btn-primary">
                    Review order
                    <FiArrowRight size={15} />
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink">A last look</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Confirm the details below and we&apos;ll start packing.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-surface-2 p-4">
                    <p className="label">Deliver to</p>
                    <p className="mt-1.5 text-sm font-medium text-ink">{form.name}</p>
                    <p className="text-xs leading-relaxed text-ink-soft">
                      {form.address}
                      <br />
                      {form.city}, {form.state}
                      <br />
                      {form.email}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-2 text-[11px] font-semibold text-accent hover:opacity-70"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="rounded-2xl border border-line bg-surface-2 p-4">
                    <p className="label">Paying with</p>
                    <p className="mt-1.5 text-sm font-medium capitalize text-ink">
                      {payment.replace("paystack-", "").replace("-", " ")}
                    </p>
                    <p className="text-xs leading-relaxed text-ink-soft">
                      {payment === "cod"
                        ? "Payment collected on delivery."
                        : "A secure Paystack prompt follows on confirmation."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-2 text-[11px] font-semibold text-accent hover:opacity-70"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink">{item.title}</span>
                        <span className="text-[11px] text-muted">Qty {item.qty}</span>
                      </span>
                      <span className="text-sm font-medium text-ink">
                        {money(item.price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handlePlaceOrder} className="btn-primary">
                    Place order · {money(total)}
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="card sticky top-24 p-5">
            <h2 className="font-display text-lg text-ink">Your bag</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-ink-soft">
                    {item.title} <span className="text-muted">×{item.qty}</span>
                  </span>
                  <span className="shrink-0 font-medium text-ink">
                    {money(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="divider my-4" />

            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-medium text-ink">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="font-medium text-ink">
                  {delivery === 0 ? "Free" : money(delivery)}
                </dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <dt className="font-display text-base text-ink">Total</dt>
                <dd className="font-display text-2xl text-ink">{money(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
