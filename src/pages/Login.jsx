"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiLock, FiLogOut, FiMail } from "react-icons/fi";
import Layout from "@/components/Layout";
import AuthCard from "@/components/AuthCard";
import AuthNotice from "@/components/AuthNotice";
import { useAuth } from "@/components/AuthProvider";

const Login = () => {
  const router = useRouter();
  const { user, loading, configured, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const requested = typeof router.query.next === "string" ? router.query.next : "/";
      const next = requested.startsWith("/") ? requested : "/";
      router.push(next);
    } catch (signInError) {
      setError(signInError.message || "We could not sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setError("");
    try {
      await signOut();
    } catch (signOutError) {
      setError(signOutError.message || "We could not sign you out.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto w-full max-w-md py-16 text-center text-sm text-muted">
          Checking your session…
        </div>
      </Layout>
    );
  }

  if (user) {
    return (
      <Layout>
        <AuthCard
          eyebrow="Account"
          title="You're signed in"
          description="Your QueenFizzie account is ready."
          footer={
            <Link href="/Shop" className="font-semibold text-accent hover:opacity-70">
              Continue shopping
            </Link>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <FiCheckCircle size={17} />
              </span>
              <div className="min-w-0">
                <p className="label">Signed in as</p>
                <p className="truncate text-sm font-semibold text-ink">{user.email}</p>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <FiAlertCircle size={13} /> {error}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/Orders" className="btn-primary flex-1 text-xs">
                View orders <FiArrowRight size={13} />
              </Link>
              <button type="button" onClick={handleSignOut} className="btn-secondary flex-1 text-xs">
                <FiLogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        </AuthCard>
      </Layout>
    );
  }

  return (
    <Layout>
      <AuthCard
        eyebrow="Welcome back"
        title="Sign in to QueenFizzie"
        description="Track your orders, save your favorites, and check out faster."
        footer={
          <>
            New here?{" "}
            <Link href="/Signup" className="font-semibold text-accent hover:opacity-70">
              Create an account
            </Link>
          </>
        }
      >
        <AuthNotice configured={configured} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="login-email" className="label">
              Email
            </label>
            <div className="relative mt-1.5">
              <FiMail
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field pl-10"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <Link
                href="/ForgotPassword"
                className="text-[11px] font-semibold text-accent hover:opacity-70"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <FiLock
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field pl-10"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
              <FiAlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <button type="submit" disabled={submitting || !configured} className="btn-primary mt-1">
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <FiArrowRight size={14} />}
          </button>
        </form>
      </AuthCard>
    </Layout>
  );
};

export default Login;
