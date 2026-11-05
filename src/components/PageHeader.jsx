import React from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

const PageHeader = ({ eyebrow, title, description, crumbs = [], actions = null }) => {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-line bg-gradient-to-br from-accent-soft via-surface to-violet-soft px-6 py-10 sm:px-9 sm:py-12">
      <div className="aurora -right-16 -top-14 h-56 w-56 bg-accent/30" />
      <div className="aurora -bottom-20 left-1/3 h-48 w-48 bg-violet/25" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-[11px] text-muted">
              {crumbs.map((crumb, index) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  {index > 0 && <FiChevronRight size={11} />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition-colors hover:text-accent">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink-soft">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {eyebrow && (
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.6rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-[15px]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </section>
  );
};

export default PageHeader;
