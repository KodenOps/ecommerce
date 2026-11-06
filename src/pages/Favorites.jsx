"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/store/store";

const Favorites = () => {
  const { favoriteItems, favorites, addToCart } = useStore();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Saved"
          title="Your favorites"
          description="Everything you've saved for later. Add the whole shelf to your bag when the moment feels right."
          crumbs={[{ label: "Home", href: "/" }, { label: "Saved" }]}
          actions={
            favoriteItems.length > 0 && (
              <button
                type="button"
                onClick={() => favoriteItems.forEach((item) => addToCart(item.id))}
                className="btn-primary"
              >
                Add all to bag
                <FiArrowRight size={14} />
              </button>
            )
          }
        />

        {favorites.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FiHeart size={26} />
            </span>
            <div>
              <p className="font-display text-xl text-ink">Nothing saved yet</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Tap the heart on any product and it will wait for you right here.
              </p>
            </div>
            <Link href="/Shop" className="btn-primary">
              Find something to love
              <FiArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
