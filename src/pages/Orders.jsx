"use client";
import React from "react";
import Titles from "@/components/Titles";
import { FiShoppingBag, FiClock, FiTag, FiUser } from "react-icons/fi";

const SAMPLE_ORDERS = [
  {
    id: "#10042",
    email: "lea.kim@example.com",
    status: "Shipped, expecting 3rd Nov",
    items: ["Cloud Dew Hydrating Serum", "Moonlight Rose Body Mist"],
    amounts: [32, 28],
    total: 60,
    date: "3rd Nov 2026",
  },
  {
    id: "#10031",
    email: "lea.kim@example.com",
    status: "Delivered",
    items: ["Petal Silk Cleansing Balm"],
    amounts: [36],
    total: 36,
    date: "1st Nov 2026",
  },
  {
    id: "#10018",
    email: "lea.kim@example.com",
    status: "Processing",
    items: ["Gilded Body Glow Oil"],
    amounts: [42],
    total: 42,
    date: "28th Oct 2026",
  },
];

const StatusBadge = ({ status }) => {
  if (status.includes("Shipped")) {
    return <span className="text-xs font-medium text-[var(--accent)]">Shipped, expecting 3rd Nov</span>;
  }
  if (status.includes("Delivered")) {
    return <span className="text-xs font-medium text-[var(--muted)]">Delivered</span>;
  }
  return <span className="text-xs font-medium text-[var(--ink)]">Processing</span>;
};

const Orders = () => {
  return (
    <div className="bg-[var(--paper)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <div className="max-w-2xl">
          <Titles title="Orders" subtext="A record of your purchases, deliveries, and anything you would like to revisit." />
        </div>

        <div className="mt-8 space-y-5">
          {SAMPLE_ORDERS.map((order) => (
            <div key={order.id} className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[var(--paper-2)] flex items-center justify-center text-[var(--accent)]">
                    <FiShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{order.id}</p>
                    <p className="text-sm text-[var(--muted)]">{order.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1"><FiUser size={12} /> Account</span>
                      <span className="inline-flex items-center gap-1"><FiClock size={12} /> Received {order.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-[var(--accent)]">€{(order.total).toFixed(0)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full bg-[var(--paper-2)] text-sm text-[var(--ink-soft)]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
