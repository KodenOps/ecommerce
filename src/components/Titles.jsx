import React from "react";

const Titles = ({ title, subtext, align = "center", decoration = false }) => {
  return (
    <div className={`w-full text-${align}`}>
      <div className="flex items-end justify-center lg:justify-start gap-3 mb-2">
        {decoration && (
          <span className="text-3xl animate-bounce">🌸</span>
        )}
        <h3 className="text-3xl lg:text-4xl font-bold text-[#2b1a2e] bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
          {title}
        </h3>
        {decoration && (
          <span className="text-3xl animate-bounce">✨</span>
        )}
      </div>
      <p className={`text-base lg:text-lg mt-2 text-[#2b1a2e]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed`}>
        {subtext}
      </p>
    </div>
  );
};

export default Titles;
