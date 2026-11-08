"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSend,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Titles from "@/components/Titles";
import { STORE } from "@/data/nigeria";
import { formatNaira } from "@/lib/money";
import { FREE_DELIVERY_OVER } from "@/lib/pricing";

const CHANNELS = [
  {
    icon: FiMail,
    label: "Email",
    value: STORE.email,
    detail: "We reply within one business day.",
  },
  {
    icon: FiPhone,
    label: "Phone",
    value: STORE.phone,
    detail: STORE.hours,
  },
  {
    icon: FiMapPin,
    label: "Studio",
    value: STORE.address,
    detail: "Pickups by appointment.",
  },
  {
    icon: FiClock,
    label: "Dispatch",
    value: "Ships from Shomolu",
    detail: `Free over ${formatNaira(FREE_DELIVERY_OVER)}, nationwide.`,
  },
];

const FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Lagos orders arrive in 24–48 hours. Every other state takes 2–5 working days after dispatch from Shomolu. You can follow the status on your Orders page.",
  },
  {
    question: "How do I pay for my order?",
    answer:
      "Place your order, transfer the total to our store account, then upload your receipt at checkout. Our team confirms the transfer before dispatch.",
  },
  {
    question: "Are the products original?",
    answer:
      "Yes — 100% original and tested & trusted. Every item is sealed and inspected before packing, and we never mix batches.",
  },
  {
    question: "Can I return an item?",
    answer:
      "Unopened products can be returned within 7 days of delivery. If something arrived damaged, message us with a photo and we will make it right.",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "Order help", message: "" });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Contact"
          title="Talk to QueenFizzie"
          description="Questions about an order, a formula or a shade match? Our Lagos team reads every message."
          crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
          actions={
            <Link href="/Orders" className="btn-secondary">
              Check an order
            </Link>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.label} className="card card-hover p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon size={16} />
                </span>
                <p className="mt-3 label">{channel.label}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{channel.value}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{channel.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
          <div className="card p-5 sm:p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-glow">
                  <FiCheckCircle size={24} />
                </span>
                <h2 className="font-display text-2xl text-ink">Message received</h2>
                <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
                  Thanks {form.name || "friend"} — we&apos;ll reply to {form.email || "your inbox"} within
                  one business day.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "Order help", message: "" });
                  }}
                  className="btn-secondary mt-2"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink">Send a note</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Include your order number if it&apos;s about a delivery.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="label">
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      required
                      value={form.name}
                      onChange={update("name")}
                      className="field mt-1.5"
                      placeholder="Chiamaka Okafor"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      className="field mt-1.5"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-subject" className="label">
                      What&apos;s it about?
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={update("subject")}
                      className="field mt-1.5 cursor-pointer"
                    >
                      <option>Order help</option>
                      <option>Product advice</option>
                      <option>Returns</option>
                      <option>Bulk & bridal orders</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className="label">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={update("message")}
                      className="field mt-1.5 resize-y"
                      placeholder="Tell us what's on your mind…"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary self-start">
                  Send message
                  <FiSend size={14} />
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <Titles eyebrow="Studio" title="Visit our Shomolu studio" subtext="Open by appointment — product consults, shade matching, and pickup for Lagos orders. Zobo on the house." />
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                <div className="dot-grid flex h-40 items-center justify-center bg-surface-2">
                  <span className="stat-pill bg-surface">
                    <FiMapPin size={12} className="text-accent" /> Onabola Junction, Shomolu
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="label">Response time</p>
              <p className="mt-2 font-display text-3xl text-ink">~4 hrs</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Average first reply during studio hours. Sundays are a little slower —
                we&apos;re probably at the market.
              </p>
            </div>
          </div>
        </div>

        <section>
          <Titles eyebrow="FAQ" title="The things people ask most" />
          <div className="mt-5 flex flex-col gap-2">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.question} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-ink">{faq.question}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-accent transition-transform duration-200 ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;
