"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  FiAlertCircle,
  FiArchive,
  FiCheckCircle,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiX,
} from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

const CATEGORIES = [
  "Skincare",
  "Mists & Toners",
  "Lips & Blush",
  "Body Glow",
  "Scented Candles",
  "Gifts & Sets",
];

const EMPTY = {
  title: "",
  sku: "",
  category: "Skincare",
  price: "",
  oldPrice: "",
  image: "",
  stock: "25",
  lowStockAt: "5",
  status: "ACTIVE",
  featured: false,
  description: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [state, setState] = useState({ loading: true, saving: false, error: "", ok: "" });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch("/api/products?all=1", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, loading: false, error: payload.error || "Could not load products." }));
        return;
      }
      setProducts(payload.products || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: "Could not load products." }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldprice ? String(product.oldprice) : "",
      image: product.image,
      stock: String(product.stock),
      lowStockAt: String(product.lowStockAt ?? 5),
      status: product.status,
      featured: Boolean(product.featured),
      description: product.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const save = async (event) => {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));
    try {
      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
          stock: Number(form.stock),
          lowStockAt: Number(form.lowStockAt),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, saving: false, error: payload.error || "Could not save that product." }));
        return;
      }
      reset();
      setState((current) => ({ ...current, saving: false, ok: editingId ? "Product updated." : "Product created." }));
      load();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: "Could not save that product." }));
    }
  };

  const adjustStock = async (product, delta) => {
    const stock = Math.max(0, product.stock + delta);
    setState((current) => ({ ...current, error: "" }));
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({ ...current, error: payload.error || "Could not update stock." }));
        return;
      }
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, stock: payload.product.stock, status: payload.product.status }
            : item
        )
      );
    } catch (error) {
      setState((current) => ({ ...current, error: "Could not update stock." }));
    }
  };

  const archive = async (product) => {
    if (!window.confirm(`Archive ${product.title}? It disappears from the storefront.`)) return;
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState((current) => ({ ...current, error: payload.error || "Could not archive that product." }));
      return;
    }
    load();
  };

  return (
    <AdminShell
      eyebrow="Catalogue"
      title="Products & stock"
      description="Add new drops, adjust prices, restock shelves and archive what is finished."
      actions={
        <button type="button" onClick={load} className="btn-secondary">
          <FiRefreshCw size={14} className={state.loading ? "animate-spin" : ""} /> Refresh
        </button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="label">Inventory</p>
              <p className="text-sm font-semibold text-ink">{products.length} products</p>
            </div>
          </div>

          <div className="divide-y divide-line">
            {products.map((product) => (
              <div key={product.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
                  {product.image ? (
                    <Image src={product.image} alt={product.title} fill sizes="48px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{product.title}</p>
                  <p className="text-[11px] text-muted">
                    {product.category} · {product.sku} · {product.status.toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{formatNaira(product.price)}</p>
                  {product.oldprice && (
                    <p className="text-[10px] text-muted line-through">{formatNaira(product.oldprice)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-line bg-surface-2 px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => adjustStock(product, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-ink-soft hover:bg-surface hover:text-accent"
                    aria-label={`Reduce stock of ${product.title}`}
                  >
                    −
                  </button>
                  <span
                    className={`w-8 text-center text-xs font-semibold tabular-nums ${
                      product.stock === 0 ? "text-accent" : product.stock <= (product.lowStockAt ?? 5) ? "text-gold" : "text-ink"
                    }`}
                  >
                    {product.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustStock(product, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-ink-soft hover:bg-surface hover:text-accent"
                    aria-label={`Increase stock of ${product.title}`}
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => startEdit(product)} className="btn-icon h-8 w-8" aria-label={`Edit ${product.title}`}>
                    <FiEdit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => archive(product)}
                    className="btn-icon h-8 w-8 hover:border-accent hover:text-accent"
                    aria-label={`Archive ${product.title}`}
                  >
                    <FiArchive size={13} />
                  </button>
                </div>
              </div>
            ))}

            {products.length === 0 && !state.loading && (
              <p className="px-4 py-10 text-center text-sm text-ink-soft">
                No products yet. Create the first one on the right.
              </p>
            )}
          </div>
        </section>

        <form onSubmit={save} className="card p-4 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">{editingId ? "Edit product" : "New product"}</h2>
            {editingId && (
              <button type="button" onClick={reset} className="btn-icon h-8 w-8" aria-label="Cancel edit">
                <FiX size={13} />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label htmlFor="title" className="label">Name</label>
              <input
                id="title"
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="field mt-1.5"
                placeholder="Zobo Dew Hydrating Serum"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="category" className="label">Category</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="field mt-1.5 cursor-pointer"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="field mt-1.5 cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="price" className="label">Price (₦)</label>
                <input
                  id="price"
                  type="number"
                  min="1"
                  required
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="oldPrice" className="label">Compare at (₦)</label>
                <input
                  id="oldPrice"
                  type="number"
                  min="0"
                  value={form.oldPrice}
                  onChange={(event) => setForm({ ...form, oldPrice: event.target.value })}
                  className="field mt-1.5"
                  placeholder="optional"
                />
              </div>
              <div>
                <label htmlFor="stock" className="label">Stock</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(event) => setForm({ ...form, stock: event.target.value })}
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="lowStockAt" className="label">Low stock at</label>
                <input
                  id="lowStockAt"
                  type="number"
                  min="1"
                  value={form.lowStockAt}
                  onChange={(event) => setForm({ ...form, lowStockAt: event.target.value })}
                  className="field mt-1.5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sku" className="label">SKU (optional)</label>
              <input
                id="sku"
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                className="field mt-1.5"
                placeholder="auto-generated"
              />
            </div>

            <div>
              <label htmlFor="image" className="label">Image URL</label>
              <input
                id="image"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                className="field mt-1.5"
                placeholder="https://images.unsplash.com/…"
              />
              <p className="mt-1 text-[10px] text-muted">Any public https image URL works.</p>
            </div>

            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="field mt-1.5 resize-y"
                placeholder="What makes this ritual special…"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                className="h-4 w-4 accent-[rgb(var(--accent))]"
              />
              Feature on the storefront
            </label>

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
              {editingId ? <FiSave size={14} /> : <FiPlus size={14} />}
              {state.saving ? "Saving…" : editingId ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
