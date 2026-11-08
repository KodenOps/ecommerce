"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiBell,
  FiCheck,
  FiPackage,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { useAuth } from "./AuthProvider";

const ICONS = {
  ORDER: FiPackage,
  PRODUCT: FiTag,
  ANNOUNCEMENT: FiUsers,
  SYSTEM: FiBell,
};

function timeAgo(iso) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const { user, unreadCount, setUnreadCount } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=12", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setItems(payload.notifications || []);
      setUnreadCount(payload.unreadCount ?? 0);
    } catch (error) {
      /* offline */
    } finally {
      setLoading(false);
    }
  }, [user, setUnreadCount]);

  useEffect(() => {
    if (!user) return undefined;
    load();
    const timer = setInterval(load, 45000);
    return () => clearInterval(timer);
  }, [user, load]);

  useEffect(() => {
    const onClick = (event) => {
      if (!panelRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
    setUnreadCount(0);
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) load();
        }}
        className="btn-icon relative"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <FiBell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift sm:absolute sm:left-auto sm:right-0 sm:w-[22rem]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-[11px] text-muted">
                {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:opacity-70"
              >
                <FiCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted">Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <div className="px-4 py-8 text-center">
                <FiBell className="mx-auto text-muted" size={20} />
                <p className="mt-2 text-xs text-ink-soft">
                  Order updates and new drops will show up here.
                </p>
              </div>
            )}
            {items.map((item) => {
              const Icon = ICONS[item.type] || FiBell;
              const content = (
                <div
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2 ${
                    item.readAt ? "" : "bg-accent-soft/30"
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-snug text-ink">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">{timeAgo(item.createdAt)}</p>
                  </div>
                  {!item.readAt && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                </div>
              );

              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={async () => {
                    setOpen(false);
                    await fetch("/api/notifications", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: item.id }),
                    }).catch(() => {});
                    load();
                  }}
                  className="block border-b border-line last:border-0"
                >
                  {content}
                </Link>
              ) : (
                <div key={item.id} className="border-b border-line last:border-0">
                  {content}
                </div>
              );
            })}
          </div>

          {user.isAdmin ? (
            <Link
              href="/Admin/Notifications"
              className="block border-t border-line px-4 py-2.5 text-center text-[11px] font-semibold text-accent hover:bg-surface-2"
            >
              Open the admin inbox
            </Link>
          ) : (
            <Link
              href="/Orders"
              className="block border-t border-line px-4 py-2.5 text-center text-[11px] font-semibold text-accent hover:bg-surface-2"
            >
              See order updates
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
