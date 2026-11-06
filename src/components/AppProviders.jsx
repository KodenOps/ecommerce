"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { StoreProvider } from "@/store/store";
import LoadingScreen from "./LoadingScreen";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          {children}
          <LoadingScreen />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
