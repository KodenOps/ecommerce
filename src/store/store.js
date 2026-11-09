/**
 * Cart store — signed-in/out bag, favourites, pricing.
 *
 * Variant contract (request from user):
 *  - picked variant (size, flavour, etc.) is persisted under each cart line
 *  - the bag page shows the chosen variant next to the product name
 *  - the chosen variant is transmitted into the placed order and shown on
 *    Checkout confirmation, /Orders, and /Admin/Orders
 *  - admin product editor can add any kind of option (size, flavour, etc.)
 *    with label / value / price / stock, and custom key/value pairs
 *  - the add-to-bag modal and product preview picker render all options
 *
 * Product options are normalized through `src/lib/productMapper.js` into the
 * `product.sizes` array the storefront consumes. The admin editor now exposes
 * arbitrary option rows, each with `value`, `label`, `price`, `stock`, plus
 * optional extra attribute columns kept as `meta` so admins can attach things
 * like `flavour = mint, amount = 4000`.
 */

"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
    (productId, quantity = 1, variant = null) => {
      const product = getProduct(productId);
      if (!product) {
        notify("That product is still loading — try again in a moment.");
        return;
      }

      const variantKey = variant?.value ? String(variant.value) : "default";
      const unitPrice = Number(variant?.price ?? product.price ?? 0);
      const availableStock = Number(variant?.stock ?? product.stock ?? 0);
      const meta = Array.isArray(variant?.meta)
        ? variant.meta
            .filter(
              (entry) =>
                entry && typeof entry === "object" &&
                String(entry.key ?? "").trim() && String(entry.value ?? "").trim()
            )
            .map((entry) => ({ key: String(entry.key).trim(), value: String(entry.value).trim() }))
        : [];
      // The option's own name ("Red") plus the group's title ("Colour") read as
      // "Colour: Red" everywhere the line is shown: bag, checkout, order, email.
      const groupTitle = String(product.variantTitle || "").trim();
      const variantLabel = String(variant?.label || "").trim();
      const pickedVariant = variant
        ? {
            value: variant.value,
            label:
              groupTitle && variantLabel && !variant.synthetic
                ? `${groupTitle}: ${variantLabel}`
                : variantLabel,
            meta,
          }
        : null;

      if (availableStock <= 0) {
        notify(`${product.title} is sold out.`);
        return;
      }

      setCart((current) => {
        const key = `${String(product.id)}:${variantKey}`;
        const existing = current.find((line) => line.key === key);
        const nextQty = Math.min(availableStock, existing ? existing.qty + quantity : quantity);

        if (existing) {
          if (nextQty === existing.qty) {
            notify(`Only ${availableStock} of ${product.title}${variant?.label ? ` (${variant.label})` : ""} left.`);
            return current;
          }
          return current.map((line) =>
            line.key === key ? { ...line, qty: nextQty, price: unitPrice, variant: pickedVariant } : line
          );
        }

        return [
          ...current,
          {
            id: product.id,
            key,
            qty: nextQty,
            price: unitPrice,
            oldprice: product.oldprice ?? null,
            variant: pickedVariant,
          },
        ];
      });
      notify(`${product.title}${variant?.label ? ` (${variant.label})` : ""} added to your bag`);
    },
    [getProduct, notify]
  );

  const removeFromCart = useCallback((productId, variant = null) => {
    setCart((current) => {
      const key = variant ? `${String(productId)}:${String(variant.value || "default")}` : null;
      return current.filter((line) => {
        const sameProduct = String(line.id) === String(productId);
        if (key) return line.key !== key;
        return !sameProduct;
      });
    });
  }, []);

  const setQuantity = useCallback((productId, quantity, variant = null) => {
    setCart((current) => {
      const key = variant ? `${String(productId)}:${String(variant.value || "default")}` : null;

      if (quantity <= 0) {
        return current.filter((line) => (key ? line.key !== key : String(line.id) !== String(productId)));
      }

      const product = catalog.find((item) => String(item.id) === String(productId));
      const variantStock = variant?.stock ?? product?.stock ?? 20;
      const cap = product?.stock ? Math.min(20, variantStock) : 20;

      return current.map((line) => {
        const matchesTarget = key ? line.key === key : String(line.id) === String(productId);
        return matchesTarget ? { ...line, qty: Math.min(quantity, cap), variant: line.variant } : line;
      });
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
          items: cart.map((line) => {
            const product = catalog.find((item) => String(item.id) === String(line.id));
            const variantByValue =
              product?.sizes?.find((size) => String(size.value) === String(line.variant?.value)) || null;
            const variantLabel =
              line.variant?.label ?? variantByValue?.label ?? null;
            const variantValue =
              line.variant?.value ?? variantByValue?.value ?? null;
            const variantMeta = Array.isArray(line.variant?.meta)
              ? line.variant.meta
              : Array.isArray(variantByValue?.meta)
                ? variantByValue.meta
                : [];
            return {
              productId: line.id,
              qty: line.qty,
              variantValue: variantValue ?? null,
              variantLabel: variantLabel ?? null,
              variantMeta,
              title: product?.title || "",
              sku: product?.sku || "",
              price: line.price,
              image: product?.image || "",
            };
          }),
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
    [cart, catalog, refreshCatalog]
  );

  const cartItems = useMemo(
    () =>
      cart
        .map((line) => {
          const product = catalog.find((item) => String(item.id) === String(line.id));
          if (!product) return null;

          const selectedVariant =
            Array.isArray(product.sizes) && product.sizes.length > 0
              ? product.sizes.find((size) => String(size.value) === String(line.variant?.value)) || product.sizes[0]
              : null;

          const unitPrice = Number(line.price ?? selectedVariant?.price ?? product.price ?? 0);
          const unitOldPrice = Number(line.oldprice ?? selectedVariant?.oldprice ?? product.oldprice ?? 0) || null;

          const option = line.variant || (selectedVariant ? { value: selectedVariant.value, label: selectedVariant.label, meta: selectedVariant.meta } : null);
          const pickedLabel = option?.label ?? selectedVariant?.label ?? null;
          const pickedAttributes = Array.isArray(option?.meta)
            ? option.meta
                .filter(
                  (meta) =>
                    typeof meta === "object" && String(meta.key).trim() && String(meta.value).trim()
                )
                .map((meta) => `${String(meta.key).trim()} = ${String(meta.value).trim()}`)
                .join(", ")
            : Array.isArray(selectedVariant?.meta)
              ? selectedVariant.meta
                  .filter(
                    (meta) =>
                      typeof meta === "object" && String(meta.key).trim() && String(meta.value).trim()
                  )
                  .map((meta) => `${String(meta.key).trim()} = ${String(meta.value).trim()}`)
                  .join(", ")
              : null;
          const selectedVariantDetail =
            pickedLabel
              ? `${product.title}: ${pickedLabel}${pickedAttributes ? ` (${pickedAttributes})` : ""}`
              : product.title;

          return {
            ...product,
            key: line.key || `${String(product.id)}:default`,
            qty: line.qty,
            price: unitPrice,
            oldprice: unitOldPrice,
            variant: option ? { value: option.value, label: option.label, meta: option.meta } : null,
            selectedVariantLabel: pickedLabel,
            selectedVariantValue: option?.value ?? selectedVariant?.value ?? null,
            selectedVariantDetail,
          };
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
