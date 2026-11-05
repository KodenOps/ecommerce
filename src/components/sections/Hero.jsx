"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiShield, FiStar, FiZap } from "react-icons/fi";
import { GiDaisy } from "react-icons/gi";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
    caption: "Cloud Dew Serum",
  },
  {
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
    caption: "Petal & Pear Set",
  },
  {
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=80",
    caption: "Moonlight Rose Mist",
  },
];

const STATS = [
  { label: "Avg. rating", value: "4.9" },
  { label: "Happy glows", value: "12k+" },
  { label: "Clean formulas", value: "100%" },
];

const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative overflow-hidden rounded-4xl border border-line bg-gradient-to-br from-accent-soft/80 via-surface to-violet-soft/70">
      <div className="aurora -left-20 top-0 h-72 w-72 bg-accent/30" />
      <div className="aurora -bottom-24 right-10 h-80 w-80 bg-violet/25" />
      <div className="dot-grid absolute inset-0 opacity-40" />

      <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        <div className="animate-rise">
          <span className="stat-pill border-accent/30 bg-surface/70 text-accent">
            <FiZap size={13} />
            Your daily dose of glow
          </span>

          <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] text-ink sm:text-6xl lg:text-[4.1rem]">
            Beauty that
            <br />
            <span className="gradient-text italic">glows</span> from within
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Luminous skincare, scented rituals, and small luxuries that turn an
            ordinary morning into something you look forward to.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/Shop" className="btn-primary">
              Shop the glow
              <FiArrowRight size={15} />
            </Link>
            <Link href="#rituals" className="btn-secondary">
              Browse rituals
            </Link>
          </div>

          <dl className="mt-9 grid max-w-md grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-line bg-surface/70 px-3 py-3 backdrop-blur"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-xl text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lift">
            {SLIDES.map((slide, slideIndex) => (
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.caption}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                priority={slideIndex === 0}
                className={`object-cover transition-opacity duration-[900ms] ease-out ${
                  slideIndex === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />

            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-line/60 bg-surface/85 px-4 py-3 backdrop-blur-md">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Featured ritual
                </p>
                <p className="truncate font-display text-sm text-ink">{SLIDES[index].caption}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
                <FiStar size={11} fill="currentColor" /> 4.9
              </div>
            </div>
          </div>

          <div className="absolute -left-3 top-6 hidden animate-float rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-card backdrop-blur sm:block">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <FiShield className="text-accent" size={14} />
              Cruelty-free
            </div>
            <p className="mt-0.5 text-[10px] text-muted">Always, no exceptions</p>
          </div>

          <div className="absolute -right-3 top-20 hidden items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet p-3 text-accent-ink shadow-glow sm:flex">
            <GiDaisy size={22} />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {SLIDES.map((slide, slideIndex) => (
              <button
                key={slide.image}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Show ${slide.caption}`}
                aria-current={slideIndex === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  slideIndex === index
                    ? "w-8 bg-accent"
                    : "w-3 bg-line-strong hover:bg-accent/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
