"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  FiAlertCircle,
  FiArchive,
  FiCheckCircle,
  FiEdit3,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiUpload,
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

const MAX_PRODUCT_IMAGES = 3;

const REPO_STORAGE_KEY = "queenfizzie-product-repo-edits";

const EMPTY = {
  title: "",
  sku: "",
  category: "Skincare",
  price: "",
  oldPrice: "",
  image: "",
  images: [],
  stock: "25",
  lowStockAt: "5",
  status: "ACTIVE",
  featured: false,
  description: "",
};

const readRepoOverrides = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(REPO_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const toRepoPayload = (product) => {
  const normalizedImages = Array.isArray(product?.images) && product.images.length
    ? product.images.filter(Boolean).slice(0, 3)
    : product?.image
      ? [product.image]
      : [];

  return {
    id: product?.sku || product?.id || `repo-${Date.now()}`,
    sku: product?.sku || product?.id || "",
    name: product?.title || "Untitled product",
    brand: product?.brand || "QueenFizzie",
    category: product?.category || "Skincare",
    image: product?.image || normalizedImages[0] || "",
    images: normalizedImages,
    price: Number(product?.price || 0),
    compareAt: Number(product?.oldprice || 0),
    stock: Number(product?.stock || 25),
    lowStockAt: Number(product?.lowStockAt || 5),
    listed: product?.status === "ACTIVE",
    description: product?.description || "",
    sizes: Array.isArray(product?.sizes) ? product.sizes.map((size) => ({
      value: String(size?.value || size?.label || "default"),
      label: String(size?.label || size?.value || "Standard"),
      price: Number(size?.price || product?.price || 0),
      stock: Number(size?.stock || 0),
    })) : [],
  };
};

const syncProductToRepo = (product) => {
  if (!product || typeof window === "undefined") return;
  const repoItems = readRepoOverrides();
  const repoPayload = toRepoPayload(product);
  const existingIndex = repoItems.findIndex((item) =>
    item.id === repoPayload.id || item.id === product?.sku || item.id === product?.id || item.sku === repoPayload.sku || item.sku === product?.sku
  );

  const nextItems = existingIndex >= 0
    ? repoItems.map((item, index) => index === existingIndex ? { ...item, ...repoPayload, id: item.id || repoPayload.id, sku: item.sku || repoPayload.sku } : item)
    : [...repoItems, repoPayload];

  window.localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(nextItems));
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

      const repoItems = readRepoOverrides();
      const repoMap = new Map(
        repoItems.map((item) => [String(item.id || item.sku || ""), item])
      );

      const mergedProducts = (payload.products || []).map((product) => {
        const match = repoMap.get(String(product.sku || product.id || "")) || repoMap.get(String(product.id || ""));
        if (!match) return product;

        const mergedImages = Array.isArray(match.images) && match.images.length
          ? match.images.slice(0, 3)
          : match.image
            ? [match.image]
            : Array.isArray(product.images) && product.images.length
              ? product.images.slice(0, 3)
              : product.image
                ? [product.image]
                : [];

        return {
          ...product,
          title: match.name || product.title,
          description: match.description || product.description,
          category: match.category || product.category,
          price: Number(match.price ?? product.price ?? 0),
          oldprice: Number(match.compareAt) > Number(match.price) ? match.compareAt : product.oldprice || null,
          image: match.image || mergedImages[0] || product.image || "",
          images: mergedImages,
          stock: Number(match.stock ?? product.stock ?? 0),
          lowStockAt: Number(match.lowStockAt ?? product.lowStockAt ?? 5),
          status: product.status,
          sku: match.sku || product.sku || match.id,
          sizes: Array.isArray(match.sizes) && match.sizes.length ? match.sizes : product.sizes || [],
        };
      });

      setProducts(mergedProducts);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: "Could not load products." }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (product) => {
    const images = Array.isArray(product.images) && product.images.length
      ? product.images.filter(Boolean)
      : product.image
        ? [product.image]
        : [];

    setEditingId(product.id);
    setForm({
      title: product.title,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldprice ? String(product.oldprice) : "",
      image: images[0] || "",
      images,
      stock: String(product.stock),
      lowStockAt: String(product.lowStockAt ?? 5),
      status: product.status,
      featured: Boolean(product.featured),
      description: product.description,
    });
    setIsModalOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openNewProductModal = () => {
    setEditingId(null);
    setForm(EMPTY);
    setIsModalOpen(true);
  };

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
    setIsModalOpen(false);
  };

  const save = async (event) => {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));
    try {
      const images = [...new Set((form.images || [form.image]).filter(Boolean))].slice(0, 3);
      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images,
          image: images[0] || "",
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

      const savedProduct = payload.product || {
        ...form,
        id: editingId || form.sku || `repo-${Date.now()}`,
        sku: form.sku || `QF-${Date.now()}`,
        title: form.title,
        price: Number(form.price),
        oldprice: form.oldPrice ? Number(form.oldPrice) : null,
        image: form.image,
        images: [...new Set((form.images || [form.image]).filter(Boolean))].slice(0, 3),
        stock: Number(form.stock),
        lowStockAt: Number(form.lowStockAt),
        status: form.status,
        description: form.description,
      };

      syncProductToRepo(savedProduct);
      reset();
      setState((current) => ({ ...current, saving: false, ok: editingId ? "Product updated." : "Product created." }));
      load();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: "Could not save that product." }));
    }
  };

  const handleProductImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setState((current) => ({ ...current, error: "Please choose an image file." }));
      return;
    }

    if ((form.images || []).length >= MAX_PRODUCT_IMAGES) {
      setState((current) => ({ ...current, error: "You can add up to 3 product pictures." }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = String(reader.result || "");
      try {
        const response = await fetch("/api/products/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: result, name: file.name }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          setState((current) => ({ ...current, error: payload.error || "Could not upload that image." }));
          event.target.value = "";
          return;
        }

        const imageUrl = payload.imageUrl || payload.publicUrl || result;
        setForm((current) => {
          const nextImages = [...new Set([...(current.images || []), imageUrl].filter(Boolean))].slice(0, MAX_PRODUCT_IMAGES);
          return { ...current, images: nextImages, image: nextImages[0] || "" };
        });
        setState((current) => ({ ...current, ok: `${file.name} is saved to storage.`, error: "" }));
      } catch (error) {
        setState((current) => ({ ...current, error: "Could not upload that image." }));
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProductImage = (indexToRemove) => {
    setForm((current) => {
      const nextImages = (current.images || []).filter((_, index) => index !== indexToRemove);
      return { ...current, images: nextImages, image: nextImages[0] || "" };
    });
  };

  const updatePrimaryImageUrl = (value) => {
    const nextUrl = String(value || "").trim();
    setForm((current) => {
      const currentImages = Array.isArray(current.images) ? current.images.filter(Boolean) : [];
      const nextImages = nextUrl
        ? [...new Set([nextUrl, ...currentImages])].slice(0, MAX_PRODUCT_IMAGES)
        : currentImages.slice(0, MAX_PRODUCT_IMAGES);

      return {
        ...current,
        image: nextUrl || nextImages[0] || "",
        images: nextImages,
      };
    });
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
        <div className="flex items-center gap-2">
          <button type="button" onClick={openNewProductModal} className="btn-primary">
            <FiPlus size={14} /> New product
          </button>
          <button type="button" onClick={load} className="btn-secondary">
            <FiRefreshCw size={14} className={state.loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      }
    >
      <div className="card overflow-hidden">
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-display text-xl text-ink">{editingId ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={reset} className="btn-icon h-8 w-8" aria-label="Close product editor">
                <FiX size={13} />
              </button>
            </div>

            <form onSubmit={save} className="max-h-[80vh] overflow-y-auto p-4">
              <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-line bg-surface-2 p-3">
                  <div className="relative mb-3 h-56 overflow-hidden rounded-xl border border-line bg-surface">
                    {form.image ? (
                      <Image src={form.image} alt={form.title || "Product preview"} fill className="object-cover" sizes="260px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-soft">
                        <FiImage size={32} />
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-accent hover:text-accent">
                    <FiUpload size={12} /> Upload product picture
                    <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                  </label>

                  <div className="mt-3 space-y-2">
                    {form.images.length > 0 && (
                      <div className="space-y-2">
                        {form.images.map((imageUrl, index) => (
                          <div key={`${imageUrl}-${index}`} className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-line bg-surface-2">
                              {imageUrl ? <Image src={imageUrl} alt={`Product image ${index + 1}`} fill className="object-cover" sizes="40px" /> : null}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-[10px] text-ink-soft">Image {index + 1}</span>
                            <button type="button" onClick={() => removeProductImage(index)} className="btn-icon h-7 w-7 text-[10px]">
                              <FiX size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <label htmlFor="image" className="label">Image URL</label>
                      <input
                        id="image"
                        value={form.image}
                        onChange={(event) => updatePrimaryImageUrl(event.target.value)}
                        className="field mt-1.5"
                        placeholder="https://images.unsplash.com/…"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
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

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={reset} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={state.saving} className="btn-primary">
                      {editingId ? <FiSave size={14} /> : <FiPlus size={14} />}
                      {state.saving ? "Saving…" : editingId ? "Save changes" : "Create product"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
