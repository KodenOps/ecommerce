"use client";
import React from "react";
import Titles from "@/components/Titles";
import { FiPhone, FiMail, FiMapPin, FiClock, FiMessageSquare, FiArrowRight } from "react-icons/fi";

const CONTACT_BLOCKS = [
  {
    icon: FiMail,
    label: "Email",
    value: "hello@bloomwardrobe.com",
    href: "mailto:hello@bloomwardrobe.com",
  },
  {
    icon: FiPhone,
    label: "Phone",
    value: "+1 (555) 123 4567",
    href: "tel:+15551234567",
  },
  {
    icon: FiMapPin,
    label: "Studio",
    value: "14 Dublin Lane, London",
  },
  {
    icon: FiClock,
    label: "Studio hours",
    value: "Monday to Friday, 9:00 – 18:00",
  },
];

const FAQ = [
  { q: "How long does shipping take?", a: "For most orders, 3 to 5 business days." },
  { q: "Can I change or cancel my order?", a: "Yes, while it is being prepared. Contact us within 24 hours." },
  { q: "Do you offer global shipping?", a: "We currently ship domestically and select international addresses." },
  { q: "What is your return window?", a: "Items may be returned within 14 days of delivery." },
];

const Contact = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitted2, setSubmitted2] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleMessage = (e) => {
    e.preventDefault();
    setSubmitted2(true);
  };

  return (
    <div className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <div className="max-w-2xl">
          <Titles title="Contact" subtext="A short note forms the first line of a relationship. Tell us what you need, and we will reply the same day." />
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-5">
            {CONTACT_BLOCKS.map((block) => (
              <div key={block.label} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-[var(--paper-2)] flex items-center justify-center text-[var(--accent)]">
                  <block.icon size={16} />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{block.label}</p>
                  {block.href ? (
                    <a href={block.href} className="text-sm text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
                      {block.value}
                    </a>
                  ) : (
                    <p className="text-sm text-[var(--ink-soft)]">{block.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-xl bg-[var(--paper-2)] p-5 space-y-4 border border-[var(--line)]">
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Message</label>
                <textarea
                  rows={4}
                  required
                  className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--ink-soft)] transition-colors">
                Send message
                <FiArrowRight size={14} />
              </button>
              {submitted && <p className="text-sm text-[var(--accent)]">Thanks — we will reply shortly.</p>}
            </form>

            <form onSubmit={handleMessage} className="rounded-xl bg-[var(--paper-2)] p-5 space-y-4 border border-[var(--line)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[var(--muted)] uppercase tracking-wide">Message</label>
                <textarea rows={4} required className="mt-1 w-full rounded-md border border-[var(--line)] px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink)] text-white text-sm font-semibold hover:bg-[var(--ink-soft)] transition-colors">
                Send message
                <FiArrowRight size={14} />
              </button>
              {submitted2 && <p className="text-sm text-[var(--accent)]">Your message has been received.</p>}
            </form>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-[var(--ink)]">Frequently asked questions</h3>
          <div className="mt-5 space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-[var(--line)] pb-3">
                <p className="text-sm font-medium text-[var(--ink)]">{item.q}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
