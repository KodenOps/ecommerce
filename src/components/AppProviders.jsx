"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import AuthProvider from "./AuthProvider";
import PwaRegister from "./PwaRegister";
import LoadingScreen from "./LoadingScreen";
import { StoreProvider } from "@/store/store";

export default function AppProviders({ children, initialUser = null }) {
  return (
    <ThemeProvider>
      <AuthProvider initialUser={initialUser}>
        <StoreProvider>
          {children}
          <PwaRegister />
          <LoadingScreen />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
