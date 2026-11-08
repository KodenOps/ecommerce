import React from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";

const storeName = "QueenFizzie";
const lastUpdated = "6 November 2026";

const SECTIONS = [
  {
    id: "overview",
    eyebrow: "The short version",
    title: "We keep it small",
    body: [
      "We only collect the details we need to take your order, reply to you, and improve the store. We do not sell your personal information, and we do not build profiles to sell to advertisers.",
      "This policy covers the QueenFizzie website, checkout, contact form, email and messaging tools, and any admin access we give to staff or shop partners.",
    ],
  },
  {
    id: "what",
    eyebrow: "What we collect",
    title: "What personal data we use",
    body: [
      "To place and track an order we collect your full name, email address, phone number, delivery address, and the payment receipt you upload at checkout.",
      "When you contact us through the website or email, we keep your message, the subject you choose, and any order number you reference so we can answer you.",
      "If you subscribe to the glow letter, we keep the email address you gave us and whether you later opted out.",
    ],
  },
  {
    id: "why",
    eyebrow: "Why we use it",
    title: "Why we hold it",
    body: [
      "Your details exist so we can confirm and dispatch your order, match your payment receipt, reply to your messages, and handle returns or damaged goods.",
      "We use email and phone only to contact you about orders, delivery, returns, or direct marketing you agreed to receive.",
    ],
  },
  {
    id: "sharing",
    eyebrow: "Sharing",
    title: "Who we share it with",
    body: [
      "We do not sell or rent your data. We only share what is necessary to fulfil an order — for example, delivery logistics or payment verification — and only with people or services we trust to handle it for that purpose.",
      "We may share order details with a payment or bank partner when you pay, and with courier or dispatch partners when we need to move your order.",
      "We will only disclose personal information if the law requires it, or if we reasonably believe we must to protect people or stop fraud.",
    ],
  },
  {
    id: "cookies",
    eyebrow: "Cookies & tracking",
    title: "Cookies and analytics",
    body: [
      "The site uses essential cookies to keep the cart, session and checkout working. We also use analytics cookies to understand how the store is used, purely so we can improve it.",
      "You can refuse non-essential cookies in your browser. Essential cookies stay on because the store would break without them.",
    ],
  },
  {
    id: "rights",
    eyebrow: "Your rights",
    title: "Your rights over your data",
    body: [
      "You can ask us what personal data we hold about you, ask us to correct it, or ask us to stop using it for marketing.",
      "Where the law allows, you can ask us to delete your data. We may keep some order records even after deletion, where we are required to by tax, payment or consumer law.",
      "To exercise any of these rights, reply to any QueenFizzie order email or write to hello@queenfizzie.com.",
    ],
  },
  {
    id: "security",
    eyebrow: "Keeping it safe",
    title: "How we protect it",
    body: [
      "We store order and customer information securely, restrict access to the people who need it, and use reasonable technical and organisational measures to stop unauthorised access.",
      "No system is perfectly safe. If we learn of a breach that could affect your personal data, we will tell you promptly and take steps to limit the harm.",
    ],
  },
];

export default function Privacy() {
  return (
    <Layout>
      <div>
        <div className="mb-12">
          <h1 className="mb-1 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Privacy policy
          </h1>
          <p className="mb-1 text-sm font-medium text-accent uppercase tracking-[0.2em]">
            Your data, plainly
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
          <p className="font-display text-xl text-ink">Questions about privacy?</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Email{" "}
            <a href="mailto:hello@queenfizzie.com" className="text-accent underline">
              hello@queenfizzie.com
            </a>{" "}
            or call +234 803 000 0000. We reply within one business day.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-ink px-6 py-5 text-canvas text-sm sm:px-8">
          <p className="mb-1 font-semibold">Want to know more first?</p>
          <p className="text-canvas/80">
            Read the terms and the delivery details before you buy.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/Terms" className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-5 py-2 text-xs font-semibold transition-colors hover:underline">
              Terms &amp; conditions <FiArrowRight size={13} />
            </Link>
            <Link href="/Delivery" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-ink transition-colors hover:brightness-110">
              Delivery &amp; returns <FiArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
