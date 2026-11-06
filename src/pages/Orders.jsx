"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";

const STATUS_STYLES = {
  "Confirming Payment": "bg-gold/10 text-gold border-gold/30",
  "Payment Confirmed": "bg-accent-soft text-accent border-accent/30",
  Shipped: "bg-violet-soft text-violet border-violet/30",
  Delivered: "bg-surface-2 text-ink-soft border-line-strong",
};

const STATUS_ICONS = {
  "Confirming Payment": FiClock,
  "Payment Confirmed": FiCheckCircle,
  Shipped: FiTruck,
  Delivered: FiPackage,
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "—";
  }
};

const Orders = () => {
  const { orders, syncOrderStatuses } = useStore();

  useEffect(() => {
    syncOrderStatuses();
    const timer = setInterval(syncOrderStatuses, 20000);
    const onFocus = () => syncOrderStatuses();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [syncOrderStatuses]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Orders"
          title="Your QueenFizzie history"
          description="Every order you've placed lives here — payment status, totals, and a one-tap re-order."
          crumbs={[{ label: "Home", href: "/" }, { label: "Orders" }]}
          actions={
            <Link href="/Shop" className="btn-secondary">
              Shop again
              <FiArrowRight size={14} />
            </Link>
          }
        />

        {orders.length === 0 ? (
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
            <Link href="/Shop" className="btn-primary">
              Start with a bestseller
              <FiArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const StatusIcon = STATUS_ICONS[order.status] ?? FiTruck;
              return (
                <article key={order.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                      <div>
                        <p className="label">Order</p>
                        <p className="text-sm font-semibold text-ink">{order.id}</p>
                      </div>
                      <div>
                        <p className="label">Placed</p>
                        <p className="text-sm text-ink-soft">{formatDate(order.placedAt)}</p>
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

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                        STATUS_STYLES[order.status] ?? STATUS_STYLES.Delivered
                      }`}
                    >
                      <StatusIcon size={12} />
                      {order.status}
                    </span>
                  </div>

                  {order.status === "Confirming Payment" && (
                    <p className="flex items-center gap-2 border-b border-line bg-gold/5 px-4 py-2.5 text-[11px] text-ink-soft sm:px-5">
                      <FiClock size={12} className="text-gold" />
                      We&apos;re checking your transfer receipt. This status changes to
                      Payment Confirmed as soon as it&apos;s approved.
                    </p>
                  )}

                  <ul className="divide-y divide-line">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                        <Link
                          href={`/ProductPreview?id=${item.id}`}
                          className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2"
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/ProductPreview?id=${item.id}`}
                            className="block truncate text-sm font-medium text-ink hover:text-accent"
                          >
                            {item.title}
                          </Link>
                          <p className="text-[11px] text-muted">Qty {item.qty}</p>
                        </div>
                        <span className="text-sm text-ink-soft">
                          {formatNaira(item.price * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 sm:px-5">
                    <p className="text-[11px] text-muted">
                      Paid by bank transfer
                      {order.receiptName ? ` · ${order.receiptName}` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link href="/Contact" className="btn-ghost text-xs">
                        Need help
                      </Link>
                      <Link href="/Shop" className="btn-secondary px-4 py-2 text-xs">
                        <FiRefreshCw size={12} /> Re-order
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

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
};

export default Orders;
