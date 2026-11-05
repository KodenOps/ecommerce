import React from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function Navbar() {
  return (
    <div className="border-b border-[var(--line)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3 flex items-center justify-between text-sm">
        <Link href="/" className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors flex items-center gap-1.5">
          <span className="text-[var(--muted)]">←</span>
          Back
        </Link>
        <div className="flex items-center gap-4 text-[var(--muted)]">
          <span className="hidden sm:inline text-xs uppercase tracking-wide">Curated beauty essentials</span>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-soft)] transition-colors text-xs font-medium"
          >
            View collection
            <FiChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
