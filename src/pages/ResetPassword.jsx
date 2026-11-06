"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiLock } from "react-icons/fi";
import Layout from "@/components/Layout";
import AuthCard from "@/components/AuthCard";
import AuthNotice from "@/components/AuthNotice";
import { useAuth } from "@/components/AuthProvider";

const MIN_PASSWORD = 8;

const ResetPassword = () => {
  const { loading, configured, session, updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
      await updatePassword(password);
      setDone(true);
      try {
        await signOut();
      } catch (signOutError) {
        /* the password is updated either way */
      }
    } catch (updateError) {
      setError(updateError.message || "We could not update your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Layout>
        <AuthCard
          eyebrow="All done"
          title="Password updated"
          description="Use your new password next time you sign in."
          footer={
            <Link href="/Shop" className="text-muted hover:text-accent">
              Continue shopping
            </Link>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft/50 px-4 py-3">
              <FiCheckCircle size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-ink-soft">
                Your QueenFizzie account is secure. Sign in with your new password to
                continue.
              </p>
            </div>
            <Link href="/Login" className="btn-primary">
              Sign in <FiArrowRight size={14} />
            </Link>
          </div>
        </AuthCard>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto w-full max-w-md py-16 text-center text-sm text-muted">
          Checking your reset link…
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <AuthCard
          eyebrow="Link expired"
          title="This reset link is not valid"
          description="Reset links can only be used once and expire quickly. Request a fresh one to continue."
        >
          <div className="flex flex-col gap-3">
            <p className="flex items-start gap-1.5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs text-ink-soft">
              <FiAlertCircle size={13} className="mt-0.5 shrink-0 text-gold" />
              If you already changed your password, simply sign in with the new one.
            </p>
            <Link href="/ForgotPassword" className="btn-primary">
              Request a new link <FiArrowRight size={14} />
            </Link>
            <Link href="/Login" className="btn-secondary">
              Back to sign in
            </Link>
          </div>
        </AuthCard>
      </Layout>
    );
  }

  return (
    <Layout>
      <AuthCard
        eyebrow="Almost done"
        title="Choose a new password"
        description={`Setting a new password for ${session.user?.email ?? "your account"}.`}
      >
        <AuthNotice configured={configured} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="new-password" className="label">
              New password
            </label>
            <div className="relative mt-1.5">
              <FiLock
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="new-password"
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
            <label htmlFor="confirm-password" className="label">
              Confirm new password
            </label>
            <div className="relative mt-1.5">
              <FiLock
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="confirm-password"
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
            {submitting ? "Updating…" : "Update password"}
            {!submitting && <FiArrowRight size={14} />}
          </button>
        </form>
      </AuthCard>
    </Layout>
  );
};

export default ResetPassword;
