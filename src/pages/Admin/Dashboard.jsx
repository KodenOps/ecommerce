"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";
import { statusLabel } from "@/lib/status";

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

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Could not load the dashboard.");
        return;
      }
      setData(payload);
    } catch (failure) {
      setError("Could not load the dashboard. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = data?.stats || {};

  const cards = [
    {
      label: "Revenue (paid)",
      value: formatNaira(stats.revenue || 0),
      hint: `${stats.unitsSold || 0} units sold`,
      icon: FiTrendingUp,
    },
    {
      label: "Awaiting payment",
      value: formatNaira(stats.pendingRevenue || 0),
      hint: `${stats.pendingPayments || 0} receipts to check`,
      icon: FiClock,
    },
    {
      label: "Orders",
      value: stats.orders || 0,
      hint: `${stats.processing || 0} in progress · ${stats.shipped || 0} shipped`,
      icon: FiPackage,
    },
    {
      label: "Customers",
      value: stats.customers || 0,
      hint: `${stats.products || 0} active products`,
      icon: FiUsers,
    },
  ];

  return (
    <AdminShell
      eyebrow="Overview"
      title="Store pulse"
      description="Revenue, order queues and the stock that needs your attention."
      actions={
        <>
          <button type="button" onClick={load} className="btn-secondary">
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Link href="/Admin/Products" className="btn-primary">
            <FiShoppingBag size={14} /> Add product
          </Link>
        </>
      }
    >
      {error && (
        <p className="rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="label">{card.label}</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon size={14} />
                </span>
              </div>
              <p className="mt-2 font-display text-2xl text-ink">{loading ? "—" : card.value}</p>
              <p className="mt-1 text-[11px] text-muted">{card.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="label">Latest orders</p>
              <p className="text-sm font-semibold text-ink">Newest first</p>
            </div>
            <Link href="/Admin/Orders" className="btn-ghost text-xs">
              All orders <FiArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-line">
            {(data?.recentOrders || []).length === 0 && !loading && (
              <p className="px-4 py-10 text-center text-sm text-ink-soft">No orders yet.</p>
            )}
            {(data?.recentOrders || []).map((order) => (
              <Link
                key={order.id}
                href={`/Admin/Orders?order=${order.id}`}
                className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-surface-2 md:flex-row md:items-center md:justify-between md:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-ink">{order.reference}</p>
                    <p className="shrink-0 text-sm font-semibold text-ink md:hidden">{formatNaira(order.total)}</p>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-ink-soft">
                    {order.customerName} · {order.customerPhone} · {order.itemCount} item(s)
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted md:hidden">{formatDate(order.placedAt)}</p>
                </div>

                <div className="flex items-center justify-between gap-2 md:flex-col md:items-end md:justify-center md:gap-0.5">
                  <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                    {statusLabel(order.status)}
                  </span>
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-semibold text-ink">{formatNaira(order.total)}</p>
                    <p className="text-[11px] text-muted">{formatDate(order.placedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <p className="label">Low stock</p>
              <span className="stat-pill">
                <FiAlertTriangle size={11} className="text-gold" /> {stats.lowStock || 0}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {(data?.lowStock || []).length === 0 && (
                <p className="text-xs text-ink-soft">Everything is comfortably stocked.</p>
              )}
              {(data?.lowStock || []).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-2/60 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink">{product.title}</p>
                    <p className="text-[10px] text-muted">{product.category}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      product.stock === 0 ? "bg-accent text-accent-ink" : "bg-gold/15 text-gold"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
            <Link href="/Admin/Products" className="btn-secondary mt-3 w-full text-xs">
              Restock products
            </Link>
          </section>

          <section className="card p-4">
            <p className="label">Quick actions</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/Admin/Categories" className="btn-secondary text-xs">Manage product categories</Link>
              <Link href="/Admin/Products" className="btn-secondary text-xs">Add or restock a product</Link>
              <Link href="/Admin/Promos" className="btn-secondary text-xs">Create a promo code</Link>
              <Link href="/Admin/Finances" className="btn-secondary text-xs">Open finance report</Link>
              <Link href="/Admin/Notifications" className="btn-secondary text-xs">Send an announcement</Link>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
