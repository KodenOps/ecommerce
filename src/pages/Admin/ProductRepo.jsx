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
      is_default: Boolean(size?.is_default ?? size?.isDefault ?? index === 0),
      meta: Array.isArray(size?.meta) ? size.meta : [],
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
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [repoEditor, setRepoEditor] = useState(null);
  const [state, setState] = useState({ loading: true, syncing: false, saving: false, error: "", ok: "" });

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
      if (!current) return null;
      return merged.find((item) => item.id === current.id) || current;
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
    // Only items already in the store are pushed, and their existing status is
    // preserved, so syncing never publishes a repo item on its own.
    const liveItems = repoItems
      .filter((item) => item.liveProductId)
      .map((item) => ({ ...item, listed: item.liveStatus === "ACTIVE" }));

    if (!liveItems.length) {
      setState((current) => ({
        ...current,
        syncing: false,
        ok: "",
        error: "No repo items are in the store yet. Search for an item and use Add To Store first.",
      }));
      return;
    }

    setState((current) => ({ ...current, syncing: true, error: "", ok: "" }));
    try {
      const payload = await pushRepoItems(liveItems);
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

  const searchResults = useMemo(() => {
    const query = submittedQuery.trim().toLowerCase();
    if (!query) return [];
    return repoItems.filter((item) => [item.name, item.brand, item.category, item.sku, item.id].some((value) =>
      String(value || "").toLowerCase().includes(query)
    ));
  }, [repoItems, submittedQuery]);

  const runSearch = (event) => {
    event?.preventDefault();
    setSubmittedQuery(repoQuery.trim());
  };

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

    if (!savedItem.liveProductId) {
      closeRepoEditor();
      setState((current) => ({
        ...current,
        saving: false,
        ok: `${savedItem.name} was saved in the repo. Use Add to store to publish it.`,
      }));
      return;
    }

    try {
      await pushRepoItems([{ ...savedItem, listed: savedItem.liveStatus === "ACTIVE" }]);
      await loadRepo();
      closeRepoEditor();
      setState((current) => ({
        ...current,
        saving: false,
        ok: `${savedItem.name} was saved and updated in the shop.`,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: error.message || "Could not save that repo item.",
      }));
    }
  };

  const addToStore = async (repoItem) => {
    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));

    try {
      await pushRepoItems([{ ...repoItem, listed: true }]);
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
        error: error.message || "Could not add that repo item to the store.",
      }));
    }
  };

  return (
    <AdminShell
      eyebrow="Catalogue"
      title="Product repository"
      description="Search the source product bank, edit an item, then add it to the storefront when it is ready to sell."
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
        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label">Repository</p>
            <p className="text-sm font-semibold text-ink">{repoItems.length} banked items</p>
          </div>
          <form onSubmit={runSearch} className="flex w-full items-center gap-2 md:w-auto">
            <input
              value={repoQuery}
              onChange={(event) => setRepoQuery(event.target.value)}
              className="field w-full md:w-64"
              placeholder="Search repo items"
              aria-label="Search repo items"
            />
            <button type="submit" className="btn-primary shrink-0 text-xs">
              Search
            </button>
          </form>
        </div>

        {submittedQuery && (
          <div className="divide-y divide-line border-t border-line">
            {searchResults.map((item) => (
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
                    onClick={() => addToStore(item)}
                    disabled={state.saving}
                    className="btn-primary px-3 py-1.5 text-[11px]"
                  >
                    Add To Store
                  </button>
                  <button
                    type="button"
                    onClick={() => openRepoEditor(item)}
                    className="btn-secondary px-3 py-1.5 text-[11px]"
                  >
                    Edit Item
                  </button>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-ink-soft">
                No repo items match “{submittedQuery}”.
              </p>
            )}
          </div>
        )}
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
                <button
                  type="button"
                  onClick={saveRepoItem}
                  className="btn-secondary hidden text-xs md:inline-flex"
                >
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
                </div>                  <div className="space-y-3">
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
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="label">Options</label>
                      <button type="button" onClick={addRepoSize} className="btn-secondary text-[10px] px-2 py-1">
                        <FiPlus size={10} /> Add option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(repoEditor.sizes || []).map((size, index) => (
                        <div key={`${repoEditor.id}-${size.value || index}`} className="rounded-xl border border-line bg-surface p-2">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                              Option {index + 1}
                            </span>
                            {size.is_default ? (
                              <span className="text-[10px] font-medium text-accent">Default</span>
                            ) : null}
                          </div>

                          <div className="grid grid-cols-[1fr_1fr_120px] gap-2 rounded-xl border border-line bg-surface-2 p-2">
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

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Boolean(size.is_default)}
                                onChange={(event) =>
                                  updateRepoSize(index, "is_default", event.target.checked)
                                }
                                className="h-4 w-4 rounded border-line accent-accent"
                                aria-label="Set as default option"
                              />
                              <label className="text-xs text-ink-soft">
                                Use as the default option
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={size.stock || 0}
                                onChange={(event) =>
                                  updateRepoSize(index, "stock", Number(event.target.value || 0))
                                }
                                className="field"
                                placeholder="Stock"
                              />
                              <label className="text-xs text-ink-soft">Stock</label>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                                Extra attributes
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateRepoSize(index, "meta", [
                                    ...(Array.isArray(size.meta) ? size.meta : []),
                                    { key: "", value: "" },
                                  ])
                                }
                                className="text-[10px] text-accent hover:text-accent-ink"
                              >
                                + Add attribute
                              </button>
                            </div>

                            <div className="space-y-1">
                              {(Array.isArray(size.meta) ? size.meta : []).map((meta, metaIndex) => (
                                <div
                                  key={`${index}-${metaIndex}`}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    value={meta.key || ""}
                                    onChange={(event) => {
                                      const next = [...(Array.isArray(size.meta) ? size.meta : [])];
                                      next[metaIndex] = {
                                        ...next[metaIndex],
                                        key: event.target.value,
                                      };
                                      updateRepoSize(index, "meta", next);
                                    }}
                                    className="field w-1/2"
                                    placeholder="Key"
                                  />
                                  <input
                                    value={meta.value || ""}
                                    onChange={(event) => {
                                      const next = [...(Array.isArray(size.meta) ? size.meta : [])];
                                      next[metaIndex] = {
                                        ...next[metaIndex],
                                        value: event.target.value,
                                      };
                                      updateRepoSize(index, "meta", next);
                                    }}
                                    className="field w-1/2"
                                    placeholder="Value"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (Array.isArray(size.meta) ? size.meta : []).filter(
                                        (_, m) => m !== meta
                                      );
                                      updateRepoSize(index, "meta", next);
                                    }}
                                    className="text-[10px] text-muted hover:text-accent"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const next = (repoEditor.sizes || []).filter((_, s) => s !== size);
                                updateRepoEditor("sizes", next);
                              }}
                              className="text-[10px] text-muted hover:text-accent"
                            >
                              Remove option
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-line pt-3 md:hidden">
                    <button
                      type="button"
                      onClick={saveRepoItem}
                      disabled={state.saving}
                      className="btn-primary w-full"
                    >
                      <FiSave size={14} /> {state.saving ? "Saving…" : "Save item"}
                    </button>
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
