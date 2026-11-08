"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiTruck,
  FiX,
} from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";
import {
  NEXT_STATUSES,
  ORDER_STATUS,
  ORDER_STATUS_HINTS,
  paymentLabel,
  statusLabel,
} from "@/lib/status";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

const FILTERS = [
  { value: "", label: "All" },
  { value: ORDER_STATUS.PENDING_PAYMENT, label: "Awaiting payment" },
  { value: ORDER_STATUS.PAYMENT_CONFIRMED, label: "Paid" },
  { value: ORDER_STATUS.PROCESSING, label: "Processing" },
  { value: ORDER_STATUS.SHIPPED, label: "Shipped" },
  { value: ORDER_STATUS.DELIVERED, label: "Delivered" },
  { value: ORDER_STATUS.CANCELLED, label: "Cancelled" },
];

const formatDate = (iso) => {
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

function OrderCard({ order, onChange, onError }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState(order.courier || "");
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const update = async (payload) => {
    setBusy(true);
    onError("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        onError(body.error || "Could not update that order.");
        return;
      }
      onChange(body.order);
      setStatus(body.order.status);
      setCourier(body.order.courier || "");
      setTracking(body.order.trackingNumber || "");
      setNote("");
    } catch (failure) {
      onError("Could not update that order. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const options = NEXT_STATUSES[order.status] || [];
  const pending = order.status === ORDER_STATUS.PENDING_PAYMENT;

  return (
    <article className="card overflow-hidden">
      <div className="border-b border-line bg-surface-2/60 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-0 flex-1">
            <p className="label">Order</p>
            <p className="truncate text-sm font-semibold text-ink">{order.reference}</p>
            <p className="mt-0.5 truncate text-[11px] text-ink-soft sm:hidden">
              {order.customer.name} · {order.customer.phone}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-[11px] ${
                pending
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : order.status === ORDER_STATUS.CANCELLED
                  ? "border-line bg-surface text-muted"
                  : "border-accent/30 bg-accent-soft text-accent"
              }`}
            >
              {pending ? <FiClock size={12} /> : <FiCheckCircle size={12} />}
              {statusLabel(order.status)}
            </span>
            <button type="button" onClick={() => setExpanded((value) => !value)} className="btn-ghost px-2 text-[11px]">
              {expanded ? "Close" : "Manage"}
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
          <span className="text-sm font-semibold text-ink">{formatNaira(order.total)}</span>
          <span className="text-[11px] text-muted">{formatDate(order.placedAt)}</span>
        </div>

        <div className="mt-3 hidden flex-wrap items-center gap-x-6 gap-y-2 sm:flex">
          <div>
            <p className="label">Customer</p>
            <p className="text-sm text-ink-soft">{order.customer.name}</p>
          </div>
          <div>
            <p className="label">Phone</p>
            <p className="text-sm text-ink-soft">{order.customer.phone}</p>
          </div>
          <div>
            <p className="label">Total</p>
            <p className="text-sm font-semibold text-ink">{formatNaira(order.total)}</p>
          </div>
          <div>
            <p className="label">Placed</p>
            <p className="text-sm text-ink-soft">{formatDate(order.placedAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-4 py-2 text-[11px] text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <span>{paymentLabel(order.paymentStatus)} · {order.promoCode || "no promo"} · {order.items.length} line(s)</span>
        <span>{ORDER_STATUS_HINTS[order.status]}</span>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t border-line p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface-2/60 p-3">
                <p className="label">Deliver to</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {order.customer.address}
                  <br />
                  {order.customer.city}, {order.customer.state}
                  <br />
                  {order.customer.email}
                </p>
                {order.customer.notes && (
                  <p className="mt-1 text-[11px] text-muted">Note: {order.customer.notes}</p>
                )}
              </div>
              <div className="rounded-2xl border border-line bg-surface-2/60 p-3">
                <p className="label">Money</p>
                <div className="mt-1 flex flex-col gap-1 text-xs text-ink-soft">
                  <span className="flex justify-between"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></span>
                  <span className="flex justify-between"><span>Discount</span><span>−{formatNaira(order.discount)}</span></span>
                  <span className="flex justify-between"><span>Delivery</span><span>{order.delivery === 0 ? "Free" : formatNaira(order.delivery)}</span></span>
                  <span className="flex justify-between font-semibold text-ink"><span>Total</span><span>{formatNaira(order.total)}</span></span>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-line rounded-2xl border border-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="min-w-0 truncate text-xs text-ink">
                    {item.title} <span className="text-muted">×{item.qty}</span>
                  </span>
                  <span className="text-xs text-ink-soft">{formatNaira(item.lineTotal)}</span>
                </li>
              ))}
            </ul>

            {order.events.length > 0 && (
              <div>
                <p className="label mb-2">Timeline</p>
                <ol className="flex flex-col gap-2">
                  {order.events.map((event) => (
                    <li key={event.id} className="flex gap-2 text-[11px]">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>
                        <span className="font-medium text-ink">{event.message}</span>
                        <span className="block text-muted">
                          {formatDate(event.createdAt)}{event.actorName ? ` · ${event.actorName}` : ""}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2/60 p-3">
            <div>
              <p className="label">Receipt</p>
              {order.receipt ? (
                <button
                  type="button"
                  onClick={() => setReceiptOpen(true)}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink hover:border-accent/50"
                >
                  {order.receipt.mime === "application/pdf" ? <FiFileText size={14} className="text-accent" /> : <FiCheckCircle size={14} className="text-accent" />}
                  <span className="truncate">{order.receipt.name || "View receipt"}</span>
                </button>
              ) : (
                <p className="mt-1 text-xs text-muted">No receipt attached.</p>
              )}
            </div>

            {pending && (
              <button
                type="button"
                onClick={() => update({ paymentStatus: "PAID" })}
                disabled={busy}
                className="btn-primary text-xs"
              >
                <FiCheckCircle size={13} /> Confirm payment
              </button>
            )}

            {options.length > 0 && (
              <div>
                <label htmlFor={`status-${order.id}`} className="label">Move to</label>
                <select
                  id={`status-${order.id}`}
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="field mt-1.5 cursor-pointer text-xs"
                >
                  <option value={order.status}>{statusLabel(order.status)} (current)</option>
                  {options
                    .filter((option) => option !== ORDER_STATUS.CANCELLED)
                    .map((option) => (
                      <option key={option} value={option}>{statusLabel(option)}</option>
                    ))}
                </select>
              </div>
            )}

            {status === ORDER_STATUS.SHIPPED && (
              <>
                <div>
                  <label htmlFor={`courier-${order.id}`} className="label">Courier</label>
                  <input
                    id={`courier-${order.id}`}
                    value={courier}
                    onChange={(event) => setCourier(event.target.value)}
                    className="field mt-1.5 text-xs"
                    placeholder="GIG Logistics"
                  />
                </div>
                <div>
                  <label htmlFor={`tracking-${order.id}`} className="label">Tracking number</label>
                  <input
                    id={`tracking-${order.id}`}
                    value={tracking}
                    onChange={(event) => setTracking(event.target.value)}
                    className="field mt-1.5 text-xs"
                    placeholder="GIG-123456"
                  />
                </div>
              </>
            )}

            {options.length > 0 && (
              <button
                type="button"
                onClick={() => update({ status, courier, trackingNumber: tracking })}
                disabled={busy || (status === order.status && !courier && !tracking)}
                className="btn-secondary text-xs"
              >
                <FiTruck size={13} /> Save order update
              </button>
            )}

            {order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.DELIVERED && (
              <div className="border-t border-line pt-3">
                <label htmlFor={`note-${order.id}`} className="label">Cancel note</label>
                <input
                  id={`note-${order.id}`}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="field mt-1.5 text-xs"
                  placeholder="Reason shared with the customer"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Cancel ${order.reference}? Stock is returned to the shelf.`)) {
                      update({ status: ORDER_STATUS.CANCELLED, note });
                    }
                  }}
                  disabled={busy}
                  className="btn-ghost mt-2 px-0 text-xs text-accent"
                >
                  Cancel order
                </button>
              </div>
            )}

            {order.paymentStatus === "PAID" && (
              <button
                type="button"
                onClick={() => update({ paymentStatus: "REFUNDED" })}
                disabled={busy}
                className="btn-ghost px-0 text-[11px] text-muted hover:text-accent"
              >
                Mark refunded
              </button>
            )}
          </div>
        </div>
      )}

      {receiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="min-w-0">
                <p className="label">Receipt</p>
                <p className="truncate text-sm font-semibold text-ink">{order.reference}</p>
              </div>
              <button type="button" onClick={() => setReceiptOpen(false)} className="btn-icon" aria-label="Close receipt">
                <FiX size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-surface-2 p-3">
              {order.receipt?.mime === "application/pdf" ? (
                <iframe
                  title={`Receipt for ${order.reference}`}
                  src={`/api/admin/receipt?id=${order.id}`}
                  className="h-[65vh] w-full rounded-xl border border-line bg-surface"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/admin/receipt?id=${order.id}`}
                  alt={`Receipt for ${order.reference}`}
                  className="mx-auto max-h-[65vh] w-auto rounded-xl border border-line bg-surface object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search.trim()) params.set("q", search.trim());
      const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Could not load orders.");
        return;
      }
      setOrders(payload.orders || []);
    } catch (failure) {
      setError("Could not load orders. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  useEffect(() => {
    if (typeof router.query.order === "string" && orders.length) {
      const el = document.getElementById(`order-${router.query.order}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [router.query.order, orders]);

  const replaceOrder = (updated) =>
    setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));

  return (
    <AdminShell
      eyebrow="Orders"
      title="Order lifecycle"
      description="Confirm payments against receipts, pack, ship with tracking, and keep the buyer informed at every step."
      actions={
        <button type="button" onClick={load} className="btn-secondary">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      }
    >
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`chip ${status === filter.value ? "chip-active" : ""}`}
              aria-pressed={status === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="field sm:max-w-sm"
          placeholder="Search reference, name, phone or email"
          aria-label="Search orders"
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          <FiAlertCircle size={13} /> {error}
        </p>
      )}

      {orders.length === 0 && !loading && (
        <div className="card p-10 text-center">
          <p className="font-display text-lg text-ink">No orders in this view</p>
          <p className="mt-1 text-sm text-ink-soft">New orders land here as soon as receipts are uploaded.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} id={`order-${order.id}`}>
            <OrderCard order={order} onChange={replaceOrder} onError={setError} />
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
