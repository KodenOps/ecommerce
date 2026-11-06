"use client";

import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiPlus, FiTag, FiTrash2 } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

const EMPTY = {
  code: "",
  description: "",
  type: "PERCENT",
  value: "10",
  minSubtotal: "0",
  maxUses: "",
  expiresAt: "",
};

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ loading: true, saving: false, error: "", ok: "" });

  const load = async () => {
    try {
      const response = await fetch("/api/promos", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, loading: false, error: payload.error || "Could not load promos." }));
        return;
      }
      setPromos(payload.promos || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: "Could not load promos." }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));
    try {
      const response = await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          type: form.type,
          value: Number(form.value),
          minSubtotal: Number(form.minSubtotal) || 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, saving: false, error: payload.error || "Could not create that promo." }));
        return;
      }
      setForm(EMPTY);
      setState((current) => ({ ...current, saving: false, ok: `${payload.promo.code} is live.` }));
      load();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: "Could not create that promo." }));
    }
  };

  const toggle = async (promo) => {
    const response = await fetch(`/api/promos/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promo.active }),
    });
    if (response.ok) load();
  };

  const remove = async (promo) => {
    if (!window.confirm(`Delete ${promo.code}? Existing redemptions stay in the finance report.`)) return;
    const response = await fetch(`/api/promos/${promo.id}`, { method: "DELETE" });
    if (response.ok) load();
  };

  return (
    <AdminShell
      eyebrow="Promos"
      title="Discount codes"
      description="Create storefront codes, cap redemptions and retire them when the sale ends."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <section className="flex flex-col gap-3">
          {promos.length === 0 && !state.loading && (
            <div className="card p-8 text-center text-sm text-ink-soft">
              No promo codes yet — create the first one.
            </div>
          )}
          {promos.map((promo) => (
            <article key={promo.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-ink">
                    <FiTag size={13} className="text-accent" /> {promo.code}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        promo.active ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {promo.active ? "Active" : "Paused"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">{promo.description}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {promo.type === "PERCENT" ? `${promo.value}% off` : `${formatNaira(promo.value)} off`}
                    {promo.min_subtotal > 0 ? ` · min ${formatNaira(promo.min_subtotal)}` : ""}
                    {promo.max_uses ? ` · ${promo.uses}/${promo.max_uses} used` : ` · ${promo.uses} used`}
                    {promo.expires_at
                      ? ` · ends ${new Date(promo.expires_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => toggle(promo)} className="btn-secondary px-4 py-2 text-[11px]">
                    {promo.active ? "Pause" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(promo)}
                    className="btn-icon h-8 w-8 hover:border-accent hover:text-accent"
                    aria-label={`Delete ${promo.code}`}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <form onSubmit={create} className="card p-4">
          <h2 className="font-display text-lg text-ink">Create a code</h2>

          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="code" className="label">Code</label>
              <input
                id="code"
                required
                minLength={3}
                value={form.code}
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                className="field mt-1.5 font-mono uppercase"
                placeholder="GLOW10"
              />
            </div>
            <div>
              <label htmlFor="description" className="label">Description</label>
              <input
                id="description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="field mt-1.5"
                placeholder="10% off any bag over ₦20,000"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="type" className="label">Type</label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  className="field mt-1.5 cursor-pointer"
                >
                  <option value="PERCENT">Percent</option>
                  <option value="FIXED">Fixed ₦</option>
                </select>
              </div>
              <div>
                <label htmlFor="value" className="label">Value</label>
                <input
                  id="value"
                  type="number"
                  min="1"
                  required
                  value={form.value}
                  onChange={(event) => setForm({ ...form, value: event.target.value })}
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="minSubtotal" className="label">Min spend (₦)</label>
                <input
                  id="minSubtotal"
                  type="number"
                  min="0"
                  value={form.minSubtotal}
                  onChange={(event) => setForm({ ...form, minSubtotal: event.target.value })}
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="maxUses" className="label">Max uses</label>
                <input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(event) => setForm({ ...form, maxUses: event.target.value })}
                  className="field mt-1.5"
                  placeholder="unlimited"
                />
              </div>
            </div>
            <div>
              <label htmlFor="expiresAt" className="label">Ends (optional)</label>
              <input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
                className="field mt-1.5"
              />
            </div>

            {state.error && (
              <p className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent-soft/60 px-3 py-2 text-[11px] font-medium text-accent">
                <FiAlertCircle size={12} /> {state.error}
              </p>
            )}
            {state.ok && (
              <p className="flex items-center gap-1.5 rounded-xl border border-accent/20 bg-accent-soft/40 px-3 py-2 text-[11px] font-medium text-accent">
                <FiCheckCircle size={12} /> {state.ok}
              </p>
            )}

            <button type="submit" disabled={state.saving} className="btn-primary">
              <FiPlus size={14} /> {state.saving ? "Creating…" : "Create promo"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
