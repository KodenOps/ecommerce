"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest saving" },
];

const Shop = () => {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = router.query.category;
    setCategory(typeof fromQuery === "string" && fromQuery ? fromQuery : "All");
  }, [router.isReady, router.query.category]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((item) => item.category)))],
    []
  );

  const visible = useMemo(() => {
    let list = products.filter((item) => category === "All" || item.category === category);

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.category.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle)
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));
        break;
      case "discount":
        sorted.sort(
          (a, b) =>
            (b.oldprice ? (b.oldprice - b.price) / b.oldprice : 0) -
            (a.oldprice ? (a.oldprice - a.price) / a.oldprice : 0)
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [category, query, sort]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="The shop"
          title="Every routine, in one place"
          description="Twelve original formulas across skincare, scent and body — blended for melanin-rich skin in Nigeria, ready to ship from Lagos."
          crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        />

        <div className="card flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <FiSearch
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search serums, mists, shea oil…"
                className="field pl-10 pr-9"
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-accent"
                  aria-label="Clear search"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <FiSliders size={14} className="text-muted" />
              <label htmlFor="sort" className="sr-only">
                Sort products
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="field w-auto cursor-pointer py-2.5 pr-8 text-xs font-semibold"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`chip ${category === item ? "chip-active" : ""}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
            <span>
              {visible.length} {visible.length === 1 ? "product" : "products"}
              {category !== "All" && ` in ${category}`}
            </span>
            {(category !== "All" || query) && (
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setQuery("");
                }}
                className="font-semibold text-accent transition-opacity hover:opacity-70"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="font-display text-xl text-ink">No products match that</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Try a different word, or reset the filters to see the whole shelf.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setQuery("");
              }}
              className="btn-primary mt-6"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
