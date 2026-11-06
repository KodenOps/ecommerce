"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiMapPin, FiRefreshCw, FiSearch, FiShield } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";
import { formatPhone } from "@/lib/validation";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

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

export default function AdminUsers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Could not load customers.");
        return;
      }
      setCustomers(payload.customers || []);
    } catch (failure) {
      setError("Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone, customer.address]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle))
    );
  }, [customers, query]);

  return (
    <AdminShell
      eyebrow="Customers"
      title="Everyone who shops with us"
      description="Full contact records — phone, default address, spend and order count."
      actions={
        <button type="button" onClick={load} className="btn-secondary">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      }
    >
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <FiSearch size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field pl-10"
            placeholder="Search name, phone, email or address"
            aria-label="Search customers"
          />
        </div>
        <span className="stat-pill">{visible.length} customer(s)</span>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          <FiAlertCircle size={13} /> {error}
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-surface-2/70 text-[10px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Default address</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Spent</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-ink">
                      {customer.fullName || "Unnamed"}
                      {customer.role === "ADMIN" && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-bold uppercase text-accent">
                          <FiShield size={8} /> Admin
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-ink-soft">{customer.email}</p>
                    {!customer.marketingOptIn && (
                      <p className="text-[10px] text-muted">Notifications muted</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatPhone(customer.phone)}</td>
                  <td className="max-w-[220px] px-4 py-3 text-ink-soft">
                    {customer.address ? (
                      <span className="flex items-start gap-1.5">
                        <FiMapPin size={11} className="mt-0.5 shrink-0 text-accent" />
                        <span className="truncate">{customer.address}</span>
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{customer.orders}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatNaira(customer.spent)}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && !loading && (
          <p className="px-4 py-10 text-center text-sm text-ink-soft">No customers match that search.</p>
        )}
      </div>
    </AdminShell>
  );
}
