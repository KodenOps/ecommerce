"use client";

import React from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import TopProduct from "@/components/sections/TopProduct";
import Promosection from "@/components/sections/Promosection";

/*
  Bloom & Glow — home
  Hero → Shop by ritual → Bestsellers → Flash glow sale
*/
export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:gap-6">
        <Hero />
        <Categories />
        <TopProduct />
        <Promosection />
      </div>
    </Layout>
  );
}
