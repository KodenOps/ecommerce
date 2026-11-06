"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_OVER,
  deliveryFeeFor,
} from "@/lib/pricing";

const KEYS = {
  cart: "qf:cart",
  favorites: "qf:favorites",
};

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* storage may be unavailable */
  }
}

const EMPTY_STORE = {
  ready: false,
  catalog: [],
  catalogLoading: true,
  cart: [],
  cartItems: [],
  cartCount: 0,
  subtotal: 0,
  savings: 0,
  delivery: 0,
  total: 0,
  favorites: [],
  favoriteItems: [],
  toast: null,
  getProduct: () => null,
  addToCart: () => {},
  removeFromCart: () => {},
  setQuantity: () => {},
  clearCart: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  createOrder: async () => null,
  refreshCatalog: async () => {},
  notify: () => {},
};

const StoreContext = createContext(EMPTY_STORE);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message) => setToast({ message, id: Date.now() }), []);

  const refreshCatalog = useCallback(async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setCatalog(payload.products || []);
    } catch (error) {
      /* offline: keep whatever we have */
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    setCart(readStorage(KEYS.cart, []));
    setFavorites(readStorage(KEYS.favorites, []));
    setReady(true);
    refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    if (ready) writeStorage(KEYS.cart, cart);
  }, [cart, ready]);

  useEffect(() => {
    if (ready) writeStorage(KEYS.favorites, favorites);
  }, [favorites, ready]);

  // Signed-in favourites live in Postgres; merge the local shelf once on load.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/favorites", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const serverIds = new Set(payload.ids || []);
        if (cancelled) return;

        const localOnly = readStorage(KEYS.favorites, []).filter((id) => !serverIds.has(id));
        if (localOnly.length) {
          await Promise.all(
            localOnly.map((productId) =>
              fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, action: "add" }),
              }).catch(() => {})
            )
          );
        }
        setFavorites((current) => Array.from(new Set([...(payload.ids || []), ...current])));
      } catch (error) {
        /* keep local favourites */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const getProduct = useCallback(
    (productId) => catalog.find((product) => String(product.id) === String(productId)) || null,
    [catalog]
  );

  const addToCart = useCallback(
    (productId, quantity = 1) => {
      const product = getProduct(productId);
      if (!product) {
        notify("That product is still loading — try again in a moment.");
        return;
      }
      if (product.stock <= 0) {
        notify(`${product.title} is sold out.`);
        return;
      }
      setCart((current) => {
        const existing = current.find((line) => line.id === product.id);
        const nextQty = Math.min(
          product.stock,
          existing ? existing.qty + quantity : quantity
        );
        if (existing) {
          if (nextQty === existing.qty) {
            notify(`Only ${product.stock} of ${product.title} left.`);
            return current;
          }
          return current.map((line) =>
            line.id === product.id ? { ...line, qty: nextQty } : line
          );
        }
        return [...current, { id: product.id, qty: nextQty }];
      });
      notify(`${product.title} added to your bag`);
    },
    [getProduct, notify]
  );

  const removeFromCart = useCallback((productId) => {
    setCart((current) => current.filter((line) => String(line.id) !== String(productId)));
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setCart((current) => {
      if (quantity <= 0) {
        return current.filter((line) => String(line.id) !== String(productId));
      }
      const product = catalog.find((item) => String(item.id) === String(productId));
      const cap = product?.stock ? Math.min(20, product.stock) : 20;
      return current.map((line) =>
        String(line.id) === String(productId)
          ? { ...line, qty: Math.min(quantity, cap) }
          : line
      );
    });
  }, [catalog]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (productId) => {
      const product = getProduct(productId);
      const id = String(productId);
      let saved = false;

      setFavorites((current) => {
        if (current.includes(id)) {
          notify(`${product?.title ?? "Product"} removed from favourites`);
          return current.filter((item) => item !== id);
        }
        saved = true;
        notify(`${product?.title ?? "Product"} saved for later`);
        return [...current, id];
      });

      if (user) {
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, action: saved ? "add" : "remove" }),
        }).catch(() => {});
      }
    },
    [getProduct, notify, user]
  );

  const isFavorite = useCallback(
    (productId) => favorites.includes(String(productId)),
    [favorites]
  );

  const createOrder = useCallback(
    async (details = {}) => {
      if (!cart.length) return null;
      if (!details.receipt?.dataUrl) {
        throw new Error("Please upload your payment receipt before completing the order.");
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: details.customer ?? {},
          items: cart.map((line) => ({ productId: line.id, qty: line.qty })),
          receipt: {
            dataUrl: details.receipt.dataUrl,
            name: details.receipt.name,
            type: details.receipt.type,
            size: details.receipt.size,
          },
          promoCode: details.promoCode || null,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "We could not submit your order. Please try again.");
      }

      setCart([]);
      refreshCatalog();
      return payload.order;
    },
    [cart, refreshCatalog]
  );

  const cartItems = useMemo(
    () =>
      cart
        .map((line) => {
          const product = catalog.find((item) => String(item.id) === String(line.id));
          return product ? { ...product, qty: line.qty } : null;
        })
        .filter(Boolean),
    [cart, catalog]
  );

  const favoriteItems = useMemo(
    () => favorites.map((id) => catalog.find((item) => String(item.id) === String(id))).filter(Boolean),
    [favorites, catalog]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.qty, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const savings = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          item.oldprice ? sum + (item.oldprice - item.price) * item.qty : sum,
        0
      ),
    [cartItems]
  );

  const delivery = deliveryFeeFor(subtotal);

  const value = useMemo(
    () => ({
      ready,
      catalog,
      catalogLoading,
      cart,
      cartItems,
      cartCount,
      subtotal,
      savings,
      delivery,
      total: subtotal + delivery,
      favorites,
      favoriteItems,
      toast,
      getProduct,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      createOrder,
      refreshCatalog,
      notify,
    }),
    [
      ready,
      catalog,
      catalogLoading,
      cart,
      cartItems,
      cartCount,
      subtotal,
      savings,
      delivery,
      favorites,
      favoriteItems,
      toast,
      getProduct,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      createOrder,
      refreshCatalog,
      notify,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

export const FREE_DELIVERY_THRESHOLD = FREE_DELIVERY_OVER;
export const STANDARD_DELIVERY_FEE = DELIVERY_FEE;

export default StoreProvider;
