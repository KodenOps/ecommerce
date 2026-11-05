"use client";

import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";

/**
 * Segmented light/dark switch.
 * Sun is active in light mode, moon is active in dark mode.
 * `compact` renders just a single round button for tight headers.
 */
const ThemeToggle = ({ compact = false, className = "" }) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Light mode" : "Dark mode"}
        className={`btn-icon ${className}`}
      >
        {isDark ? <FiSun size={17} /> : <FiMoon size={17} />}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        aria-label="Light theme"
        title="Light mode"
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
          !isDark
            ? "bg-accent text-accent-ink shadow-glow"
            : "text-muted hover:text-ink"
        }`}
      >
        <FiSun size={15} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        aria-label="Dark theme"
        title="Dark mode"
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
          isDark
            ? "bg-accent text-accent-ink shadow-glow"
            : "text-muted hover:text-ink"
        }`}
      >
        <FiMoon size={15} />
      </button>
    </div>
  );
};

export default ThemeToggle;
