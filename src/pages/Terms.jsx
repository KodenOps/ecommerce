"use client";

import React from "react";
import LegalPage from "@/components/LegalPage";
import { STORE } from "@/data/nigeria";
import { FREE_DELIVERY_OVER } from "@/lib/pricing";
import { formatNaira } from "@/lib/money";

const SECTIONS = [
  {
    title: "About these terms",
    paragraphs: [
      `These terms govern your use of the ${STORE.name} website and your purchases from us. By browsing the site or placing an order, you agree to them. If you do not agree, please do not use the site.`,
      `In these terms, "we", "us" and "our" refer to ${STORE.name}, Lekki, Lagos, Nigeria.`,
    ],
  },
  {
    title: "Your account",
    bullets: [
      "You must be at least 18 years old, or have a parent or guardian's permission, to create an account.",
      "Give accurate details and keep your password private. You are responsible for activity under your account.",
      "We may suspend an account that we believe is being used fraudulently or abusively.",
    ],
  },
  {
    title: "Products and availability",
    paragraphs: [
      "We sell original products, inspected and sealed before dispatch. Stock is limited to what is available, so an item may sell out between browsing and checkout. Colours and packaging may vary slightly from photographs depending on your screen.",
      "We may limit quantities on promotional items or refuse an order where we suspect reselling abuse or an error in price or description.",
    ],
  },
  {
    title: "Prices and payment",
    bullets: [
      `All prices are in Nigerian Naira (₦). Delivery is ₦3,500 nationwide and free on orders from ${formatNaira(FREE_DELIVERY_OVER)}.`,
      "Orders are paid by bank transfer. Transfer the exact total, then upload your payment receipt at checkout.",
      "Your order shows Confirming Payment until our team verifies your transfer against the receipt.",
      "An incorrect amount or an unreadable receipt can delay or cancel an order. We may refund any amount that cannot be matched to an order.",
      "Promotional codes are one per order, cannot be exchanged for cash, and may be withdrawn at any time.",
    ],
  },
  {
    title: "Order acceptance",
    paragraphs: [
      "Your order is accepted only after we confirm your payment. We may cancel and refund an order if payment cannot be verified, if the item is unavailable, or if the order appears fraudulent.",
    ],
  },
  {
    title: "Delivery",
    bullets: [
      "Lagos orders normally arrive within 24–48 hours after payment confirmation.",
      "Other states normally arrive within 2–5 working days after dispatch from Lekki, Lagos.",
      "Delays caused by logistics partners, weather, traffic or public holidays are outside our control.",
      "You are responsible for giving a correct address and a reachable phone number. Additional delivery attempts may attract a fee.",
    ],
  },
  {
    title: "Returns and refunds",
    bullets: [
      "Unopened items may be returned within 7 days of delivery.",
      "If an item arrives damaged or you receive the wrong product, contact us within 48 hours with photographs so we can fix it.",
      "Opened skincare, cosmetics, fragrance and hygiene items cannot be returned, except where they arrived damaged or faulty.",
      "Approved refunds are sent back by bank transfer to the account you paid from, after inspection.",
    ],
  },
  {
    title: "Promotions and gift sets",
    paragraphs: [
      "Sale prices, bundle offers and promo codes are valid while stock lasts and for the stated period only. Gift sets are curated as described and individual contents may change to an equivalent item when a component is out of stock.",
    ],
  },
  {
    title: "Intellectual property",
    paragraphs: [
      "The QueenFizzie name, logo, product photography, copy and design on this site belong to us and may not be copied, resold or used commercially without our written permission.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "Do not attempt to break into the site, scrape it at scale, upload malicious files, impersonate another person, or use the store for fraudulent payments or prohibited goods. We may block access and report unlawful activity.",
    ],
  },
  {
    title: "Liability",
    paragraphs: [
      "To the fullest extent permitted by Nigerian law, we are not liable for indirect or consequential loss arising from your use of the site. Our total liability for any order is limited to the amount you paid for that order. Nothing in these terms excludes liability that cannot be excluded by law, including for death, personal injury caused by negligence, or fraud.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Nigeria have jurisdiction over any dispute.",
    ],
  },
  {
    title: "Changes and contact",
    paragraphs: [
      "We may update these terms from time to time; the date at the top shows the latest version. Continuing to use the site after a change means you accept the updated terms.",
      `Questions? Email ${STORE.email}, call ${STORE.phone}, or visit us at ${STORE.address}.`,
    ],
  },
];

const Terms = () => (
  <LegalPage
    eyebrow="Terms"
    title="Terms & Conditions"
    description="The rules that apply when you shop with QueenFizzie."
    updated="6 November 2026"
    sections={SECTIONS}
  />
);

export default Terms;
