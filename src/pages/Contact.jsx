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

const CHANNELS = [
  {
    icon: FiMail,
    label: "Email",
    value: "hello@bloomandglow.com",
    detail: "We reply within one business day.",
  },
  {
    icon: FiPhone,
    label: "Phone",
    value: "+1 (555) 014-8820",
    detail: "Mon–Fri, 9am–6pm ET.",
  },
  {
    icon: FiMapPin,
    label: "Studio",
    value: "24 Petal Lane, Brooklyn",
    detail: "Bookings by appointment.",
  },
  {
    icon: FiClock,
    label: "Dispatch",
    value: "Ships in 1–2 days",
    detail: "Free over $75, tracked.",
  },
];

const FAQS = [
  {
    question: "How long does delivery take?",
    answer: "Orders leave our Brooklyn studio within 1–2 business days, then arrive in 2–5 days depending on your region.",
  },
  {
    question: "Can I return an opened ritual?",
    answer: "Unopened products can be returned within 30 days. If your skin reacted, message us and we'll make it right.",
  },
  {
    question: "Do you restock sold-out formulas?",
    answer: "Most bestsellers restock every few weeks. Join the glow letter and you'll hear before it goes live.",
  },
  {
    question: "Are the formulas cruelty-free?",
    answer: "Yes — always. No animal testing at any stage, and no third-party suppliers who test on our behalf.",
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
          title="Say hello — we're listening"
          description="Questions about a formula, an order, or a shade? A real person reads every message."
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
                      placeholder="Ada Nwosu"
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
                      <option>Press & partnerships</option>
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
              <Titles eyebrow="Studio" title="Come say hi" subtext="Our Brooklyn studio is open by appointment — skincare consults, shade matching, and a very good pot of tea." />
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                <div className="dot-grid flex h-40 items-center justify-center bg-surface-2">
                  <span className="stat-pill bg-surface">
                    <FiMapPin size={12} className="text-accent" /> 24 Petal Lane
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="label">Response time</p>
              <p className="mt-2 font-display text-3xl text-ink">~4 hrs</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Average first reply during studio hours. Weekends are a little slower —
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
