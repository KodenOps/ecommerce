"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiAlertCircle,
  FiArrowRight,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";
import Layout from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { userPageProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return userPageProps(ctx, { onlyGuests: true, fallback: "/Account" });
}

export default function Login() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const next = typeof router.query.next === "string" ? router.query.next : "/Account";
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "We could not sign you in.");
        return;
      }
      await refresh();
      router.replace(next);
    } catch (failure) {
      setError("We could not sign you in. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 py-4">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
              <GiQueenCrown size={24} />
            </span>
            <h1 className="mt-4 font-display text-2xl text-ink">Welcome back, Queen</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Sign in to check out, follow orders and manage your delivery details.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative mt-1.5">
                <FiMail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  className="field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative mt-1.5">
                <FiLock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={update("password")}
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
              {submitting ? "Signing in…" : "Sign in"}
              <FiArrowRight size={15} />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-ink-soft">
            New to QueenFizzie?{" "}
            <Link href={`/Register?next=${encodeURIComponent(next)}`} className="font-semibold text-accent hover:opacity-70">
              Create an account
            </Link>
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 text-[11px] leading-relaxed text-ink-soft">
          <FiShield className="mt-0.5 shrink-0 text-accent" size={14} />
          <span>
            Accounts are protected by Supabase Auth. A phone number is required at
            registration so our courier can reach you.{" "}
            <Link href="/Admin/Login" className="font-semibold text-accent hover:opacity-70">
              Store owner? Admin sign-in.
            </Link>
          </span>
        </div>
      </div>
    </Layout>
  );
}
