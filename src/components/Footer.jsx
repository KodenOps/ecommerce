import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGithub,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-[#2b1a2e] text-[#fffafa] overflow-hidden">
      {/* playful blobs */}
      <div className="blob-1 hidden lg:block opacity-80" />
      <div className="blob-2 hidden lg:block opacity-70" />

      {/* top playful line */}
      <div className="h-[10px] bg-gradient-to-r from-rose-400 via-amber-200 to-purple-300" />

      <div className="px-[50px] lg:px-[100px] py-[60px] flex flex-col lg:flex-row items-center lg:items-start gap-[50px]">
        {/* brand */}
        <div className="w-full lg:w-[28%] flex flex-col gap-[16px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-400 flex items-center justify-center text-white text-sm">
              ✨
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-[#fffafa]">Bloom</div>
              <div className="text-[10px] font-medium tracking-[0.25em] uppercase text-rose-300">& Glow</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/80 max-w-sm">
            Little luxuries for your daily ritual — luminous skincare, radiant moods, and	scents that feel like a warm hug. Welcome to your glow hour.
          </p>
          <div className="flex items-center gap-[28px] mt-2">
            <a href="#" className="text-white/70 hover:text-rose-300 transition-colors text-xl">
              <FaFacebook />
            </a>
            <a href="#" className="text-white/70 hover:text-rose-300 transition-colors text-xl">
              <FaTwitter />
            </a>
            <a href="#" className="text-white/70 hover:text-rose-300 transition-colors text-xl">
              <FaInstagram />
            </a>
            <a href="#" className="text-white/70 hover:text-rose-300 transition-colors text-xl">
              <FaGithub />
            </a>
            <a href="#" className="text-white/70 hover:text-rose-300 transition-colors text-xl">
              <FaHeart />
            </a>
          </div>
        </div>

        {/* shop now */}
        <div className="w-full lg:w-[16%] flex flex-col gap-[18px]">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-rose-300">
            Shop Rituals
          </p>
          <ul className="flex flex-col gap-[12px] text-white/80 text-sm">
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Skincare</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Mists &amp; Toners</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Lip Blushes</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Body Glow</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Scented Candles</li>
          </ul>
        </div>

        {/* quick links */}
        <div className="w-full lg:w-[16%] flex flex-col gap-[18px]">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-rose-300">
            Quick Links
          </p>
          <ul className="flex flex-col gap-[12px] text-white/80 text-sm">
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Home</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Our Story</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Categories</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Explore</li>
            <li className="cursor-pointer hover:text-rose-200 transition-colors">Cart</li>
          </ul>
        </div>

        {/* newsletter */}
        <div className="w-full lg:w-[32%] flex flex-col gap-[16px]">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-rose-300">
            Join the Glow Club
          </p>
          <p className="text-sm text-white/70">
            Get playful beauty tips and secret drops in your inbox.
          </p>
          <form className="flex flex-col gap-[10px]" action="">
            <input
              type="email"
              placeholder="your@email.com"
              className="px-4 py-3 rounded-full bg-white/15 border border-white/20 text-white placeholder:text-white/50 outline-none text-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-full bg-gradient-to-r from-rose-400 to-purple-400 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow sparkly-btn">
              Glow Me Up
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-white/60 text-xs pb-[30px] pt-6 border-t border-white/10">
        &copy; 2024 Bloom &amp; Glow — made for your daily sparkle ✨
      </div>
    </footer>
  );
};

export default Footer;
