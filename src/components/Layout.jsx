"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiHeart,
  FiHome,
  FiMail,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiUser,
  FiX,
  FiMenu,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: FiHome },
  { label: "Shop", href: "/Shop", icon: FiShoppingBag },
  { label: "Promos", href: "/Promos", icon: FiTag },
  { label: "Orders", href: "/Orders", icon: FiPackage },
  { label: "Contact", href: "/Contact", icon: FiMail },
];

const SIDE_LINKS = [
  ...NAV_ITEMS,
  { label: "Favorites", href: "/Favorites", icon: FiHeart },
  { label: "Your bag", href: "/Cart", icon: FiShoppingBag },
];

function BrandMark({ compact = false }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 select-none">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow transition-transform duration-300 group-hover:scale-105">
        <GiQueenCrown size={20} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          Queen<span className="text-accent">Fizzie</span>
        </span>
        {!compact && (
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-accent">
            Naija beauty
          </span>
        )}
      </span>
    </Link>
  );
}

function Announcement() {
  return (
    <div className="relative overflow-hidden bg-ink text-canvas">
      <div className="shell flex h-9 items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em]">
        <span className="hidden sm:inline opacity-70">Free delivery over ₦150,000</span>
        <span className="hidden sm:inline opacity-40">·</span>
        <span className="opacity-90">100% original · tested &amp; trusted</span>
        <span className="hidden md:inline opacity-40">·</span>
        <span className="hidden md:inline opacity-70">Nationwide delivery from Lagos</span>
      </div>
    </div>
  );
}

function Header({ onOpenMenu, pathname }) {
  const { cartCount } = useStore();

  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-b border-line/80">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark />
          </div>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.toLowerCase().startsWith(item.href.toLowerCase());
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: account, bag, then the mobile menu button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/Contact"
              className="btn-icon hidden sm:inline-flex"
              aria-label="Account and help"
              title="Account"
            >
              <FiUser size={17} />
            </Link>
            <Link
              href="/Cart"
              className="btn-icon relative"
              aria-label="Your bag"
              title="Your bag"
            >
              <FiShoppingBag size={17} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={onOpenMenu}
              className="btn-icon lg:hidden"
              aria-label="Open menu"
            >
              <FiMenu size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SideRail({ pathname }) {
  const { cartCount, subtotal, favorites } = useStore();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-6 pb-10">
        <div className="card p-5">
          <p className="label">Menu</p>
          <nav className="mt-3 flex flex-col gap-1" aria-label="Sections">
            {SIDE_LINKS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.toLowerCase() === item.href.toLowerCase();
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Icon size={16} className={active ? "text-accent" : "text-muted group-hover:text-accent"} />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/Cart" && cartCount > 0 && (
                    <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-ink">
                      {cartCount}
                    </span>
                  )}
                  {item.href === "/Favorites" && favorites.length > 0 && (
                    <span className="rounded-full bg-violet-soft px-1.5 text-[10px] font-bold text-violet">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-accent-soft via-surface-2 to-violet-soft p-5">
            <p className="eyebrow">Queen&apos;s bag</p>
            <p className="mt-2 font-display text-lg leading-snug text-ink">
              Your bag, softly summarised.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {cartCount === 0
                ? "Nothing in the bag yet — start with a bestseller."
                : `${cartCount} ${cartCount === 1 ? "item" : "items"} · ${formatNaira(subtotal)}`}
            </p>
            <Link href={cartCount === 0 ? "/Shop" : "/Cart"} className="btn-primary mt-4 w-full text-xs">
              {cartCount === 0 ? "Browse the shop" : "View your bag"}
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface/60 px-4 py-3">
          <span className="text-xs font-medium text-ink-soft">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ open, onClose, pathname }) {
  const { cartCount, favorites } = useStore();

  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col border-l border-line bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <BrandMark />
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close menu">
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-5" aria-label="Mobile">
          <p className="label mb-2 px-1">Explore</p>
          <div className="flex flex-col gap-1">
            {SIDE_LINKS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.toLowerCase() === item.href.toLowerCase();
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${
                    active ? "bg-accent-soft text-accent" : "text-ink-soft"
                  }`}
                >
                  <Icon size={17} className={active ? "text-accent" : "text-muted"} />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/Cart" && cartCount > 0 && (
                    <span className="rounded-full bg-accent px-2 text-[10px] font-bold text-accent-ink">
                      {cartCount}
                    </span>
                  )}
                  {item.href === "/Favorites" && favorites.length > 0 && (
                    <span className="rounded-full bg-violet-soft px-2 text-[10px] font-bold text-violet">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="divider my-5" />

          <div className="flex items-center justify-between rounded-2xl border border-line bg-surface-2 px-4 py-3">
            <span className="text-xs font-semibold text-ink-soft">Appearance</span>
            <ThemeToggle />
          </div>
        </nav>

        <div className="border-t border-line p-5">
          <Link href="/Checkout" onClick={onClose} className="btn-primary w-full">
            Checkout
            <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="animate-rise flex items-center gap-2.5 rounded-full border border-line bg-surface px-5 py-3 text-sm font-medium text-ink shadow-lift">
        <FiCheckCircle className="text-accent" size={16} />
        {toast.message}
      </div>
    </div>
  );
}

const Layout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    setPathname(window.location.pathname || "/");
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Announcement />
      <Header onOpenMenu={() => setMenuOpen(true)} pathname={pathname} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />

      <div className="shell flex-1">
        <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          <SideRail pathname={pathname} />
          <main className="min-w-0 py-6 sm:py-8 lg:py-10">{children}</main>
        </div>
      </div>

      <Footer />
      <Toast />
    </div>
  );
};

export default Layout;
