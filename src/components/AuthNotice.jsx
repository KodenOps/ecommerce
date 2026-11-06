import React from "react";
import { FiAlertCircle } from "react-icons/fi";

const AuthNotice = ({ configured }) => {
  if (configured) return null;

  return (
    <div className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
        <FiAlertCircle size={13} className="text-gold" /> Authentication is not connected yet
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
        Add <code className="rounded bg-surface-2 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-surface-2 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
        <code className="rounded bg-surface-2 px-1 py-0.5">.env.local</code>, then restart the app.
        More setup notes are in <code className="rounded bg-surface-2 px-1 py-0.5">.env.example</code>.
      </p>
    </div>
  );
};

export default AuthNotice;
