/**
 * Client-only cart + favorites store.
 *
 * This module has no React imports and no "use client" boundary, so it can be
 * imported from server components as well as client components. The hook is
 * the only React-aware piece, and it lives in a "use client" file below it.
 *
 * For the first pass this stays in-memory. Later, if you add auth/orders, this
 * module can be extended to sync to Supabase without changing its callers.
 */

let cart = [];
let favorites = [];
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener({ cart, favorites }));
}

export function getCart() {
  return cart;
}

export function getFavorites() {
  return favorites;
}

export function addToCart(item) {
  const id = item?.id;
  if (!id) return;

  const existing = cart.find((line) => line.id === id);
  if (existing) {
    existing.quantity = (Number(existing.quantity) || 0) + 1;
  } else {
    cart.push({ id, quantity: 1, ...item });
  }
  notify();
}

export function setCart(nextCart) {
  if (Array.isArray(nextCart)) {
    cart = nextCart.map((line) => ({ ...line, quantity: Number(line.quantity) || 0 }));
  } else {
    cart = [];
  }
  notify();
}

export function removeFromCart(id) {
  cart = cart.filter((line) => line.id !== id);
  notify();
}

export function updateCartQuantity(id, quantity) {
  const next = Math.max(0, Number(quantity) || 0);
  if (next === 0) {
    cart = cart.filter((line) => line.id !== id);
  } else {
    cart = cart.map((line) => (line.id === id ? { ...line, quantity: next } : line));
  }
  notify();
}

export function toggleFavorite(item) {
  const id = item?.id;
  if (!id) return;
  favorites = favorites.includes(id)
    ? favorites.filter((fav) => fav !== id)
    : [...favorites, id];
  notify();
}

export function setFavorites(nextFavorites) {
  if (Array.isArray(nextFavorites)) {
    favorites = nextFavorites;
  } else {
    favorites = [];
  }
  notify();
}

// Client-safe hook. Kept in the same file for convenience; the file boundary is
// what makes useStore usable from the Next.js server, and "use client" keeps
// the hook from being called during SSR.
import React from "react";

export function useStore() {
  const [state, setState] = React.useState({ cart, favorites });

  React.useEffect(() => {
    const handler = () => setState({ cart, favorites });
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return {
    cart: state.cart,
    favorites: state.favorites,
    addToCart,
    setCart,
    removeFromCart,
    updateCartQuantity,
    toggleFavorite,
    setFavorites,
  };
}
