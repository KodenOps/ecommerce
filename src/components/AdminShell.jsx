"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiBell,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiTrendingUp,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "./AuthProvider";

const LINKS = [
  { href: "/Admin/Dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/Admin/Orders", label: "Orders", icon: FiPackage },
  { href: "/Admin/Products", label: "Products", icon: FiShoppingBag },
  { href: "/Admin/ProductRepo", label: "Product Repo", icon: FiPackage },
  { href: "/Admin/Promos", label: "Promos", icon: FiTag },
  { href: "/Admin/Finances", label: "Finances", icon: FiTrendingUp },
  { href: "/Admin/Users", label: "Customers", icon: FiUsers },
  { href: "/Admin/Notifications", label: "Inbox", icon: FiBell },
];

export default function AdminShell({ children, title, eyebrow, description, actions = null }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href) => router.pathname === href;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass sticky top-0 z-40 border-b border-line/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-icon lg:hidden"
              aria-label="Open admin menu"
            >
              <FiMenu size={17} />
            </button>
            <Link href="/Admin/Dashboard" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
                <GiQueenCrown size={18} />
              </span>
              <span className="leading-none">
                <span className="block font-display text-base font-semibold text-ink">
                  Queen<span className="text-accent">Fizzie</span>
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.28em] text-accent">
                  Admin panel
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <ProfileMenu compact />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col gap-1 rounded-3xl border border-line bg-surface p-3 shadow-soft">
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-accent-soft text-accent"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <Icon size={16} /> {link.label}
                </Link>
              );
            })}

            <div className="divider my-2" />

            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <FiShoppingBag size={16} /> Storefront
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-accent hover:bg-accent-soft"
            >
              <FiLogOut size={16} /> Sign out
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{title}</h1>
              {description && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>

          <div className="mt-5 flex flex-col gap-5">{children}</div>
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <span className="font-display text-base text-ink">Admin menu</span>
              <button type="button" onClick={() => setOpen(false)} className="btn-icon" aria-label="Close menu">
                <FiX size={17} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${
                      isActive(link.href) ? "bg-accent-soft text-accent" : "text-ink-soft"
                    }`}
                  >
                    <Icon size={16} /> {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-line p-3">
              <Link href="/" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                Storefront
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
