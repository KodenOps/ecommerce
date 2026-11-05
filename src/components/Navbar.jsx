"use client";
import React, { useState } from "react";
import { GiDaisy } from "react-icons/gi";
import { BsBagHeart, BsHeart, BsPerson, BsX } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [sideBarIsOn, setsideBarIsOn] = useState(false);

  return (
    <div className="mainNav relative overflow-hidden">
      {/* top playful stripe */}
      <div className="h-[14px] bg-gradient-to-r from-rose-400 via-amber-200 to-purple-300" />

      <nav className="fixed top-[14px] left-0 right-0 z-50 px-5 lg:px-[60px] py-3 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        {/* playful logo */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white text-lg shadow-md">
            ✨
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight text-[#2b1a2e]">Bloom</span>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-rose-500 -mt-0.5">& Glow</span>
          </div>
        </div>

        {/* desktop nav */}
        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#2b1a2e]">
          <li className="active">
            <Link href="/#home">Home</Link>
          </li>
          <li className="flex items-center gap-1.5 group cursor-pointer">
            <GiDaisy className="text-rose-400 group-hover:scale-110 transition-transform" size={18} />
            <span className="group-hover:text-rose-500 transition-colors">Rituals</span>
          </li>
          <li className="flex items-center gap-1.5 group cursor-pointer">
            <GiDaisy className="text-purple-400 group-hover:scale-110 transition-transform" size={18} />
            <span className="group-hover:text-purple-500 transition-colors">Top Picks</span>
          </li>
          <li className="flex items-center gap-1.5 group cursor-pointer">
            <GiDaisy className="text-purple-400 group-hover:scale-110 transition-transform" size={18} />
            <span className="group-hover:text-purple-500 transition-colors">Categories</span>
          </li>
          <li className="cursor-pointer">Explore</li>
        </ul>

        {/* right icons */}
        <div className="hidden lg:flex items-center gap-7 text-[#2b1a2e]">
          <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
            <BsBagHeart size={22} className="group-hover:animate-bounce" />
            <span className="text-sm tabular-nums">0</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <BsHeart size={22} />
            <span className="text-sm tabular-nums">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BsPerson size={22} />
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white">
            <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="avatar" width={32} height={32} className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        {/* mobile hamburger */}
        <button
          className="flex items-center justify-center lg:hidden w-10 h-10 rounded-full bg-rose-50 text-rose-500"
          onClick={() => setsideBarIsOn(!sideBarIsOn)}
          aria-label="Open menu">
          <BsBagHeart size={22} />
        </button>
      </nav>

      {/* side navigation */}
      {sideBarIsOn ? (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="sidenav_bg absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setsideBarIsOn(!sideBarIsOn)}
          />
          <nav className="absolute top-[14px] right-4 z-50 bg-white rounded-3xl shadow-2xl border border-white/60 w-[82%] max-w-[320px] overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white text-xs">
                  ✨
                </div>
                <span className="font-bold text-[#2b1a2e]">Bloom &amp; Glow</span>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"
                onClick={() => setsideBarIsOn(!sideBarIsOn)}
                aria-label="Close menu">
                <BsX size={16} />
              </button>
            </div>

            <ul className="p-5 flex flex-col gap-4 text-base font-medium text-[#2b1a2e]">
              <li
                className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-rose-50 cursor-pointer"
                onClick={() => setsideBarIsOn(!sideBarIsOn)}>
                <GiDaisy className="text-xl text-rose-500" />
                <Link href="/#home">Home</Link>
              </li>
              <li className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-rose-50 cursor-pointer">
                <GiDaisy className="text-xl text-rose-500" />
                Rituals
              </li>
              <li
                className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-rose-50 cursor-pointer"
                onClick={() => setsideBarIsOn(!sideBarIsOn)}>
                <GiDaisy className="text-xl text-rose-500" />
                <Link href="/#topProd">Top Picks</Link>
              </li>
              <li className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-rose-50 cursor-pointer">
                <GiDaisy className="text-xl text-rose-500" />
                Categories
              </li>
              <li className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-rose-50 cursor-pointer">
                <span className="text-xl">🔍</span>
                Explore
              </li>
            </ul>

            <div className="border-t border-rose-100 p-5 flex items-center justify-around bg-rose-50/60">
              <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <BsBagHeart size={20} />
                <span className="text-sm">0</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <BsHeart size={20} />
                <span className="text-sm">0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BsPerson size={20} />
              </div>
            </div>
          </nav>
        </div>
      ) : (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setsideBarIsOn(!sideBarIsOn)}></div>
      )}
    </div>
  );
};

export default Navbar;
