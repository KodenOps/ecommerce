"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { FiZap } from "react-icons/fi";
import Link from "next/link";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
  "https://images.unsplash.com/photo-1596489397631-4b6691d132cf?w=1200&q=80",
];

const Hero = () => {
  const [src, setSrc] = useState(() => HERO_IMAGES[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        setSrc(HERO_IMAGES[next]);
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const go = (i) => {
    setSrc(HERO_IMAGES[i]);
    setIndex(i);
  };

  const slideRef = React.useRef(0);

  useEffect(() => {
    slideRef.current = index;
  }, [index]);

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden">
      {/* Navbar sits at top so hero scrolls naturally under a persistent bar */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 top-3">
        <Navbar />
      </div>

      {/* playful background blobs */}
      <div className="blob-1 opacity-60" />
      <div className="blob-2 opacity-50" />
      <div className="blob-3 opacity-70" />

      <div className="relative h-[90vh] min-h-[600px] md:h-[88vh] flex items-center">
        {/* hero image panel */}
        <div className="absolute inset-0 z-0">
          <Image
            src={src}
            alt="Bloom & Glow lifestyle"
            fill
            className="object-cover opacity-90 scale-105 transition-transform duration-700 ease-out"
            priority={index === 0}
            sizes="100vw"
          />
          {/* soft gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b1a2e]/70 via-transparent to-transparent" />
        </div>

        {/* main content */}
        <div className="relative z-10 mx-4 md:mx-12 lg:mx-20 max-w-5xl w-full pt-24 md:pt-28">
          <div className="max-w-2xl">
            {/* small playful tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium tracking-wide mb-6 border border-white/20">
              <FiZap size={14} className="text-amber-200" />
              Your daily dose of glow
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight drop-shadow-lg">
              Beauty that
              <br />
              <span className="bg-gradient-to-r from-rose-200 via-amber-200 to-purple-200 bg-clip-text text-transparent">
                sparkles
              </span>
              <br />
              from within
            </h1>

            <p className="mt-6 text-white/85 text-lg md:text-xl max-w-lg leading-relaxed drop-shadow-sm">
              Luminous skincare, scented rituals, and little luxuries that make every
              morning feel like a fresh start. Your glow hour begins here.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/#topProd" className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold shadow-xl glow-accent sparkly-btn transition-all hover:scale-[1.03] active:scale-95 block">
                Shop the Glow
              </Link>
              <Link href="/#categories" className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 font-semibold transition-all hover:bg-white/30 active:scale-95 block">
                See Rituals
              </Link>
            </div>

            {/* playful live-style dots */}
            <div className="mt-8 flex items-center gap-3 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Fresh drops daily
              </span>
              <span className="hidden sm:inline text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-300" />
                Cruelty-free
              </span>
              <span className="hidden sm:inline text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-300" />
                Clean beauty
              </span>
            </div>
          </div>

          {/* visual card peek */}
          <div className="absolute right-8 bottom-16 z-10 hidden md:block">
            <div className="bg-white/15 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-2xl max-w-[260px]">
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"
                alt="glow serum"
                width={260}
                height={160}
                className="rounded-2xl shadow-md w-full h-40 object-cover"
              />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Glow Drops Serum</p>
                  <p className="text-rose-200 text-sm">★ 4.9 (1.2k glows)</p>
                </div>
                <span className="text-white font-bold text-lg">$38</span>
              </div>
            </div>
          </div>
        </div>

        {/* slideshow dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { go(i); } }
              className={`w-3 h-3 rounded-full border-2 transition-all ${i === slideRef.current ? "bg-white border-white w-8" : "bg-white/40 border-white/40 hover:bg-white/70"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* floating sparkles decoration */}
        <div className="absolute top-20 right-12 text-5xl text-amber-200/40 select-none z-10 animate-pulse">
          ✨
        </div>
      </div>
    </section>
  );
};

export default Hero;
