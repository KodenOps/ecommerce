"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/store";
import { FiMenu, FiX, FiHeart, FiShoppingBag, FiUser, FiChevronRight } from "react-icons/fi";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/promos", label: "Promos" },
  { href: "/contact", label: "Contact" },
  { href: "/orders", label: "Orders" },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, favorites } = useStore();

  const cartCount = Array.isArray(cart)
    ? cart.reduce((sum, line) => sum + Math.max(0, Number(line.quantity) || 0), 0)
    : 0;

  const favCount = Array.isArray(favorites)
    ? favorites.length
    : 0;

  useEffect(() => {
    const handle = () => setMobileOpen(false);
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      {/* top header */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--card)]/92 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--line)] bg-[var(--paper)] text-sm font-serif font-semibold text-[var(--ink)]">
              BW
            </span>
            <span className="text-base font-medium tracking-tight">Bloom &amp; Wardrobe</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--ink-soft)]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
              <FiShoppingBag size={18} />
              <span className="tabular-nums">{cartCount}</span>
            </button>
            <button className="relative flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
              <FiHeart size={18} />
              {favCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-medium flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </button>
            <Link href="/contact" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
              <FiUser size={18} />
              <span className="hidden lg:inline">Account</span>
            </Link>
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-[var(--line)] hover:bg-[var(--paper-2)]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* side nav overlay backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* side navigation */}
        <aside
          className={`fixed top-0 left-0 z-40 h-full w-64 bg-[var(--card)] border-r border-[var(--line)] transform transition-transform duration-200 ease-out md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--line)]">
              <span className="text-sm font-medium tracking-tight">Navigation</span>
              <button
                className="md:hidden w-7 h-7 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)]"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <FiX size={16} />
              </button>
            </div>

            <nav className="flex flex-col px-3 py-4 gap-1 text-sm font-medium">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center gap-2 rounded-md px-3 py-2.5 text-[var(--ink-soft)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)] transition-colors"
                >
                  {link.label}
                  <FiChevronRight size={14} className="ml-auto text-[var(--muted)] group-hover:text-[var(--ink-soft)]" />
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-[var(--line)] px-5 py-4 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Cart {cartCount}</span>
              <span>Favorites {favCount}</span>
            </div>
          </div>
        </aside>

        {/* main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
