"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiUpload,
  FiX,
} from "react-icons/fi";
import productRepo from "@/data/product_repo";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

const STORAGE_KEY = "queenfizzie-product-repo-edits";

const normalizeRepoProduct = (item) => {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];
  const firstSize = sizes[0] || {};
  const price = Number(item?.selling_price ?? firstSize?.price ?? item?.price ?? 0) || 0;
  const explicitCompareAt = Number(
    item?.compare_at ?? item?.compareAt ?? item?.old_price ?? item?.oldPrice ?? 0
  ) || 0;
  const compareAt = explicitCompareAt > price ? explicitCompareAt : 0;
  const baseImage = item?.image_url || item?.image || "";
  const images = Array.isArray(item?.images)
    ? item.images.filter(Boolean)
    : baseImage
      ? [baseImage]
      : [];

  return {
    id: item?.id || `${item?.name || item?.title || "repo"}-${Date.now()}`,
    name: item?.name || item?.title || "Untitled product",
    brand: item?.brand || "QueenFizzie",
    category: item?.category || "Skincare",
    image: baseImage,
    images: [...new Set(images)].slice(0, 3),
    price,
    compareAt,
    stock: Number(item?.unit ?? 25) || 25,
    lowStockAt: 5,
    // Repo items are ready to sell by default. The toggle lets an admin keep
    // an item as a draft without deleting it from the bank.
    listed: item?.listed !== false,
    sizes: sizes.map((size, index) => ({
      value: String(size?.value || size?.label || `size-${index + 1}`),
      label: String(size?.label || size?.value || `Size ${index + 1}`),
      price: Number(size?.price ?? item?.selling_price ?? item?.price ?? 0) || 0,
      stock: Number(size?.stock ?? item?.unit ?? 25) || 25,
    })),
    sku: item?.id || item?.sku || "",
    description: `${item?.brand || "QueenFizzie"} • ${sizes.length ? sizes.map((size) => size.label || size.value).join(", ") : "Multiple sizes available"}`,
  };
};

const getProductRepoEntries = () => {
  if (!Array.isArray(productRepo)) return [];

  return productRepo.flatMap((entry) => {
    if (Array.isArray(entry?.products)) return entry.products;
    if (Array.isArray(entry)) return entry;
    return [entry];
  });
};

const toRepoPayload = (item) => ({
  id: item.id,
  sku: item.sku || item.id,
  name: item.name,
  brand: item.brand,
  category: item.category,
  price: Number(item.price || 0),
  compareAt: Number(item.compareAt || 0),
  stock: Number(item.stock || 0),
  lowStockAt: Number(item.lowStockAt || 5),
  listed: Boolean(item.listed),
  description: item.description || "",
  image: item.image || "",
  images: Array.isArray(item.images) ? item.images.slice(0, 3) : [],
  sizes: Array.isArray(item.sizes) ? item.sizes : [],
});

export default function AdminProductRepo() {
  const [repoItems, setRepoItems] = useState([]);
  const [repoQuery, setRepoQuery] = useState("");
  const [repoEditor, setRepoEditor] = useState(null);
  const [state, setState] = useState({ loading: true, syncing: false, error: "", ok: "" });

  const loadRepo = useCallback(async () => {
    const sourceItems = getProductRepoEntries().map(normalizeRepoProduct);
    let savedItems = [];

    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          savedItems = Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.warn("Product repo local storage is invalid.", error);
      }
    }

    const savedMap = new Map(savedItems.map((item) => [item.id, item]));
    let liveBySku = new Map();

    try {
      const response = await fetch("/api/products?all=1", { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json().catch(() => ({}));
        liveBySku = new Map(
          (payload.products || []).map((product) => [String(product.sku || product.id || ""), product])
        );
      }
    } catch (error) {
      /* keep the source bank when the catalogue cannot be reached */
    }

    const merged = sourceItems.map((item) => {
      const override = savedMap.get(item.id);
      const base = override
        ? {
            ...item,
            ...override,
            sizes: Array.isArray(override.sizes) && override.sizes.length ? override.sizes : item.sizes,
          }
        : item;
      const live = liveBySku.get(String(item.sku || item.id));

      if (!live) {
        return { ...base, listed: Boolean(base.listed), liveProductId: null, liveStatus: null };
      }

      const liveImages = Array.isArray(live.images) ? live.images.filter(Boolean) : [];
      const liveCompareAt = Number(live.oldprice) || 0;

      return {
        ...base,
        name: live.title || base.name,
        category: live.category || base.category,
        price: Number(live.price ?? base.price) || 0,
        compareAt: liveCompareAt > Number(live.price) ? liveCompareAt : 0,
        stock: Number(live.stock ?? base.stock) || 0,
        lowStockAt: Number(live.lowStockAt ?? base.lowStockAt) || 5,
        image: live.image || base.image,
        images: liveImages.length ? liveImages : base.images,
        description: live.description || base.description,
        sizes: Array.isArray(live.sizes) && live.sizes.length ? live.sizes : base.sizes,
        listed: live.status === "ACTIVE",
        liveProductId: live.id,
        liveStatus: live.status,
      };
    });

    setRepoItems(merged);
    setRepoEditor((current) => {
      if (current) {
        const match = merged.find((item) => item.id === current.id);
        return match || merged[0] || null;
      }
      return merged[0] || null;
    });
  }, []);

  const pushRepoItems = useCallback(async (items) => {
    const response = await fetch("/api/products/sync-repo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(toRepoPayload) }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Could not sync the repo.");
    }

    return payload;
  }, []);

  const syncRepo = useCallback(async () => {
    setState((current) => ({ ...current, syncing: true, error: "", ok: "" }));
    try {
      const payload = await pushRepoItems(repoItems);
      setState((current) => ({
        ...current,
        syncing: false,
        ok: payload.message || `Synced ${payload.synced?.total ?? 0} repo items to the catalogue.`,
      }));
      await loadRepo();
    } catch (error) {
      setState((current) => ({
        ...current,
        syncing: false,
        error: error.message || "Could not sync the repo.",
      }));
    }
  }, [loadRepo, pushRepoItems, repoItems]);

  useEffect(() => {
    let cancelled = false;

    loadRepo().finally(() => {
      if (!cancelled) setState((current) => ({ ...current, loading: false }));
    });

    return () => {
      cancelled = true;
    };
  }, [loadRepo]);

  const filteredRepoItems = useMemo(() => {
    const query = repoQuery.trim().toLowerCase();
    if (!query) return repoItems;
    return repoItems.filter((item) => [item.name, item.brand, item.category, item.sku, item.id].some((value) =>
      String(value || "").toLowerCase().includes(query)
    ));
  }, [repoItems, repoQuery]);

  const openRepoEditor = (item) => {
    setRepoEditor({ ...item, sizes: Array.isArray(item?.sizes) ? item.sizes.map((size) => ({ ...size })) : [] });
  };

  const closeRepoEditor = () => setRepoEditor(null);

  const updateRepoEditor = (field, value) => {
    setRepoEditor((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateRepoSize = (index, field, value) => {
    setRepoEditor((current) => {
      if (!current) return current;
      const sizes = [...(current.sizes || [])];
      sizes[index] = { ...sizes[index], [field]: field === "price" ? Number(value || 0) : value };
      return { ...current, sizes };
    });
  };

  const addRepoSize = () => {
    setRepoEditor((current) => ({
      ...current,
      sizes: [...(current?.sizes || []), { value: `size-${Date.now()}`, label: "New size", price: 0, stock: 25 }],
    }));
  };

  const handleRepoImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setState((current) => ({ ...current, error: "Please choose an image file." }));
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
        setRepoEditor((current) => (current ? { ...current, image: imageUrl, images: [...new Set([...(current.images || []), imageUrl].filter(Boolean))].slice(0, 3) } : current));
        setState((current) => ({ ...current, ok: `${file.name} has been saved to storage.`, error: "" }));
      } catch (error) {
        setState((current) => ({ ...current, error: "Could not upload that image." }));
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const saveRepoItem = async () => {
    if (!repoEditor) return;
    const nextItems = repoItems.map((item) =>
      item.id === repoEditor.id
        ? {
            ...item,
            ...repoEditor,
            image: repoEditor.image || "",
            images: Array.isArray(repoEditor.images) ? repoEditor.images.slice(0, 3) : [],
            price: Number(repoEditor.price || 0),
            sizes: repoEditor.sizes || [],
          }
        : item
    );
    const savedItem = nextItems.find((item) => item.id === repoEditor.id) || repoEditor;

    setRepoItems(nextItems);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    }

    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));
    try {
      await pushRepoItems([savedItem]);
      await loadRepo();
      setState((current) => ({
        ...current,
        saving: false,
        ok: `${savedItem.name} was saved ${savedItem.listed ? "and is live in the shop." : "as a draft."}`,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: error.message || "Could not save that repo item.",
      }));
    }
  };

  const toggleRepoListing = (repoId) => {
    const nextItems = repoItems.map((item) =>
      item.id === repoId ? { ...item, listed: !item.listed } : item
    );
    setRepoItems(nextItems);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    }
  };

  const importRepoItem = async (repoItem) => {
    const listedItem = { ...repoItem, listed: true };
    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));

    try {
      await pushRepoItems([listedItem]);
      await loadRepo();
      setState((current) => ({
        ...current,
        saving: false,
        ok: `${repoItem.name} is now live in the shop.`,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: error.message || "Could not import that repo item.",
      }));
    }
  };

  const importListedRepoItems = async () => {
    const selected = repoItems.filter((item) => item.listed);
    if (!selected.length) {
      setState((current) => ({ ...current, error: "Select at least one repo item to list." }));
      return;
    }

    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));
    try {
      // Send the whole bank so unselected items are explicitly kept as drafts.
      await pushRepoItems(repoItems);
      await loadRepo();
      setState((current) => ({
        ...current,
        saving: false,
        ok: `Listed ${selected.length} repo products in the storefront.`,
        error: "",
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: error.message || "Could not sync the selected repo items.",
      }));
    }
  };

  return (
    <AdminShell
      eyebrow="Catalogue"
      title="Product repository"
      description="Manage the source product bank, edit their details, upload a product photo, and import the selected items into the storefront."
      actions={
        <div className="flex items-center gap-2">
          <button type="button" onClick={syncRepo} className="btn-secondary">
            <FiRefreshCw size={14} className={state.syncing ? "animate-spin" : ""} /> Sync repo
          </button>
          <button type="button" onClick={loadRepo} className="btn-secondary">
            <FiRefreshCw size={14} /> Reload
          </button>
        </div>
      }
    >
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label">Repository</p>
            <p className="text-sm font-semibold text-ink">{repoItems.length} banked items</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={importListedRepoItems} className="btn-secondary text-xs">
              List selected
            </button>
          </div>
        </div>

        <div className="border-b border-line px-4 py-3">
          <input
            value={repoQuery}
            onChange={(event) => setRepoQuery(event.target.value)}
            className="field w-full"
            placeholder="Search repo items"
          />
        </div>

        <div className="divide-y divide-line">
          {filteredRepoItems.map((item) => {
            const liveLabel =
              item.liveStatus === "ACTIVE"
                ? "Listed"
                : item.liveStatus === "ARCHIVED"
                  ? "Archived"
                  : item.liveStatus === "DRAFT"
                    ? "Draft"
                    : item.listed
                      ? "Ready"
                      : "Draft";
            const isLive = item.liveStatus === "ACTIVE";

            return (
            <div key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
                {item.image ? <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" /> : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-[11px] text-muted">{item.brand} · {item.category}</p>
              </div>

              <div className="text-right text-sm font-semibold text-ink">{formatNaira(item.price)}</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleRepoListing(item.id)}
                  className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                    isLive || (!item.liveStatus && item.listed)
                      ? "bg-accent text-white"
                      : "border border-line bg-surface-2 text-muted"
                  }`}
                >
                  {liveLabel}
                </button>
                <button type="button" onClick={() => openRepoEditor(item)} className="btn-secondary text-[10px] px-2 py-1">
                  Edit
                </button>
                <button type="button" onClick={() => importRepoItem(item)} className="btn-secondary text-[10px] px-2 py-1">
                  Import
                </button>
              </div>
            </div>
            );
          })}

          {filteredRepoItems.length === 0 && !state.syncing && (
            <p className="px-4 py-10 text-center text-sm text-ink-soft">No repo items found. Sync the source file to load it.</p>
          )}
        </div>
      </div>

      {repoEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-line bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="label">Edit repo item</p>
                <h2 className="font-display text-xl text-ink">{repoEditor.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={saveRepoItem} className="btn-secondary text-xs">
                  <FiSave size={12} /> Save item
                </button>
                <button type="button" onClick={closeRepoEditor} className="btn-icon h-8 w-8" aria-label="Close repo editor">
                  <FiX size={13} />
                </button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-4">
              <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-line bg-surface-2 p-3">
                  <div className="relative mb-3 h-56 overflow-hidden rounded-xl border border-line bg-surface">
                    {repoEditor.image ? (
                      <Image src={repoEditor.image} alt={repoEditor.name} fill className="object-cover" sizes="260px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-soft">
                        <FiImage size={32} />
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-accent hover:text-accent">
                    <FiUpload size={12} /> Upload image
                    <input type="file" accept="image/*" className="hidden" onChange={handleRepoImageUpload} />
                  </label>

                  <div className="mt-3">
                    <label className="label">Image URL</label>
                    <input
                      value={repoEditor.image || ""}
                      onChange={(event) => updateRepoEditor("image", event.target.value)}
                      className="field mt-1.5"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="label">Name</label>
                    <input value={repoEditor.name || ""} onChange={(event) => updateRepoEditor("name", event.target.value)} className="field mt-1.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Brand</label>
                      <input value={repoEditor.brand || ""} onChange={(event) => updateRepoEditor("brand", event.target.value)} className="field mt-1.5" />
                    </div>
                    <div>
                      <label className="label">Category</label>
                      <input value={repoEditor.category || ""} onChange={(event) => updateRepoEditor("category", event.target.value)} className="field mt-1.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Price</label>
                      <input type="number" value={repoEditor.price || 0} onChange={(event) => updateRepoEditor("price", Number(event.target.value || 0))} className="field mt-1.5" />
                    </div>
                    <div>
                      <label className="label">Compare at</label>
                      <input type="number" value={repoEditor.compareAt || 0} onChange={(event) => updateRepoEditor("compareAt", Number(event.target.value || 0))} className="field mt-1.5" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea rows={3} value={repoEditor.description || ""} onChange={(event) => updateRepoEditor("description", event.target.value)} className="field mt-1.5" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="label">Sizes</label>
                      <button type="button" onClick={addRepoSize} className="btn-secondary text-[10px] px-2 py-1">
                        <FiPlus size={10} /> Add size
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(repoEditor.sizes || []).map((size, index) => (
                        <div key={`${repoEditor.id}-${size.value || index}`} className="grid grid-cols-[1fr_1fr_120px] gap-2 rounded-xl border border-line bg-surface p-2">
                          <input
                            value={size.label || ""}
                            onChange={(event) => updateRepoSize(index, "label", event.target.value)}
                            className="field"
                            placeholder="Label"
                          />
                          <input
                            value={size.value || ""}
                            onChange={(event) => updateRepoSize(index, "value", event.target.value)}
                            className="field"
                            placeholder="Value"
                          />
                          <input
                            type="number"
                            value={size.price || 0}
                            onChange={(event) => updateRepoSize(index, "price", event.target.value)}
                            className="field"
                            placeholder="₦"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(state.error || state.ok) && (
        <div className="card p-3">
          {state.error ? (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <FiAlertCircle size={12} /> {state.error}
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
              <FiCheckCircle size={12} /> {state.ok}
            </p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
