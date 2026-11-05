"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProductById, products } from "@/data/products";

const KEYS = {
  cart: "bloom:cart",
  favorites: "bloom:favorites",
  orders: "bloom:orders",
};

const DELIVERY_FEE = 6.5;
const FREE_DELIVERY_OVER = 75;

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
  placeOrder: () => null,
};

const StoreContext = createContext(EMPTY_STORE);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setCart(readStorage(KEYS.cart, []));
    setFavorites(readStorage(KEYS.favorites, []));
    setOrders(readStorage(KEYS.orders, []));
    setReady(true);
  }, []);

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
      notify(`${product.title} added to your glow bag`);
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
          notify(`${product?.title ?? "Ritual"} removed from saved`);
          return current.filter((id) => id !== productId);
        }
        notify(`${product?.title ?? "Ritual"} saved for later`);
        return [...current, productId];
      });
    },
    [notify]
  );

  const isFavorite = useCallback(
    (productId) => favorites.includes(Number(productId)),
    [favorites]
  );

  const placeOrder = useCallback(
    (details = {}) => {
      if (!cart.length) return null;
      const lines = cart
        .map((line) => {
          const product = getProductById(line.id);
          return product ? { ...product, qty: line.qty } : null;
        })
        .filter(Boolean);

      const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
      const order = {
        id: `BG-${Date.now().toString().slice(-6)}`,
        placedAt: new Date().toISOString(),
        status: "Processing",
        items: lines.map((line) => ({
          id: line.id,
          title: line.title,
          price: line.price,
          qty: line.qty,
          image: line.image,
        })),
        subtotal,
        delivery: subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE,
        total: subtotal + (subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE),
        customer: details.customer ?? null,
        payment: details.payment ?? "card",
      };

      setOrders((current) => [order, ...current]);
      setCart([]);
      return order;
    },
    [cart]
  );

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

  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;

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
      placeOrder,
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
      placeOrder,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

export const FREE_DELIVERY_THRESHOLD = FREE_DELIVERY_OVER;

export default StoreProvider;
