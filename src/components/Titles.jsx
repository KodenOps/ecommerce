import React from "react";

/**
 * Section heading used across the storefront.
 * Keeps the editorial rhythm consistent in both themes.
 */
const Titles = ({ eyebrow, title, subtext, align = "left", action = null }) => {
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div className={`flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between`}>
      <div className={`flex max-w-2xl flex-col gap-2 ${alignment}`}>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl lg:text-[2.1rem]">
          {title}
        </h2>
        {subtext && (
          <p className="text-sm leading-relaxed text-ink-soft sm:text-[15px]">{subtext}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default Titles;
