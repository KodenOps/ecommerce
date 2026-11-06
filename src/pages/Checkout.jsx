"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiFileText,
  FiLock,
  FiShoppingBag,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";
import { NIGERIAN_STATES, STORE } from "@/data/nigeria";

const STEPS = [
  { id: 1, label: "Delivery" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Review" },
];

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const ALLOWED_RECEIPT_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

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
  const { cartItems, cartCount, subtotal, delivery, total, createOrder } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const deliveryComplete =
    form.name && form.phone && form.address && form.city && form.state;

  const handleReceipt = (event) => {
    const file = event.target.files?.[0];
    setReceiptError("");
    setSubmitError("");

    if (!file) return;

    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      setReceipt(null);
      setReceiptError("Upload a PNG, JPG or PDF receipt.");
      return;
    }

    if (file.size > MAX_RECEIPT_BYTES) {
      setReceipt(null);
      setReceiptError("That file is too large. Please upload a receipt under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceipt({
        dataUrl: String(reader.result),
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.onerror = () => {
      setReceipt(null);
      setReceiptError("We could not read that file. Please try another one.");
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceipt(null);
    setReceiptError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(STORE.bank.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      /* clipboard may be unavailable */
    }
  };

  const handleCompleteOrder = async () => {
    if (!receipt || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const order = await createOrder({ customer: form, receipt });
      if (order) setPlaced(order);
    } catch (error) {
      setSubmitError(error.message || "We could not submit your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <div className="aurora -top-16 left-1/2 h-56 w-56 -translate-x-1/2 bg-accent/30" />
            <div className="relative mx-auto flex max-w-md flex-col items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent shadow-soft">
                <FiClock size={28} />
              </span>
              <h1 className="mt-5 font-display text-3xl text-ink">Order received, Queen</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Receipt uploaded for order <strong className="text-ink">{placed.id}</strong>.
                Our team is verifying your transfer now.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
                <FiClock size={13} /> Confirming Payment
              </span>

              <div className="mt-6 w-full rounded-2xl border border-line bg-surface-2 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Items</span>
                  <span className="font-medium text-ink">
                    {placed.items.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Payment</span>
                  <span className="font-medium text-ink">Bank transfer</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Total</span>
                  <span className="font-semibold text-ink">{formatNaira(placed.total)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-ink-soft">Deliver to</span>
                  <span className="max-w-[60%] text-right font-medium text-ink">
                    {placed.customer?.city}, {placed.customer?.state}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted">
                Your status stays <strong className="text-ink">Confirming Payment</strong> until
                the transfer is approved. You can follow it on your Orders page.
              </p>

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
            description="Your bag is empty. Add a product and this page will pick up right where you left off."
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
          title="Three quick steps"
          description="Delivery details, bank transfer with your receipt, then a last look before we pack your order."
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
                    We dispatch from Lekki, Lagos — nationwide in 1–5 working days.
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
                      placeholder="Chiamaka Okafor"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">
                      Phone (for delivery)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      className="field mt-1.5"
                      placeholder="0803 000 0000"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">
                      Email (optional)
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
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="label">
                      Street address
                    </label>
                    <input
                      id="address"
                      value={form.address}
                      onChange={update("address")}
                      className="field mt-1.5"
                      placeholder="15B Admiralty Way, Lekki Phase 1"
                      autoComplete="street-address"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="label">
                      City / town
                    </label>
                    <input
                      id="city"
                      value={form.city}
                      onChange={update("city")}
                      className="field mt-1.5"
                      placeholder="Lagos"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="label">
                      State
                    </label>
                    <select
                      id="state"
                      value={form.state}
                      onChange={update("state")}
                      className="field mt-1.5 cursor-pointer"
                      autoComplete="address-level1"
                    >
                      <option value="">Select your state</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
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
                      placeholder="Near the yellow gate, call when you arrive"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!deliveryComplete}
                  className="btn-primary mt-1 self-start"
                >
                  Continue to payment
                  <FiArrowRight size={15} />
                </button>
                {!deliveryComplete && (
                  <p className="text-[11px] text-muted">
                    Name, phone, address, city and state are needed to continue.
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink">Pay by bank transfer</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Transfer the exact amount, then upload your receipt below. We verify
                    every payment before dispatch.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-surface-2 p-4">
                  <p className="label">Transfer to</p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">{STORE.bank.bankName}</p>
                  <p className="text-xs text-ink-soft">{STORE.bank.accountName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-[0.18em] text-ink">
                      {STORE.bank.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={copyAccountNumber}
                      className="btn-icon h-8 w-8"
                      aria-label="Copy account number"
                    >
                      {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                    </button>
                  </div>
                  <div className="divider my-3" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-ink-soft">Amount to transfer</span>
                    <span className="font-display text-xl text-ink">{formatNaira(total)}</span>
                  </div>
                </div>

                <div>
                  <p className="label mb-2">Upload payment receipt</p>
                  {receipt ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft/50 p-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
                        {receipt.type === "application/pdf" ? (
                          <FiFileText size={22} className="text-accent" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={receipt.dataUrl}
                            alt="Uploaded receipt preview"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                          <FiCheckCircle size={14} className="text-accent" /> Receipt attached
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink-soft">
                          {receipt.name} · {(receipt.size / 1024).toFixed(0)} KB
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={removeReceipt}
                        className="btn-icon h-8 w-8"
                        aria-label="Remove receipt"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="receipt"
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-4 py-8 text-center transition-colors hover:border-accent/50 hover:bg-surface-2"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <FiUploadCloud size={19} />
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        Tap to upload your receipt
                      </span>
                      <span className="text-[11px] text-muted">PNG, JPG or PDF · max 5MB</span>
                      <input
                        ref={fileInputRef}
                        id="receipt"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,application/pdf"
                        onChange={handleReceipt}
                        className="sr-only"
                      />
                    </label>
                  )}
                  {receiptError && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-accent">
                      <FiAlertCircle size={12} /> {receiptError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[11px] text-ink-soft">
                  <FiLock size={13} className="text-accent" />
                  Your receipt is only used to confirm this payment.
                </div>

                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!receipt}
                    className="btn-primary"
                  >
                    Review order
                    <FiArrowRight size={15} />
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back
                  </button>
                </div>
                {!receipt && (
                  <p className="text-[11px] text-muted">
                    Upload your receipt to continue to the review step.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink">A last look</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Confirm the details below and tap Complete order. We start packing as
                    soon as your transfer is confirmed.
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
                      {form.phone}
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
                    <p className="label">Payment</p>
                    <p className="mt-1.5 text-sm font-medium text-ink">Bank transfer</p>
                    <p className="text-xs leading-relaxed text-ink-soft">
                      {receipt ? `Receipt attached · ${receipt.name}` : "No receipt uploaded yet."}
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
                        {formatNaira(item.price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                {submitError && (
                  <p className="flex items-center gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
                    <FiAlertCircle size={13} /> {submitError}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    disabled={!receipt || submitting}
                    className="btn-primary"
                  >
                    {submitting ? "Submitting…" : `Complete order · ${formatNaira(total)}`}
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                    Back
                  </button>
                </div>
                <p className="text-[11px] text-muted">
                  Your order shows <strong className="text-ink">Confirming Payment</strong>{" "}
                  until our team verifies the transfer.
                </p>
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
                    {formatNaira(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="divider my-4" />

            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-medium text-ink">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="font-medium text-ink">
                  {delivery === 0 ? "Free" : formatNaira(delivery)}
                </dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <dt className="font-display text-base text-ink">Total</dt>
                <dd className="font-display text-2xl text-ink">{formatNaira(total)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-col gap-1.5 text-[11px] text-muted">
              <span>{STORE.bank.bankName} · {STORE.bank.accountNumber}</span>
              <span>Nationwide delivery · 1–5 working days</span>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
