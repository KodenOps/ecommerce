"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getProductById, products } from "@/data/products";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_OVER,
  deliveryFeeFor,
} from "@/lib/pricing";

const KEYS = {
  cart: "qf:cart",
  favorites: "qf:favorites",
  orders: "qf:orders",
};

export const ORDER_STATUS = {
  pending: "Confirming Payment",
  confirmed: "Payment Confirmed",
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
    /* ignore storage failures */
  }
}

const EMPTY_STORE = {
  ready: false,
  cart: [],
  cartItems: [],
  cartCount: 0,
  subtotal: 0,
  savings: 0,
  delivery: 0,
  total: 0,
  favorites: [],
  favoriteItems: [],
  orders: [],
  toast: null,
  addToCart: () => {},
  removeFromCart: () => {},
  setQuantity: () => {},
  clearCart: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  createOrder: async () => null,
  syncOrderStatuses: async () => {},
};

const StoreContext = createContext(EMPTY_STORE);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const ordersRef = useRef([]);

  useEffect(() => {
    setCart(readStorage(KEYS.cart, []));
    setFavorites(readStorage(KEYS.favorites, []));
    setOrders(readStorage(KEYS.orders, []));
    setReady(true);
  }, []);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    if (ready) writeStorage(KEYS.cart, cart);
  }, [cart, ready]);

  useEffect(() => {
    if (ready) writeStorage(KEYS.favorites, favorites);
  }, [favorites, ready]);

  useEffect(() => {
    if (ready) writeStorage(KEYS.orders, orders);
  }, [orders, ready]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message) => setToast({ message, id: Date.now() }), []);

  const addToCart = useCallback(
    (productId, quantity = 1) => {
      const product = getProductById(Number(productId));
      if (!product) return;
      setCart((current) => {
        const existing = current.find((line) => line.id === product.id);
        if (existing) {
          return current.map((line) =>
            line.id === product.id ? { ...line, qty: line.qty + quantity } : line
          );
        }
        return [...current, { id: product.id, qty: quantity }];
      });
      notify(`${product.title} added to your bag`);
    },
    [notify]
  );

  const removeFromCart = useCallback((productId) => {
    setCart((current) => current.filter((line) => line.id !== productId));
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setCart((current) => {
      if (quantity <= 0) return current.filter((line) => line.id !== productId);
      return current.map((line) =>
        line.id === productId ? { ...line, qty: Math.min(quantity, 20) } : line
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (productId) => {
      const product = getProductById(Number(productId));
      setFavorites((current) => {
        if (current.includes(productId)) {
          notify(`${product?.title ?? "Product"} removed from favorites`);
          return current.filter((id) => id !== productId);
        }
        notify(`${product?.title ?? "Product"} saved for later`);
        return [...current, productId];
      });
    },
    [notify]
  );

  const isFavorite = useCallback(
    (productId) => favorites.includes(Number(productId)),
    [favorites]
  );

  const createOrder = useCallback(
    async (details = {}) => {
      if (!cart.length) return null;
      if (!details.receipt?.dataUrl) {
        throw new Error("Please upload your payment receipt before completing the order.");
      }

      const lines = cart
        .map((line) => {
          const product = getProductById(line.id);
          return product ? { ...product, qty: line.qty } : null;
        })
        .filter(Boolean);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: details.customer ?? {},
          items: cart.map((line) => ({ id: line.id, qty: line.qty })),
          receipt: {
            dataUrl: details.receipt.dataUrl,
            name: details.receipt.name,
            type: details.receipt.type,
            size: details.receipt.size,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "We could not submit your order. Please try again.");
      }

      const created = payload.order;
      const order = {
        id: created.id,
        placedAt: created.createdAt,
        status: created.status,
        items: lines.map((line) => ({
          id: line.id,
          title: line.title,
          price: line.price,
          qty: line.qty,
          image: line.image,
        })),
        subtotal: created.subtotal,
        delivery: created.delivery,
        total: created.total,
        customer: created.customer,
        payment: "Bank transfer",
        receiptName: created.receipt?.name ?? details.receipt.name,
      };

      setOrders((current) => [order, ...current]);
      setCart([]);
      return order;
    },
    [cart]
  );

  const syncOrderStatuses = useCallback(async () => {
    const list = ordersRef.current;
    if (!list.length) return;
    const ids = list.map((order) => order.id).join(",");
    try {
      const response = await fetch(`/api/orders/status?ids=${encodeURIComponent(ids)}`);
      if (!response.ok) return;
      const payload = await response.json();
      const statuses = new Map(
        (payload.orders || []).map((order) => [order.id, order.status])
      );
      if (
        list.some(
          (order) => statuses.has(order.id) && statuses.get(order.id) !== order.status
        )
      ) {
        setOrders((current) =>
          current.map((order) =>
            statuses.has(order.id) && statuses.get(order.id) !== order.status
              ? { ...order, status: statuses.get(order.id) }
              : order
          )
        );
      }
    } catch (error) {
      /* offline or API unavailable — keep the local status */
    }
  }, []);

  const cartItems = useMemo(
    () =>
      cart
        .map((line) => {
          const product = getProductById(line.id);
          return product ? { ...product, qty: line.qty } : null;
        })
        .filter(Boolean),
    [cart]
  );

  const favoriteItems = useMemo(
    () => favorites.map((id) => getProductById(id)).filter(Boolean),
    [favorites]
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
      cart,
      cartItems,
      cartCount,
      subtotal,
      savings,
      delivery,
      total: subtotal + delivery,
      favorites,
      favoriteItems,
      orders,
      toast,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      createOrder,
      syncOrderStatuses,
      catalog: products,
    }),
    [
      ready,
      cart,
      cartItems,
      cartCount,
      subtotal,
      savings,
      delivery,
      favorites,
      favoriteItems,
      orders,
      toast,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      createOrder,
      syncOrderStatuses,
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
