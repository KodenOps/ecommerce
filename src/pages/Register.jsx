"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { GiQueenCrown } from "react-icons/gi";
import Layout from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { userPageProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return userPageProps(ctx, { onlyGuests: true, fallback: "/Account" });
}

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  marketingOptIn: true,
};

export default function Register() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const next = typeof router.query.next === "string" ? router.query.next : "/Account";
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (form.password !== form.confirm) {
      setError("Those passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          marketingOptIn: form.marketingOptIn,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "We could not create your account.");
        return;
      }
      if (payload.requiresConfirmation) {
        setNotice(payload.message);
        setForm(EMPTY);
        return;
      }
      await refresh();
      router.replace(next);
    } catch (failure) {
      setError("We could not create your account. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 py-2">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-accent-ink shadow-glow">
              <GiQueenCrown size={24} />
            </span>
            <h1 className="mt-4 font-display text-2xl text-ink">Join the Queens</h1>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              One account for faster checkout, order tracking and delivery addresses.
            </p>
          </div>

          {notice ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft/50 px-4 py-6 text-center">
              <FiCheckCircle className="text-accent" size={22} />
              <p className="text-sm leading-relaxed text-ink">{notice}</p>
              <Link href={`/Login?next=${encodeURIComponent(next)}`} className="btn-primary mt-1">
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="label">
                    First name
                  </label>
                  <div className="relative mt-1.5">
                    <FiUser size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="firstName"
                      required
                      value={form.firstName}
                      onChange={update("firstName")}
                      className="field pl-10"
                      placeholder="Ada"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="label">
                    Last name
                  </label>
                  <div className="relative mt-1.5">
                    <FiUser size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="lastName"
                      required
                      value={form.lastName}
                      onChange={update("lastName")}
                      className="field pl-10"
                      placeholder="Okafor"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

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
                    value={form.email}
                    onChange={update("email")}
                    className="field pl-10"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Phone number (required for delivery)
                </label>
                <div className="relative mt-1.5">
                  <FiPhone size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={update("phone")}
                    className="field pl-10"
                    placeholder="0803 000 0000"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  Nigerian mobile number. Our courier uses it to reach you.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
                      minLength={8}
                      value={form.password}
                      onChange={update("password")}
                      className="field pl-10"
                      placeholder="8+ characters"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="label">
                    Confirm password
                  </label>
                  <div className="relative mt-1.5">
                    <FiLock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      id="confirm"
                      type="password"
                      required
                      minLength={8}
                      value={form.confirm}
                      onChange={update("confirm")}
                      className="field pl-10"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <label className="mt-1 flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2/60 p-3 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.marketingOptIn}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, marketingOptIn: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                />
                Notify me about new drops, promos and order updates.
              </label>

              {error && (
                <p className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent-soft/60 px-3 py-2 text-xs font-medium text-accent">
                  <FiAlertCircle size={13} /> {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary mt-1">
                {submitting ? "Creating account…" : "Create my account"}
                <FiArrowRight size={15} />
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-xs text-ink-soft">
            Already have an account?{" "}
            <Link href={`/Login?next=${encodeURIComponent(next)}`} className="font-semibold text-accent hover:opacity-70">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
