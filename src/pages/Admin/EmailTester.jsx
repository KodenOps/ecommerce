"use client";

import React, { useState } from "react";
import { FiSend, FiShield } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function isEmail(value) {
  return EMAIL_RE.test(String(value ?? "").trim());
}

function isNonEmpty(value) {
  return String(value ?? "").trim().length > 0;
}

function isFormFilled(form) {
  return isEmail(form.to) && isNonEmpty(form.subject) && isNonEmpty(form.body);
}

function formatFormError(form) {
  const missing = [];
  if (!isEmail(form.to)) missing.push("a valid recipient email");
  if (!isNonEmpty(form.subject)) missing.push("a subject");
  if (!isNonEmpty(form.body)) missing.push("a message body");
  if (missing.length === 0) return "Fill in the recipient, subject and body.";
  if (missing.length === 1) return `Add ${missing[0]}.`;
  if (missing.length === 2) return `Add ${missing[0]} and ${missing[1]}.`;
  return `Add ${missing[0]}, ${missing[1]}, and ${missing[2]}.`;
}

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

export default function AdminEmailTester() {
  const [state, setState] = useState({ loading: false, error: "", ok: "" });
  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const send = async (event) => {
    event.preventDefault();

    if (!isFormFilled(form)) {
      setState((current) => ({
        ...current,
        loading: false,
        error: formatFormError(form),
        ok: "",
      }));
      return;
    }

    setState((current) => ({ ...current, loading: true, error: "", ok: "" }));
    try {
      const response = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({
          ...current,
          loading: false,
          error:
            payload.error || "Could not send that test email.",
          ok: "",
        }));
        return;
      }
      setState((current) => ({
        ...current,
        loading: false,
        ok: payload.ok || "Test email sent.",
        error: "",
      }));
      setForm({ to: "", subject: "", body: "" });
    } catch (failure) {
      setState((current) => ({
        ...current,
        loading: false,
        error: "Could not send that test email. Check your connection.",
        ok: "",
      }));
    }
  };

  return (
    <AdminShell
      eyebrow="Tools"
      title="Email tester"
      description="Send a test email through the same SMTP transport the store uses for order confirmations."
      actions={
        <span className="text-[11px] text-muted">
          <FiShield size={11} className="inline mr-1 align-middle" />
          Admin only
        </span>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <p className="label">Test email</p>
            <p className="mt-1 text-sm text-ink-soft">
              This hits the live SMTP server. It does not place an order and it does
              not send anything to customers. Use it to verify your mail settings
              before going live.
            </p>
          </div>

          {state.error && (
            <p className="rounded-2xl border border-accent/30 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
              {state.error}
            </p>
          )}

          {state.ok && (
            <p className="rounded-2xl border border-accent/30 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
              {state.ok}
            </p>
          )}

          <form onSubmit={send} className="flex flex-col gap-4 p-4">
            <div>
              <label htmlFor="email-to" className="label">
                To
              </label>
              <input
                id="email-to"
                type="email"
                required
                value={form.to}
                onChange={update("to")}
                className="field mt-1.5"
                placeholder="you@example.com"
                aria-label="Recipient email address"
              />
            </div>

            <div>
              <label htmlFor="email-subject" className="label">
                Subject
              </label>
              <input
                id="email-subject"
                type="text"
                required
                value={form.subject}
                onChange={update("subject")}
                className="field mt-1.5"
                placeholder="New order test"
                aria-label="Email subject line"
              />
            </div>

            <div>
              <label htmlFor="email-body" className="label">
                Body
              </label>
              <textarea
                id="email-body"
                required
                rows={10}
                value={form.body}
                onChange={update("body")}
                className="field resize-y mt-1.5"
                placeholder="Type the message you want to send."
                aria-label="Email body"
              />
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="btn-primary justify-center text-sm"
            >
              <FiSend size={14} />
              {state.loading ? "Sending…" : "Send test email"}
            </button>
          </form>
        </section>

        <div className="card p-4">
          <p className="label">Details</p>
          <div className="mt-4 flex flex-col gap-3 text-xs text-ink-soft">
            <div>
              <p className="text-ink">Endpoint</p>
              <p className="mt-1 font-mono text-[11px]">/api/admin/email-test</p>
            </div>
            <div>
              <p className="text-ink">Required</p>
              <p>SMTP_HOST, SMTP_USER, SMTP_PASS</p>
            </div>
            <div>
              <p className="text-ink">Optional</p>
              <p>SMTP_PORT, SMTP_SECURE, SMTP_FROM, ADMIN_ORDER_EMAIL</p>
            </div>
            <div>
              <p className="text-ink">Notes</p>
              <p className="mt-1 leading-relaxed">
                The test body renders as HTML. If you want the customer-facing tone,
                paste the same HTML the order email builds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
