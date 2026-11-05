"use client";
import React, { useState } from "react";
import Hero from "../pages/Hero";
import Categories from "../pages/Categories";
import TopProduct from "../pages/TopProduct";
import Promosection from "../pages/Promosection";
import ProductPreview from "../pages/ProductPreview";
import Footer from "@/components/Footer";

/*
  Bloom & Glow — beauty care storefront
  Flow: Hero → Shop by Ritual → Bestsellers → Flash Glow Sale → (ProductPreview is separate page)
*/
export default function Home() {
  const [previewItem, setpreviewItem] = useState([1, 2, 3]);

  return (
    <main className="relative">
      {/* Note: Hero re-renders Navbar for the hero panel so the hero panel reads as a standalone scene. */}
      <Hero />
      <Categories />
      <TopProduct />
      <Promosection />
      <Footer />
    </main>
  );
}
