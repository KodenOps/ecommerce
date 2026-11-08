"use client";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = React.createContext(
  {
    user: null,
    loading: true,
    unreadCount: 0,
    refresh: async () => {},
    setUnreadCount: () => {},
    signOut: async () => {},
  }
);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(!initialUser);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return null;
      }
      const payload = await response.json();
      setUser(payload.user ?? null);
      setUnreadCount(payload.unreadNotifications ?? 0);
      return payload.user ?? null;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    setUser(null);
    setUnreadCount(0);
    window.location.href = "/";
  }, []);

  const value = useMemo(
    () => ({ user, loading, unreadCount, refresh, setUnreadCount, signOut }),
    [user, loading, unreadCount, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
