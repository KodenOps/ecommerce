"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiBell, FiCheck, FiSend } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "—";
  }
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [state, setState] = useState({ loading: true, error: "", ok: "", sending: false });
  const [form, setForm] = useState({ title: "", body: "", href: "" });

  const load = async () => {
    try {
      const response = await fetch("/api/notifications?limit=50", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, loading: false, error: payload.error || "Could not load the inbox." }));
        return;
      }
      setNotifications(payload.notifications || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: "Could not load the inbox." }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
    load();
  };

  const broadcast = async (event) => {
    event.preventDefault();
    setState((current) => ({ ...current, sending: true, error: "", ok: "" }));
    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, sending: false, error: payload.error || "Could not send that announcement." }));
        return;
      }
      setForm({ title: "", body: "", href: "" });
      setState((current) => ({ ...current, sending: false, ok: `Sent to ${payload.sent} customer(s).` }));
    } catch (error) {
      setState((current) => ({ ...current, sending: false, error: "Could not send that announcement." }));
    }
  };

  const unread = notifications.filter((item) => !item.readAt).length;

  return (
    <AdminShell
      eyebrow="Inbox"
      title="Notifications"
      description="Order alerts land here automatically. Send an announcement when something needs the whole house."
      actions={
        unread > 0 && (
          <button type="button" onClick={markAll} className="btn-secondary">
            <FiCheck size={14} /> Mark all read ({unread})
          </button>
        )
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Admin inbox</p>
            <span className="stat-pill">
              <FiBell size={11} className="text-accent" /> {notifications.length}
            </span>
          </div>

          <div className="divide-y divide-line">
            {notifications.map((item) => {
              const body = (
                <div className={`px-4 py-3 ${item.readAt ? "" : "bg-accent-soft/30"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-ink">{item.title}</p>
                    <span className="shrink-0 text-[10px] text-muted">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">{item.body}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                      {item.type}
                    </span>
                    {!item.readAt && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </div>
                </div>
              );

              return item.href ? (
                <Link key={item.id} href={item.href} className="block transition-colors hover:bg-surface-2/60">
                  {body}
                </Link>
              ) : (
                <div key={item.id}>{body}</div>
              );
            })}

            {notifications.length === 0 && !state.loading && (
              <p className="px-4 py-10 text-center text-sm text-ink-soft">
                Nothing here yet. New orders and payment receipts will appear automatically.
              </p>
            )}
          </div>
        </section>

        <form onSubmit={broadcast} className="card p-4">
          <h2 className="font-display text-lg text-ink">Send an announcement</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Delivered to every customer&apos;s notification bell.
          </p>

          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="title" className="label">Title</label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="field mt-1.5"
                placeholder="New drop: Harmattan collection"
              />
            </div>
            <div>
              <label htmlFor="body" className="label">Message</label>
              <textarea
                id="body"
                required
                rows={4}
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                className="field mt-1.5 resize-y"
                placeholder="Rich creams and body oils are back in stock…"
              />
            </div>
            <div>
              <label htmlFor="href" className="label">Link (optional)</label>
              <input
                id="href"
                value={form.href}
                onChange={(event) => setForm({ ...form, href: event.target.value })}
                className="field mt-1.5"
                placeholder="/Shop"
              />
            </div>

            {state.error && (
              <p className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent-soft/60 px-3 py-2 text-[11px] font-medium text-accent">
                <FiAlertCircle size={12} /> {state.error}
              </p>
            )}
            {state.ok && (
              <p className="rounded-xl border border-accent/20 bg-accent-soft/40 px-3 py-2 text-[11px] font-medium text-accent">
                {state.ok}
              </p>
            )}

            <button type="submit" disabled={state.sending} className="btn-primary">
              <FiSend size={14} /> {state.sending ? "Sending…" : "Send to all customers"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
