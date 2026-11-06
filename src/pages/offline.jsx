import React from "react";
import Head from "next/head";
import Link from "next/link";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";

export default function Offline() {
  return (
    <>
      <Head>
        <title>You are offline · QueenFizzie</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-bg px-5 py-16">
        <div className="card w-full max-w-md p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <FiWifiOff size={22} />
          </span>
          <h1 className="mt-4 font-display text-2xl text-ink">You are offline</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            The shelf needs a connection. Your bag is saved on this device — reconnect and pick up
            exactly where you left off.
          </p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-5 w-full">
            <FiRefreshCw size={14} /> Try again
          </button>
          <Link href="/" className="btn-ghost mt-2 w-full text-xs">
            Back to the home page
          </Link>
        </div>
      </main>
    </>
  );
}
