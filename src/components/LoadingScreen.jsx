"use client";

import React, { useEffect, useState } from "react";
import { GiQueenCrown } from "react-icons/gi";

const MIN_VISIBLE_MS = 1200;
const FADE_MS = 500;
const MAX_VISIBLE_MS = 4000;
const BOOTED_KEY = "qf:booted";

/**
 * First-paint brand splash. Shows the QueenFizzie mark while the theme and
 * stored bag hydrate, then fades out. Never blocks for more than 4 seconds.
 */
const LoadingScreen = () => {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let alreadyBooted = false;
    try {
      alreadyBooted = window.sessionStorage.getItem(BOOTED_KEY) === "1";
    } catch (error) {
      alreadyBooted = false;
    }

    if (alreadyBooted) {
      setHidden(true);
      return undefined;
    }

    const startedAt = Date.now();
    let dismissTimer = 0;
    let fadeTimer = 0;

    const dismiss = () => {
      setFading(true);
      try {
        window.sessionStorage.setItem(BOOTED_KEY, "1");
        document.documentElement.dataset.booted = "1";
      } catch (error) {
        /* storage may be unavailable */
      }
      fadeTimer = window.setTimeout(() => setHidden(true), FADE_MS);
    };

    const schedule = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      dismissTimer = window.setTimeout(dismiss, wait);
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    const safety = window.setTimeout(dismiss, MAX_VISIBLE_MS);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(dismissTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(safety);
      window.removeEventListener("load", schedule);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`qf-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 overflow-hidden bg-canvas transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="aurora -left-16 top-10 h-64 w-64 bg-accent/30" />
      <div className="aurora -right-16 bottom-10 h-72 w-72 bg-violet/25" />
      <div className="dot-grid absolute inset-0 opacity-40" />

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <span className="flex h-20 w-20 animate-float items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
          <GiQueenCrown size={34} />
        </span>

        <div>
          <p className="font-display text-3xl leading-none text-ink">
            Queen<span className="gradient-text">Fizzie</span>
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
            Naija beauty, delivered
          </p>
        </div>

        <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-accent via-violet to-accent bg-[length:200%_100%]" />
        </div>

        <p className="sr-only">Loading QueenFizzie</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
