"use client";

import React, { useEffect, useState } from "react";
import { FiDownload, FiWifiOff, FiX } from "react-icons/fi";

/**
 * Registers the service worker and shows a small "offline" / "install" hint.
 * The app shell is cached by /sw.js so the storefront opens without a network.
 */
export default function PwaRegister() {
  const [offline, setOffline] = useState(false);
  const [pathname, setPathname] = useState("/");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  useEffect(() => {
    setPathname(window.location.pathname || "/");
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem("qf:install-dismissed") === "1");
    } catch (error) {
      setDismissed(true);
    }

    const onPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    setInstallPrompt(null);
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem("qf:install-dismissed", "1");
    } catch (error) {
      /* ignore */
    }
  };

  const onAdmin = pathname.startsWith("/Admin");

  return (
    <>
      {offline && (
        <div className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-ink px-4 py-1.5 text-[11px] font-medium text-canvas">
          <FiWifiOff size={12} /> You&apos;re offline — browsing the saved shelf
        </div>
      )}

      {installPrompt && !dismissed && !onAdmin && (
        <div className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lift sm:left-1/2 sm:-translate-x-1/2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <FiDownload size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">Install QueenFizzie</p>
            <p className="text-[11px] text-ink-soft">Shop faster from your home screen.</p>
          </div>
          <button type="button" onClick={install} className="btn-primary px-3 py-2 text-[11px]">
            Install
          </button>
          <button type="button" onClick={dismiss} className="text-muted hover:text-ink" aria-label="Dismiss">
            <FiX size={14} />
          </button>
        </div>
      )}
    </>
  );
}
