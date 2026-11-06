"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiAlertCircle, FiArrowRight, FiLock, FiMail, FiShield } from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";
import { adminLoginProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return adminLoginProps(ctx);
}

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    router.query.error === "forbidden" ? "That account is not an administrator." : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const next = typeof router.query.next === "string" ? router.query.next : "/Admin/Dashboard";

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "We could not sign you in.");
        return;
      }
      window.location.href = next;
    } catch (failure) {
      setError("We could not sign you in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
              <GiQueenCrown size={24} />
            </span>
            <h1 className="mt-4 font-display text-2xl text-ink">QueenFizzie Admin</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Sign in with an administrator account.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative mt-1.5">
                <FiMail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="field pl-10"
                  placeholder="admin@queenfizzie.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative mt-1.5">
                <FiLock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="field pl-10"
                  placeholder="Your password"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent-soft/60 px-3 py-2 text-xs font-medium text-accent">
                <FiAlertCircle size={13} /> {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-1">
              {submitting ? "Signing in…" : "Sign in to admin"}
              <FiArrowRight size={15} />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-surface-2/60 p-3 text-[11px] leading-relaxed text-ink-soft">
            <FiShield className="mt-0.5 shrink-0 text-accent" size={13} />
            <span>
              Admin access is granted only to accounts whose profile role is{" "}
              <code className="rounded bg-surface px-1">ADMIN</code>.
            </span>
          </div>

          <Link href="/" className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted hover:text-accent">
            Back to the store
          </Link>
        </div>
      </div>
    </div>
  );
}
