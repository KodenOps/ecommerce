import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";

const storeName = "QueenFizzie";
const lastUpdated = "6 November 2026";

const SECTIONS = [
  {
    id: "using",
    eyebrow: "Using the store",
    title: "Using QueenFizzie",
    body: [
      "These terms explain how we sell skincare, body routines and scents. By placing an order, submitting a form, or using any of our checkout, contact or admin features, you agree to the terms below as they read on the day you use them.",
      "We only sell genuine, sealed products. We do not mix batches, and every item is inspected before we pack it. Anything we can’t stand behind returns to us, not to you.",
    ],
  },
  {
    id: "orders",
    eyebrow: "What you buy",
    title: "Orders, payment and dispatch",
    body: [
      "Your order is not confirmed until we receive and verify payment. Bank transfers must match the order total and the account name you used at checkout, otherwise we pause the order and message you.",
      "Lagos orders usually arrive within 24–48 hours. Every other state takes 2–5 working days after dispatch from our Shomolu studio. You can follow order status on your Orders page.",
      "If something arrives damaged, contact us with your order number and a photo. We make it right at our discretion — replacement, refund, or both. Unopened products can be returned within 7 days of delivery.",
    ],
  },
  {
    id: "policies",
    eyebrow: "Your rights",
    title: "Returns, data and refunds",
    body: [
      "Approved refunds go back to the original payment method. Processing can take 3–5 working days after we receive the item back.",
      "We only collect the details we need to place, track and contact you about an order — name, email, phone, shipping address and the payment receipt you upload. We do not sell your personal data. You can ask us to correct or delete it by replying to any order email.",
      "Where we send promotional messages, you can opt out at any time by replying STOP or choosing unsubscribe in the message.",
    ],
  },
  {
    id: "authored",
    eyebrow: "Written for",
    title: "Who these terms are for",
    body: [
      "These terms cover every visitor, shopper, buyer and admin user of QueenFizzie — the store, the website and any of its connected email or messaging tools.",
      "If you run a shop, brand, salon or corporate account with us, nothing here limits the separate agreements we sign for bulk, bridal or wholesale orders. Those sit on top of these terms, not beneath them.",
    ],
  },
];

export default function Terms() {
  return (
    <Layout>
      <div>
        <div className="mb-12">
          <h1 className="mb-1 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Terms &amp; conditions
          </h1>
          <p className="mb-1 text-sm font-medium text-accent uppercase tracking-[0.2em]">
            How to use QueenFizzie
          </p>
          <p className="text-xs text-muted">
            Last updated {lastUpdated} · {storeName} · Shomolu, Lagos
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="mb-4 flex items-center gap-3 border-b border-line pb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                  {section.eyebrow}
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-ink">{section.title}</h2>
              <div className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="my-12 rounded-2xl border border-line bg-surface-2/60 p-5">
          <p className="font-display text-xl text-ink">Questions about these terms?</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Email hello@queenfizzie.com or call +234 803 000 0000. We reply within one business day.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-ink px-6 py-5 text-canvas text-sm sm:px-8">
          <p className="mb-1 font-semibold">Not quite ready to buy?</p>
          <p className="text-canvas/80">
            Read the delivery and payment details first — or jump straight to the shelf.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/Delivery" className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-5 py-2 text-xs font-semibold transition-colors hover:underline">
              Delivery &amp; returns <FiArrowRight size={13} />
            </Link>
            <Link href="/shop" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-ink transition-colors hover:brightness-110">
              Shop products <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
