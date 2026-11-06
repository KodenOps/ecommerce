"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "qf:theme";

const ThemeContext = createContext({
  theme: "light",
  resolvedTheme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  ready: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial = "light";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        initial = "dark";
      }
    } catch (error) {
      initial = "light";
    }
    setThemeState(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* storage may be unavailable — theme still applies for this session */
    }
  }, [theme, ready]);

  const setTheme = useCallback((next) => {
    setThemeState(next === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme: theme, toggleTheme, setTheme, ready }),
    [theme, toggleTheme, setTheme, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
