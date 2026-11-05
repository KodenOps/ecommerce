"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Titles from "@/components/Titles";
import { useStore } from "@/store/store";

const CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80",
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&q=80",
];

const INDEX_CARDS = [
  {
    title: "Bestsellers",
    subtitle: "The pieces our clients keep returning to.",
    href: "/shop?sort=best",
    image: CATEGORY_IMAGES[0],
  },
  {
    title: "Recent arrivals",
    subtitle: "New shapes, slower fashion, better materials.",
    href: "/shop?sort=latest",
    image: CATEGORY_IMAGES[1],
  },
  {
    title: "Gift guide",
    subtitle: "Curated sets for the people you collect.",
    href: "/shop?category=Gifts+%26+Sets",
    image: CATEGORY_IMAGES[2],
  },
];

const HERO_CONTENT = [
  {
    title: "Classic is a quiet kind of radical.",
    subtitle: "We build a small, considered collection of daywear, eveningwear, and pieces that move with you.",
    cta: "Shop the collection",
    href: "/shop",
    image: CATEGORY_IMAGES[0],
  },
  {
    title: "Slow fashion, made to last.",
    subtitle: "Fine fabrics, quiet construction, and details you can feel.",
    cta: "Explore new arrivals",
    href: "/shop?sort=latest",
    image: CATEGORY_IMAGES[1],
  },
  {
    title: "Pieces that become your own.",
    subtitle: "Thoughtful tailoring for the moments you actually live in.",
    cta: "Find your fit",
    href: "/shop?sort=latest",
    image: CATEGORY_IMAGES[2],
  },
];

const Categories = () => {
  const { cartCount } = useStore();
  return (
    <section className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
        <Titles title="Shop by Ritual" subtext="We think of every piece as a quiet ritual for a particular season of your life — dress, comfort, work, or celebration." />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-8">
          {INDEX_CARDS.map((card) => (
            <Link key={card.href} href={card.href} className="group block">
              <div className="relative overflow-hidden rounded-xl bg-[var(--paper-2)] shadow-card aspect-[3/2]">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)] to-transparent" />
                <div className="absolute inset-0 p-4 flex items-end justify-between">
                  <div className="text-white max-w-xs">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{card.title}</p>
                    <h3 className="text-xl font-serif font-semibold leading-snug">{card.subtitle}</h3>
                  </div>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Featured = () => {
  const { cartCount, favorites } = useStore();
  return (
    <section className="bg-[var(--paper-2)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="relative">
            <div className="overflow-hidden rounded-xl shadow-card aspect-[4/3]">
              <Image
                src={HERO_CONTENT[0].image}
                alt="Editorial hero"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-[var(--paper)] border border-[var(--line)] shadow-elevated" />
          </div>

          <div className="lg:max-w-xl">
            <h3 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-[var(--ink)]">
              {HERO_CONTENT[0].title}
            </h3>
            <p className="mt-4 lede text-[var(--ink-soft)]">{HERO_CONTENT[0].subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href={HERO_CONTENT[0].href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--ink)] text-white font-medium shadow-card hover:bg-[var(--ink-soft)] transition-colors"
              >
                {HERO_CONTENT[0].cta}
              </Link>
              <Link
                href="/shop?category=Gifts+%26+Sets"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
              >
                Explore gifts
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5">Women&apos;s tailoring</span>
              <span className="inline-flex items-center gap-1.5">Eveningwear</span>
              <span className="inline-flex items-center gap-1.5">Knits</span>
              <span className="inline-flex items-center gap-1.5">Denim &amp; separates</span>
              <span className="inline-flex items-center gap-1.5">Materials</span>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-[var(--ink-soft)]">
              <button className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 hover:bg-[var(--paper-2)] transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  {cartCount} in cart
                </span>
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 hover:bg-[var(--paper-2)] transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  {favorites.length} saved
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = () => {
  const [index, setIndex] = React.useState(0);
  const current = HERO_CONTENT[index];

  React.useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % HERO_CONTENT.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[var(--paper)]">
      <div className="absolute inset-0">
        <Image
          src={current.image}
          alt=""
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#16140f]/70 via-[var(--paper)]/10 to-[var(--paper)]/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-14 lg:pt-20 pb-16 lg:pb-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            {current.title.split(" ").join(" ").toLowerCase()}
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight text-white">
            {current.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/85 max-w-lg leading-relaxed">
            {current.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href={current.href}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-[var(--ink)] font-semibold shadow-hero hover:bg-[var(--paper-2)] transition-colors"
            >
              {current.cta}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Cast away
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-5 text-xs text-white/60">
            {["Quiet fabrics", "Slow fashion", "Understated luxury"].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-2">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <Featured />
    </main>
  );
}
