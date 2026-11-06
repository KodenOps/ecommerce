"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCheck, FiCopy, FiTag } from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { userPageProps } from "@/lib/routeGuards";
import { useStore } from "@/store/store";
import { formatNaira } from "@/lib/money";

export async function getServerSideProps(ctx) {
  return userPageProps(ctx, { fallback: "/Account" });
}

const Promos = () => {
  const { catalog } = useStore();
  const [promos, setPromos] = useState([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/promos/active", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { promos: [] }))
      .then((payload) => setPromos(payload.promos || []))
      .catch(() => {});
  }, []);

  const deals = useMemo(
    () =>
      [...catalog]
        .filter((item) => item.oldprice)
        .sort(
          (a, b) =>
            (b.oldprice - b.price) / b.oldprice - (a.oldprice - a.price) / a.oldprice
        ),
    [catalog]
  );

  const biggest = deals[0];

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1800);
    } catch (error) {
      /* clipboard may be unavailable */
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Promos"
          title="A short window on the glow shelf"
          description="Everything currently reduced, in one place. Stock is limited to the sale window — restocks go back to full price."
          crumbs={[{ label: "Home", href: "/" }, { label: "Promos" }]}
          actions={
            <Link href="/shop" className="btn-secondary">
              Shop everything
              <FiArrowRight size={14} />
            </Link>
          }
        />

        {biggest && (
          <section className="relative overflow-hidden rounded-4xl border border-line bg-ink px-6 py-8 text-canvas sm:px-9">
            <div className="aurora -left-12 top-0 h-56 w-56 bg-accent/40" />
            <div className="aurora -bottom-16 right-0 h-56 w-56 bg-violet/30" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-canvas/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]">
                  <FiTag size={11} /> Deal of the week
                </span>
                <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                  {biggest.title}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-canvas/75">
                  {biggest.description}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl text-accent">{formatNaira(biggest.price)}</span>
                  <span className="text-sm text-canvas/60 line-through">{formatNaira(biggest.oldprice)}</span>
                </div>
                <Link
                  href={`/ProductPreview?id=${biggest.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-canvas px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
                >
                  View the deal
                  <FiArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">On sale</span>
              <h2 className="mt-1 font-display text-2xl text-ink">
                {deals.length} reduced products
              </h2>
            </div>
            <span className="stat-pill hidden sm:inline-flex">
              <FiTag size={12} /> While stock lasts
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section>
          <div>
            <span className="eyebrow">Promo codes</span>
            <h2 className="mt-1 font-display text-2xl text-ink">Live codes from the studio</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Apply any of these at checkout — one code per order.
            </p>
          </div>

          {promos.length === 0 ? (
            <div className="card mt-4 p-8 text-center text-sm text-ink-soft">
              No public promo codes right now. New codes land with our glow letter.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((promo) => (
                <div key={promo.code} className="card card-hover flex flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-dashed border-line-strong bg-surface-2 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-ink">
                      {promo.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(promo.code)}
                      className="btn-icon h-9 w-9"
                      aria-label={`Copy code ${promo.code}`}
                    >
                      {copied === promo.code ? <FiCheck size={14} className="text-accent" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                  <p className="text-sm text-ink-soft">{promo.description}</p>
                  {promo.min_subtotal > 0 && (
                    <p className="text-[11px] text-muted">
                      Minimum spend {formatNaira(promo.min_subtotal)}
                    </p>
                  )}
                  {promo.expires_at && (
                    <p className="text-[11px] text-muted">
                      Ends {new Date(promo.expires_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Promos;
