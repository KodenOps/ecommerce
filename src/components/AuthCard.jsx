import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";

const AuthCard = ({ eyebrow, title, description, children, footer }) => {
  return (
    <div className="mx-auto w-full max-w-md">
      <Link href="/" className="btn-ghost mb-5 px-0 text-xs">
        <FiArrowLeft size={13} /> Back to the shop
      </Link>

      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="aurora -right-10 -top-12 h-40 w-40 bg-accent/25" />

        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
            <GiQueenCrown size={22} />
          </span>

          {eyebrow && <p className="eyebrow mt-5">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-2xl leading-tight text-ink">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>
          )}

          <div className="mt-6">{children}</div>
        </div>
      </div>

      {footer && <div className="mt-4 text-center text-xs text-muted">{footer}</div>}
    </div>
  );
};

export default AuthCard;
