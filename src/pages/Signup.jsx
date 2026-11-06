"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiLock, FiMail } from "react-icons/fi";
import Layout from "@/components/Layout";
import AuthCard from "@/components/AuthCard";
import AuthNotice from "@/components/AuthNotice";
import { useAuth } from "@/components/AuthProvider";

const MIN_PASSWORD = 8;

const Signup = () => {
  const router = useRouter();
  const { configured, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }

    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await signUp(email.trim(), password);
      if (data?.session) {
        router.push("/");
      } else {
        setSent(true);
      }
    } catch (signUpError) {
      setError(signUpError.message || "We could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Layout>
        <AuthCard
          eyebrow="Almost there"
          title="Confirm your email"
          description="We've sent a confirmation link to your inbox. Tap it to activate your QueenFizzie account."
          footer={
            <Link href="/Login" className="font-semibold text-accent hover:opacity-70">
              Back to sign in
            </Link>
          }
        >
          <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft/50 px-4 py-3">
            <FiCheckCircle size={16} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs leading-relaxed text-ink-soft">
              Didn&apos;t get it? Check spam, or try creating the account again in a few
              minutes.
            </p>
          </div>
        </AuthCard>
      </Layout>
    );
  }

  return (
    <Layout>
      <AuthCard
        eyebrow="Join the house"
        title="Create your account"
        description="Save favorites, follow your orders, and check out faster."
        footer={
          <>
            Already have an account?{" "}
            <Link href="/Login" className="font-semibold text-accent hover:opacity-70">
              Sign in
            </Link>
          </>
        }
      >
        <AuthNotice configured={configured} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="signup-email" className="label">
              Email
            </label>
            <div className="relative mt-1.5">
              <FiMail
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="signup-email"
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
            <label htmlFor="signup-password" className="label">
              Password
            </label>
            <div className="relative mt-1.5">
              <FiLock
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="signup-password"
                type="password"
                required
                minLength={MIN_PASSWORD}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field pl-10"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-confirm" className="label">
              Confirm password
            </label>
            <div className="relative mt-1.5">
              <FiLock
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="signup-confirm"
                type="password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="field pl-10"
                placeholder="Type it again"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
              <FiAlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <button type="submit" disabled={submitting || !configured} className="btn-primary mt-1">
            {submitting ? "Creating account…" : "Create account"}
            {!submitting && <FiArrowRight size={14} />}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-muted">
            By creating an account you agree to our{" "}
            <Link href="/Terms" className="font-semibold text-accent hover:opacity-70">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/Privacy" className="font-semibold text-accent hover:opacity-70">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </AuthCard>
    </Layout>
  );
};

export default Signup;
