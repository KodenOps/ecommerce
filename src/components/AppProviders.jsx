"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { StoreProvider } from "@/store/store";
import LoadingScreen from "./LoadingScreen";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        {children}
        <LoadingScreen />
      </StoreProvider>
    </ThemeProvider>
  );
}
