"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheck, FiEdit3, FiPlus, FiRefreshCw, FiSave, FiTrash2, FiX } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

const EMPTY = {
  code: "",
  name: "",
  color: "#1a1a1a",
  description: "",
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [state, setState] = useState({ loading: true, saving: false, error: "", ok: "" });
  const [filterDraft, setFilterDraft] = useState("");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "", ok: "" }));
    try {
      const response = await fetch("/api/admin/categories", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({
          ...current,
          loading: false,
          error: payload.error || "Could not load categories.",
        }));
        return;
      }
      setCategories(payload.categories || []);
    } catch (failure) {
      setState((current) => ({
        ...current,
        loading: false,
        error: "Could not load categories. Check your connection.",
      }));
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = filterDraft.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.code.toLowerCase().includes(query) ||
        (category.description || "").toLowerCase().includes(query)
    );
  }, [categories, filterDraft]);

  const startCreate = () => {
    setEditing(null);
    setDraft(EMPTY);
    setState((current) => ({ ...current, error: "", ok: "" }));
  };

  const startEdit = (category) => {
    setEditing(category);
    setDraft({
      code: category.code,
      name: category.name,
      color: category.color || "#1a1a1a",
      description: category.description || "",
    });
    setState((current) => ({ ...current, error: "", ok: "" }));
  };

  const cancel = () => {
    setEditing(null);
    setDraft(EMPTY);
    setState((current) => ({ ...current, error: "" }));
  };

  const remove = async (category) => {
    if (!confirm(`Delete “${category.name}”? Products are not deleted, but they will keep using this category name.`)) {
      return;
    }
    setState((current) => ({ ...current, saving: true, error: "", ok: "" }));
    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: category.code }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({
          ...current,
          saving: false,
          error: payload.error || "Could not delete that category.",
        }));
        return;
      }
      setCategories((current) => current.filter((item) => item.code !== category.code));
      setState((current) => ({ ...current, saving: false, ok: "Category deleted." }));
    } catch (failure) {
      setState((current) => ({
        ...current,
        saving: false,
        error: "Could not delete that category. Check your connection.",
      }));
    }
  };

  const save = async () => {
    setState((current) => ({ ...current, saving: true, error: "" }));
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({
          ...current,
          saving: false,
          error: payload.error || "Could not save that category.",
        }));
        return;
      }
      const saved = payload.category;
      if (editing && editing.code === saved.code) {
        setCategories((current) =>
          current.map((item) => (item.code === saved.code ? saved : item))
        );
        setDraft(saved);
      } else {
        setCategories((current) => {
          const existing = current.findIndex((item) => item.code === saved.code);
          if (existing >= 0) {
            const next = current.slice();
            next[existing] = saved;
            return next;
          }
          return [...current, saved];
        });
        setEditing(saved);
      }
      setState((current) => ({ ...current, saving: false, ok: "Category saved." }));
    } catch (failure) {
      setState((current) => ({
        ...current,
        saving: false,
        error: "Could not save that category. Check your connection.",
      }));
    }
  };

  const selected = useMemo(
    () => (editing ? categories.find((item) => item.code === editing.code) || null : null),
    [categories, editing]
  );

  const colorPreview = (color) => {
    if (!color || !/^#[0-9a-fA-F]{3,4}$/.test(color) && !/^#[0-9a-fA-F]{6}$/i.test(color) && !/^#[0-9a-fA-F]{8}$/i.test(color)) {
      return "#1a1a1a";
    }
    return color;
  };

  return (
    <AdminShell
      eyebrow="Catalogue"
      title="Product categories"
      description="Organise products into named groups such as Skincare, Scented Candles or Gifts & Sets."
      actions={
        <>
          <button type="button" onClick={startCreate} className="btn-primary">
            <FiPlus size={14} /> New category
          </button>
          <button
            type="button"
            onClick={load}
            className="btn-secondary"
            disabled={state.loading}
          >
            <FiRefreshCw size={14} className={state.loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </>
      }
    >
      {state.error && (
        <p className="rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          {state.ok}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
        <section className="card">
          <div className="border-b border-line px-4 py-3">
            <p className="label">Categories</p>
            <p className="mt-0.5 text-xs text-muted">
              {categories.length} category{categories.length === 1 ? "" : "ies"}
            </p>
          </div>

          <div className="px-4 py-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Filter by name, code or description"
                value={filterDraft}
                onChange={(event) => setFilterDraft(event.target.value)}
                className="field w-full"
                aria-label="Filter categories"
              />
            </div>
          </div>

          <div className="divide-y divide-line">
            {filtered.length === 0 && !state.loading && (
              <p className="px-4 py-10 text-center text-sm text-ink-soft">
                No categories found.
              </p>
            )}

            {filtered.map((category) => (
              <div
                key={category.code}
                className={`group flex items-start gap-4 px-4 py-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${selected?.code === category.code ? "bg-accent-soft" : "hover:bg-surface-2"}`}
              >
                <span
                  className="mt-1 h-9 w-9 shrink-0 rounded-full border border-line"
                  style={{ backgroundColor: colorPreview(category.color) }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {category.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    code: {category.code}
                    {category.description ? ` · ${category.description}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="btn-ghost"
                    title="Edit category"
                  >
                    <FiEdit3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    className="btn-ghost text-red-500"
                    title="Delete category"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > 0 && (
            <p className="px-4 py-3 text-[11px] text-muted">
              Categories are used to organise products. Removing a category does not
              delete products; it only leaves their category name as-is.
            </p>
          )}
        </section>

        <section className="card">
          <div className="border-b border-line px-4 py-3">
            <p className="label">
              {editing ? "Edit category" : "New category"}
            </p>
            <p className="text-[11px] text-muted">
              Each category has a unique code that products can reference.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label className="label" htmlFor="category-code">
                Code
              </label>
              <input
                id="category-code"
                type="text"
                value={draft.code}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, code: event.target.value }))
                }
                maxLength={40}
                className="field mt-1.5"
                placeholder="e.g. skincare"
              />
              <p className="mt-1 text-[11px] text-muted">
                Lowercase, no spaces, unique across categories.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="category-name">
                Name
              </label>
              <input
                id="category-name"
                type="text"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                maxLength={80}
                className="field mt-1.5"
                placeholder="e.g. Skincare"
              />
            </div>

            <div>
              <label className="label" htmlFor="category-color">
                Colour
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="category-color"
                  type="color"
                  value={draft.color}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-full border border-line bg-transparent p-0"
                />
                <input
                  type="text"
                  value={draft.color}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, color: event.target.value }))
                  }
                  maxLength={20}
                  className="field font-mono"
                  placeholder="#1a1a1a"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="category-description">
                Description
              </label>
              <textarea
                id="category-description"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
                maxLength={500}
                className="field mt-1.5 min-h-[96px] resize-y"
                placeholder="How this category is used, for example in filters and browse pages."
              />
            </div>

            <div className="flex items-center gap-3 border-t border-line pt-4">
              {editing && (
                <button type="button" onClick={cancel} className="btn-ghost">
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                onClick={save}
                disabled={state.saving || !draft.code.trim() || !draft.name.trim()}
                className="btn-primary"
              >
                <FiSave size={14} />
                {state.saving ? "Saving…" : editing ? "Update category" : "Create category"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
