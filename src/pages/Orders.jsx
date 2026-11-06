"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiTruck,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { formatNaira } from "@/lib/money";
import {
  ORDER_STATUS,
  ORDER_STATUS_HINTS,
  paymentLabel,
  statusLabel,
} from "@/lib/status";
import { userPageProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return userPageProps(ctx, { fallback: "/Orders" });
}

const STATUS_STYLES = {
  PENDING_PAYMENT: "bg-gold/10 text-gold border-gold/30",
  PAYMENT_CONFIRMED: "bg-accent-soft text-accent border-accent/30",
  PROCESSING: "bg-accent-soft text-accent border-accent/30",
  SHIPPED: "bg-violet-soft text-violet border-violet/30",
  DELIVERED: "bg-surface-2 text-ink-soft border-line-strong",
  CANCELLED: "bg-surface-2 text-muted border-line",
};

const STATUS_ICONS = {
  PENDING_PAYMENT: FiClock,
  PAYMENT_CONFIRMED: FiCheckCircle,
  PROCESSING: FiPackage,
  SHIPPED: FiTruck,
  DELIVERED: FiCheckCircle,
  CANCELLED: FiPackage,
};

const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "—";
  }
};

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openOrder, setOpenOrder] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error || "We could not load your orders.");
        return;
      }
      const payload = await response.json();
      setOrders(payload.orders || []);
    } catch (failure) {
      setError("Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (typeof router.query.order === "string") setOpenOrder(router.query.order);
  }, [router.query.order]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Orders"
          title="Your QueenFizzie history"
          description="Every order you've placed lives here — payment status, the delivery timeline and every update from our team."
          crumbs={[{ label: "Home", href: "/" }, { label: "Orders" }]}
          actions={
            <div className="flex gap-2">
              <button type="button" onClick={load} className="btn-secondary" aria-label="Refresh orders">
                <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <Link href="/shop" className="btn-secondary">
                Shop again
                <FiArrowRight size={14} />
              </Link>
            </div>
          }
        />

        {error && (
          <p className="rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
            {error}
          </p>
        )}

        {loading && orders.length === 0 && (
          <div className="card animate-pulse p-8">
            <div className="h-3 w-1/3 rounded bg-surface-2" />
            <div className="mt-3 h-3 w-2/3 rounded bg-surface-2" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FiPackage size={26} />
            </span>
            <div>
              <p className="font-display text-xl text-ink">No orders yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Once you place an order it will appear here, with its payment status as it
                moves.
              </p>
            </div>
            <Link href="/shop" className="btn-primary">
              Start with a bestseller
              <FiArrowRight size={15} />
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status] ?? FiTruck;
            const expanded = openOrder === order.id;
            const steps = order.events || [];

            return (
              <article key={order.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <div>
                      <p className="label">Order</p>
                      <p className="text-sm font-semibold text-ink">{order.reference}</p>
                    </div>
                    <div>
                      <p className="label">Placed</p>
                      <p className="text-sm text-ink-soft">{formatDateTime(order.placedAt)}</p>
                    </div>
                    <div>
                      <p className="label">Total</p>
                      <p className="text-sm font-semibold text-ink">{formatNaira(order.total)}</p>
                    </div>
                    <div>
                      <p className="label">Deliver to</p>
                      <p className="text-sm text-ink-soft">
                        {order.customer?.city}
                        {order.customer?.state ? `, ${order.customer.state}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                        STATUS_STYLES[order.status] ?? STATUS_STYLES.DELIVERED
                      }`}
                    >
                      <StatusIcon size={12} />
                      {statusLabel(order.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenOrder(expanded ? "" : order.id)}
                      className="btn-ghost px-2 text-[11px]"
                      aria-expanded={expanded}
                    >
                      {expanded ? "Hide" : "Timeline"}
                    </button>
                  </div>
                </div>

                {order.status === ORDER_STATUS.PENDING_PAYMENT && (
                  <p className="flex items-center gap-2 border-b border-line bg-gold/5 px-4 py-2.5 text-[11px] text-ink-soft sm:px-5">
                    <FiClock size={12} className="text-gold" />
                    {ORDER_STATUS_HINTS.PENDING_PAYMENT}
                  </p>
                )}

                <ul className="divide-y divide-line">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                      <Link
                        href={item.productId ? `/ProductPreview?id=${item.productId}` : "/shop"}
                        className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2"
                      >
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                        ) : null}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.productId ? `/ProductPreview?id=${item.productId}` : "/shop"}
                          className="block truncate text-sm font-medium text-ink hover:text-accent"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[11px] text-muted">Qty {item.qty} · {item.sku}</p>
                      </div>
                      <span className="text-sm text-ink-soft">
                        {formatNaira(item.lineTotal ?? item.price * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
                  <p className="text-[11px] text-muted">
                    {paymentLabel(order.paymentStatus)} · bank transfer
                    {order.receipt?.name ? ` · ${order.receipt.name}` : ""}
                    {order.promoCode ? ` · ${order.promoCode}` : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    {order.trackingNumber && (
                      <span className="stat-pill">
                        <FiTruck size={11} /> {order.courier || "Courier"} · {order.trackingNumber}
                      </span>
                    )}
                    <Link href="/Contact" className="btn-ghost text-xs">
                      Need help
                    </Link>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-line bg-surface-2/40 px-4 py-4 sm:px-5">
                    <p className="label mb-3">Order timeline</p>
                    {steps.length === 0 ? (
                      <p className="text-xs text-ink-soft">No updates yet.</p>
                    ) : (
                      <ol className="flex flex-col gap-3">
                        {steps.map((event) => (
                          <li key={event.id} className="flex gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                            <div>
                              <p className="text-xs font-medium text-ink">{event.message}</p>
                              <p className="text-[10px] text-muted">
                                {formatDateTime(event.createdAt)}
                                {event.actorName ? ` · ${event.actorName}` : ""}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}

                    <div className="mt-4 grid gap-2 border-t border-line pt-3 text-[11px] text-ink-soft sm:grid-cols-2">
                      <span>Subtotal {formatNaira(order.subtotal)}</span>
                      <span>Delivery {order.delivery === 0 ? "Free" : formatNaira(order.delivery)}</span>
                      {order.discount > 0 && <span>Discount −{formatNaira(order.discount)}</span>}
                      <span>Ship to {order.customer?.address}, {order.customer?.city}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: "100% original", detail: "Every product, every order." },
            { title: "Nationwide delivery", detail: "1–5 working days from Lagos." },
            { title: "Care line", detail: "Real humans, Mon–Sat 9am–6pm." },
          ].map((item) => (
            <div key={item.title} className="card p-4">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
