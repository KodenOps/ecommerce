import React from "react";
import Link from "next/link";

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop?category=Skincare", label: "Skincare" },
    { href: "/shop?category=Lips%20&%20Blush", label: "Lips & Blush" },
    { href: "/shop?category=Mists%20&%20Toners", label: "Mists & Toners" },
    { href: "/shop?category=Body%20Glow", label: "Body Glow" },
    { href: "/shop?category=Scented%20Candles", label: "Scented Candles" },
    { href: "/shop?category=Gifts%20&%20Sets", label: "Gifts & Sets" },
  ],
  Company: [
    { href: "/contact", label: "Contact" },
    { href: "/promos", label: "Promotions" },
    { href: "/orders", label: "Orders" },
  ],
  Support: [
    { href: "/contact", label: "Get in Touch" },
    { href: "/contact", label: "Shipping & Returns" },
    { href: "/contact", label: "FAQ" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 text-base font-medium tracking-tight">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[var(--line)] bg-[var(--paper)] text-sm font-serif font-semibold">
                BW
              </span>
              Bloom &amp; Wardrobe
            </Link>
            <p className="mt-3 lede max-w-sm">
              A small, considered collection of beauty rituals and essentials —
              chosen for the everyday moments that deserve a little more care.
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              hello@bloomwardrobe.com<br />
              Mon to Fri, 9:00 to 18:00
            </p>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--ink)] uppercase">Shop</h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--ink-soft)]">
              {FOOTER_LINKS.Shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link text-sm block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--ink)] uppercase">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--ink-soft)]">
              {FOOTER_LINKS.Company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link text-sm block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-sm font-semibold tracking-wide text-[var(--ink)] uppercase">Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-[var(--ink-soft)]">
              {FOOTER_LINKS.Support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link text-sm block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--line)] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <p>&copy; {new Date().getFullYear()} Bloom &amp; Wardrobe. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <Link href="/contact" className="link text-xs">Privacy</Link>
            <Link href="/contact" className="link text-xs">Terms</Link>
            <Link href="/contact" className="link text-xs">Cookies</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
