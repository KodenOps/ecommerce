"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiMail } from "react-icons/fi";
import Layout from "@/components/Layout";
import AuthCard from "@/components/AuthCard";
import AuthNotice from "@/components/AuthNotice";
import { useAuth } from "@/components/AuthProvider";

const ForgotPassword = () => {
  const { configured, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (resetError) {
      setError(resetError.message || "We could not send the reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Layout>
        <AuthCard
          eyebrow="Check your inbox"
          title="Reset link sent"
          description="If an account exists for that email, a password reset link is on its way. It expires after a short while."
          footer={
            <Link href="/Login" className="font-semibold text-accent hover:opacity-70">
              Back to sign in
            </Link>
          }
        >
          <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft/50 px-4 py-3">
            <FiCheckCircle size={16} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs leading-relaxed text-ink-soft">
              Still nothing after a few minutes? Look in spam, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-semibold text-accent hover:opacity-70"
              >
                try another email
              </button>
              .
            </p>
          </div>
        </AuthCard>
      </Layout>
    );
  }

  return (
    <Layout>
      <AuthCard
        eyebrow="Password help"
        title="Forgot your password?"
        description="Enter your account email and we'll send you a link to choose a new one."
        footer={
          <Link href="/Login" className="font-semibold text-accent hover:opacity-70">
            Back to sign in
          </Link>
        }
      >
        <AuthNotice configured={configured} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="reset-email" className="label">
              Email
            </label>
            <div className="relative mt-1.5">
              <FiMail
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="reset-email"
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

          {error && (
            <p className="flex items-start gap-1.5 rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
              <FiAlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <button type="submit" disabled={submitting || !configured} className="btn-primary mt-1">
            {submitting ? "Sending…" : "Send reset link"}
            {!submitting && <FiArrowRight size={14} />}
          </button>
        </form>
      </AuthCard>
    </Layout>
  );
};

export default ForgotPassword;
