"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLock,
  FiLogOut,
  FiRefreshCw,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";
import { formatNaira } from "@/lib/money";

const TOKEN_KEY = "qf:admin-token";

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

const Admin = () => {
  const [token, setToken] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(TOKEN_KEY);
      if (stored) setToken(stored);
    } catch (error) {
      /* session storage may be unavailable */
    }
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setOrders([]);
    try {
      window.sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      /* ignore */
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        headers: { "x-admin-token": token },
        cache: "no-store",
      });
      if (response.status === 401) {
        signOut();
        setLoginError("Session expired — please sign in again.");
        return;
      }
      const payload = await response.json();
      setOrders(payload.orders || []);
    } catch (loadError) {
      setError("Could not load orders. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [token, signOut]);

  useEffect(() => {
    if (!token) return undefined;
    loadOrders();
    const timer = setInterval(loadOrders, 20000);
    return () => clearInterval(timer);
  }, [token, loadOrders]);

  const pending = orders.filter((order) => order.status === "Confirming Payment");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = pending.length
      ? `(${pending.length}) Orders — QueenFizzie Admin`
      : "Admin — QueenFizzie";
  }, [pending.length]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSigningIn(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.token) {
        setLoginError(payload.error || "Incorrect passcode.");
        return;
      }
      setToken(payload.token);
      setPasscode("");
      try {
        window.sessionStorage.setItem(TOKEN_KEY, payload.token);
      } catch (error) {
        /* ignore */
      }
    } catch (loginFailure) {
      setLoginError("We could not sign you in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const confirmPayment = async (id) => {
    setConfirmingId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Could not confirm this payment.");
        return;
      }
      setOrders((current) =>
        current.map((order) =>
          order.id === id
            ? { ...order, status: "Payment Confirmed", confirmedAt: payload.order?.confirmedAt }
            : order
        )
      );
    } catch (confirmError) {
      setError("Could not confirm this payment. Please try again.");
    } finally {
      setConfirmingId("");
    }
  };

  const receiptUrl = (order) =>
    `/api/admin/receipt?id=${encodeURIComponent(order.id)}&token=${encodeURIComponent(token)}`;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
        <div className="card w-full max-w-sm p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
              <GiQueenCrown size={24} />
            </span>
            <h1 className="mt-4 font-display text-2xl text-ink">QueenFizzie Admin</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Sign in to review receipts and confirm payments.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-3">
            <label htmlFor="passcode" className="label">
              Admin passcode
            </label>
            <div className="relative">
              <FiLock
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                className="field pl-10"
                placeholder="Enter passcode"
                autoComplete="current-password"
                required
              />
            </div>
            {loginError && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <FiAlertCircle size={13} /> {loginError}
              </p>
            )}
            <button type="submit" disabled={signingIn} className="btn-primary mt-1">
              {signingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted transition-colors hover:text-accent"
          >
            <FiShoppingBag size={12} /> Back to the store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass sticky top-0 z-30 border-b border-line/80">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
              <GiQueenCrown size={18} />
            </span>
            <div className="leading-none">
              <p className="font-display text-base font-semibold text-ink">
                Queen<span className="text-accent">Fizzie</span>
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-accent">
                Admin panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-ink-soft">
              <FiBell size={13} className={pending.length ? "text-gold" : "text-muted"} />
              {pending.length}
              {pending.length > 0 && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold" />
              )}
            </span>
            <button
              type="button"
              onClick={loadOrders}
              className="btn-icon"
              aria-label="Refresh orders"
              title="Refresh"
            >
              <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={signOut}
              className="btn-icon"
              aria-label="Sign out"
              title="Sign out"
            >
              <FiLogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Orders</p>
            <h1 className="mt-1 font-display text-3xl text-ink">Payment confirmations</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Check each receipt against your bank alert, then confirm the payment.
            </p>
          </div>
          <Link href="/" className="btn-secondary text-xs">
            <FiShoppingBag size={13} /> Storefront
          </Link>
        </div>

        {pending.length > 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3">
            <FiBell className="mt-0.5 shrink-0 text-gold" size={16} />
            <div>
              <p className="text-sm font-semibold text-ink">
                {pending.length} new {pending.length === 1 ? "order" : "orders"} waiting for
                payment confirmation
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Review the uploaded receipt, confirm the transfer, and the customer&apos;s
                status updates automatically.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 flex items-center gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
            <FiAlertCircle size={13} /> {error}
          </p>
        )}

        {orders.length === 0 && !loading && (
          <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FiShoppingBag size={22} />
            </span>
            <p className="font-display text-xl text-ink">No orders yet</p>
            <p className="max-w-sm text-sm text-ink-soft">
              New orders will appear here as soon as a customer uploads a payment receipt.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => {
            const isPending = order.status === "Confirming Payment";
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
                      <p className="text-sm text-ink-soft">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="label">Total</p>
                      <p className="text-sm font-semibold text-ink">{formatNaira(order.total)}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      isPending
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-accent/30 bg-accent-soft text-accent"
                    }`}
                  >
                    {isPending ? <FiClock size={12} /> : <FiCheckCircle size={12} />}
                    {order.status}
                  </span>
                </div>

                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-line bg-surface-2/60 p-3.5">
                        <p className="label">Customer</p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {order.customer?.name}
                        </p>
                        <p className="text-xs leading-relaxed text-ink-soft">
                          {order.customer?.phone}
                          {order.customer?.email ? (
                            <>
                              <br />
                              {order.customer.email}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-line bg-surface-2/60 p-3.5">
                        <p className="label">Deliver to</p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                          {order.customer?.address}
                          <br />
                          {order.customer?.city}, {order.customer?.state}
                        </p>
                        {order.customer?.notes && (
                          <p className="mt-1 text-[11px] text-muted">
                            Note: {order.customer.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <ul className="divide-y divide-line rounded-2xl border border-line">
                      {order.items?.map((item) => (
                        <li
                          key={`${order.id}-${item.id}`}
                          className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                        >
                          <span className="min-w-0 truncate text-sm text-ink">
                            {item.title} <span className="text-muted">×{item.qty}</span>
                          </span>
                          <span className="shrink-0 text-sm text-ink-soft">
                            {formatNaira(item.price * item.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted">
                      <span>Subtotal {formatNaira(order.subtotal)}</span>
                      <span>
                        Delivery{" "}
                        {order.delivery === 0 ? "Free" : formatNaira(order.delivery)}
                      </span>
                      <span>Bank transfer</span>
                      {order.confirmedAt && (
                        <span>Confirmed {formatDate(order.confirmedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2/60 p-3.5">
                    <p className="label">Payment receipt</p>

                    {order.receipt ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setReceiptPreview(order)}
                          className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-surface"
                        >
                          {order.receipt.mime === "application/pdf" ? (
                            <span className="flex flex-col items-center gap-1 text-ink-soft">
                              <FiFileText size={24} className="text-accent" />
                              <span className="text-[11px]">Open PDF</span>
                            </span>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={receiptUrl(order)}
                              alt={`Receipt for ${order.id}`}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </button>
                        <p className="truncate text-[11px] text-ink-soft">
                          {order.receipt.name} · {(order.receipt.size / 1024).toFixed(0)} KB
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted">No receipt attached.</p>
                    )}

                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => confirmPayment(order.id)}
                        disabled={confirmingId === order.id}
                        className="btn-primary mt-auto w-full text-xs"
                      >
                        {confirmingId === order.id ? "Confirming…" : "Confirm payment"}
                      </button>
                    ) : (
                      <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3 py-2 text-[11px] font-semibold text-accent">
                        <FiCheckCircle size={12} /> Payment confirmed
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {receiptPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <p className="label">Receipt</p>
                <p className="truncate text-sm font-semibold text-ink">
                  {receiptPreview.id} · {receiptPreview.customer?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptPreview(null)}
                className="btn-icon"
                aria-label="Close receipt"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-surface-2 p-3">
              {receiptPreview.receipt?.mime === "application/pdf" ? (
                <iframe
                  title={`Receipt for ${receiptPreview.id}`}
                  src={receiptUrl(receiptPreview)}
                  className="h-[65vh] w-full rounded-xl border border-line bg-surface"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receiptUrl(receiptPreview)}
                  alt={`Receipt for ${receiptPreview.id}`}
                  className="mx-auto max-h-[65vh] w-auto rounded-xl border border-line bg-surface object-contain"
                />
              )}
            </div>

            {receiptPreview.status === "Confirming Payment" && (
              <div className="border-t border-line p-4">
                <button
                  type="button"
                  onClick={() => {
                    confirmPayment(receiptPreview.id);
                    setReceiptPreview(null);
                  }}
                  className="btn-primary w-full"
                >
                  <FiCheckCircle size={15} /> Confirm payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
