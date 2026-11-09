"use client";

import React, { useEffect, useState } from "react";
import { FiMessageSquare, FiRefreshCw, FiX } from "react-icons/fi";
import AdminShell from "@/components/AdminShell";
import { adminPageProps } from "@/lib/routeGuards";

export async function getServerSideProps(ctx) {
  return adminPageProps(ctx);
}

export default function AdminBroadcastLogs() {
  const [lastRun, setLastRun] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch("/api/admin/broadcast-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Push log", body: "Non-empty log body so the admin page can inspect the fan-out path.", href: "/Admin/BroadcastLogs" }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState((current) => ({
          ...current,
          loading: false,
          error: payload.error || "Could not load the push log.",
        }));
        return;
      }
      setLastRun(payload);
    } catch (failure) {
      setState((current) => ({
        ...current,
        loading: false,
        error: "Could not load the push log. Check your connection.",
      }));
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell
      eyebrow="Tools"
      title="Broadcast logs"
      description="Inspect the last push fan-out attempt: which endpoints were reached, which failed, and exactly why."
      actions={
        <button
          type="button"
          onClick={load}
          className="btn-secondary"
          disabled={state.loading}
        >
          <FiRefreshCw
            size={14}
            className={state.loading ? "animate-spin" : ""}
          />
          Reload
        </button>
      }
    >
      {state.error && (
        <p className="rounded-2xl border border-accent/40 bg-accent-soft/60 px-4 py-3 text-xs font-medium text-accent">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <p className="label">Last broadcast</p>
          </div>

          {state.loading && (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">
              Loading the last fan-out attempt…
            </p>
          )}

          {!state.loading && !lastRun && (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">
              No broadcast has run yet.
            </p>
          )}

          {!state.loading && lastRun && (
            <div className="px-4 py-3 space-y-2 text-xs text-ink-soft">
              <div>
                <p className="text-ink">Sent to</p>
                <p className="mt-1 font-mono">{lastRun.sent || 0} customer(s)</p>
              </div>
              <div>
                <p className="text-ink">With push opt-in</p>
                <p className="mt-1 font-mono">{lastRun.pushOptIn || 0}</p>
              </div>
              <div>
                <p className="text-ink">Fan-out errors</p>
                <p className="mt-1 font-mono">{lastRun.fanoutErrors || 0}</p>
              </div>
              <div>
                <p className="text-ink">Log entries</p>
                <p className="mt-1 font-mono">
                  {lastRun.pushMeta?.length ?? 0}
                </p>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-auto p-4">
            {!state.loading && lastRun && lastRun.pushMeta?.length > 0 && (
              <table className="w-full text-[11px]">
                <thead className="border-b border-line text-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">State</th>
                    <th className="px-4 py-2 text-left">Endpoint</th>
                    <th className="px-4 py-2 text-left">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRun.pushMeta.map((entry, index) => (
                    <tr key={index} className="border-b border-line">
                      <td className="px-4 py-2">
                        {entry.endpoint ? (
                          <span className="inline-flex h-5 items-center rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                            ok
                          </span>
                        ) : (
                          <span className="inline-flex h-5 items-center rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                            removed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-[10px] break-all">
                        {entry.endpoint ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-ink-soft">
                        {entry.pushError ? (
                          <span className="inline-block max-w-[24rem] break-all rounded bg-accent-soft/60 px-2 py-0.5 text-accent">
                            {entry.pushError}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <div className="card p-4">
          <p className="label">What to look for</p>
          <div className="mt-4 flex flex-col gap-3 text-xs text-ink-soft">
            <div>
              <p className="text-ink">No push configured</p>
              <p>
                The log entry count is 0. That usually means
                WEBPUSH_VAPID_PUBLIC_KEY_BASE64URL,
                WEBPUSH_VAPID_PRIVATE_KEY_BASE64URL and
                WEBPUSH_VAPID_EMAIL are not set on the deploy.
              </p>
            </div>
            <div>
              <p className="text-ink">Endpoint removed</p>
              <p>
                The endpoint was deleted because it was unreachable or expired. If
                this is the only entry, the subscription is not valid anymore.
              </p>
            </div>
            <div>
              <p className="text-ink">Push failed</p>
              <p>
                The endpoint was reached but the push request failed. The exact
                error is shown in the table.
              </p>
            </div>
            <div>
              <p className="text-ink">Replay</p>
              <p>
                This page sends one test broadcast each time it loads, so the last
                log reflects the current state of the push stack.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
