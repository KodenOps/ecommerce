"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiEdit3,
  FiHeart,
  FiLogOut,
  FiPackage,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "./AuthProvider";
import { formatPhone } from "@/lib/validation";

const MENU_LINK = "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink";

export default function ProfileMenu({ compact = false }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const close = useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    const onClick = (event) => {
      if (!event.target.closest("[data-profile-menu]")) close();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [close]);

  if (!user) {
    return (
      <Link
        href="/Login"
        className={compact ? "btn-icon" : "btn-secondary px-4 py-2 text-xs"}
        aria-label="Sign in"
      >
        <FiUser size={15} />
        {!compact && "Sign in"}
      </Link>
    );
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "QF";

  return (
    <div className="relative" data-profile-menu>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 text-xs font-bold text-ink-soft transition-colors hover:border-accent/60 hover:text-accent"
        title={user.fullName}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface-2/60 px-4 py-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-xs font-bold text-accent">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-[11px] text-ink-soft">{formatPhone(user.phone)}</p>
              {user.isAdmin && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
                  <FiShield size={9} /> Admin
                </span>
              )}
            </div>
          </div>

          <div className="p-2">
            <Link href="/Account" onClick={close} className={MENU_LINK}>
              <FiEdit3 size={14} /> My profile
            </Link>
            <Link href="/Orders" onClick={close} className={MENU_LINK}>
              <FiPackage size={14} /> My orders
            </Link>
            <Link href="/Account?tab=addresses" onClick={close} className={MENU_LINK}>
              <FiUser size={14} /> Delivery addresses
            </Link>
            <Link href="/Favorites" onClick={close} className={MENU_LINK}>
              <FiHeart size={14} /> Saved items
            </Link>
            {user.isAdmin && (
              <Link href="/Admin/Dashboard" onClick={close} className={MENU_LINK}>
                <FiShield size={14} /> Admin panel
              </Link>
            )}
          </div>

          <div className="border-t border-line p-2">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
            >
              <FiLogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
