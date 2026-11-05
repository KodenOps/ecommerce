import React from "react";

export default function Titles({ title, subtext, align = "left", rule = false }) {
  return (
    <div className={`flex flex-col ${align === "center" ? "items-center text-center" : ""}`}>
      <h2 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-[var(--ink)]">
        {title}
      </h2>
      {subtext && (
        <p className="mt-3 lede max-w-xl mx-auto md:mx-0">
          {subtext}
        </p>
      )}
      {rule && <div className="mt-4 border-t border-[var(--line)]" />}
    </div>
  );
}
