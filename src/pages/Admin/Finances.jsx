"use client";

import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowUpRight, FiRefreshCw, FiTag, FiTrendingUp } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

export default function AdminFinances() {
  const [data, setData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [financesResponse, overviewResponse] = await Promise.all([
        fetch("/api/admin/finances", { cache: "no-store" }),
        fetch("/api/admin/overview", { cache: "no-store" }),
      ]);
      const finances = await financesResponse.json().catch(() => ({}));
      const stats = await overviewResponse.json().catch(() => ({}));
      if (!financesResponse.ok) {
        setError(finances.error || "Could not load the finance report.");
        return;
      }
      setData(finances.finances);
      setOverview(stats.stats || null);
    } catch (failure) {
      setError("Could not load the finance report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const monthly = data?.monthly || [];
  const peak = Math.max(1, ...monthly.map((month) => month.revenue));
  const payments = data?.payments || { paid: 0, awaiting: 0, refunded: 0 };

  return (
    <AdminShell
      eyebrow="Finances"
      title="Money in the till"
      description="Confirmed revenue, what is still awaiting confirmation, promo cost and the products driving it."
      actions={
        <button type="button" onClick={load} className="btn-secondary">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      }
    >
      {error && (
        <p className="flex items-center gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          <FiAlertCircle size={13} /> {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Confirmed revenue", value: payments.paid, hint: "Paid orders, all time" },
          { label: "Awaiting confirmation", value: payments.awaiting, hint: "Receipts to verify" },
          { label: "Refunded", value: payments.refunded, hint: "Refunded orders" },
          { label: "Average order", value: overview?.averageOrder || 0, hint: "Paid orders only" },
        ].map((card) => (
          <div key={card.label} className="card p-4">
            <p className="label">{card.label}</p>
            <p className="mt-2 font-display text-2xl text-ink">{loading ? "—" : formatNaira(card.value || 0)}</p>
            <p className="mt-1 text-[11px] text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className="card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="label">Last six months</p>
            <p className="text-sm font-semibold text-ink">Paid revenue</p>
          </div>
          <span className="stat-pill">
            <FiTrendingUp size={11} className="text-accent" /> {formatNaira(payments.paid || 0)} total
          </span>
        </div>

        <div className="mt-5 flex h-40 items-end gap-3">
          {monthly.map((month) => (
            <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-ink-soft">
                {month.revenue > 0 ? formatNaira(month.revenue) : ""}
              </span>
              <div className="flex h-full w-full items-end rounded-xl bg-surface-2">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-accent to-violet transition-all duration-500"
                  style={{ height: `${Math.max(4, (month.revenue / peak) * 100)}%` }}
                  title={`${month.orders} paid orders`}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted">{month.label}</span>
            </div>
          ))}
          {monthly.length === 0 && <p className="w-full text-center text-xs text-muted">No data yet.</p>}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="label">Top products</p>
            <FiArrowUpRight className="text-muted" size={14} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {(data?.topProducts || []).length === 0 && (
              <p className="text-xs text-ink-soft">No paid sales yet.</p>
            )}
            {(data?.topProducts || []).map((product, index) => (
              <div key={product.title} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2">
                <span className="flex min-w-0 items-center gap-2 text-xs text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-accent">
                    {index + 1}
                  </span>
                  <span className="truncate">{product.title}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-xs font-semibold text-ink">{formatNaira(product.revenue)}</span>
                  <span className="block text-[10px] text-muted">{product.units} units</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="label">Promo cost</p>
            <FiTag className="text-muted" size={14} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {(data?.promos || []).length === 0 && (
              <p className="text-xs text-ink-soft">No promo redemptions yet.</p>
            )}
            {(data?.promos || []).map((promo) => (
              <div key={promo.code} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2">
                <span className="font-mono text-xs font-bold tracking-widest text-ink">{promo.code}</span>
                <span className="text-right">
                  <span className="block text-xs font-semibold text-accent">−{formatNaira(promo.amount)}</span>
                  <span className="block text-[10px] text-muted">{promo.redemptions} redemption(s)</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-line bg-surface-2/60 p-3 text-[11px] text-ink-soft">
            Total discounts given: <strong className="text-ink">{formatNaira(overview?.discounts || 0)}</strong>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
