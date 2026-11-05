"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { StoreProvider } from "@/store/store";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
