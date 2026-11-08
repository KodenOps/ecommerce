"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiEdit3,
  FiKey,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiPhone,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { userPageProps } from "@/lib/routeGuards";
import { formatNaira } from "@/lib/money";
import { NIGERIAN_STATES } from "@/data/nigeria";
import { formatPhone } from "@/lib/validation";

export async function getServerSideProps(ctx) {
  return userPageProps(ctx, { fallback: "/Account" });
}

const TABS = [
  { id: "profile", label: "My details", icon: FiUser },
  { id: "addresses", label: "Delivery addresses", icon: FiMapPin },
  { id: "security", label: "Security", icon: FiKey },
];

const EMPTY_ADDRESS = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  isDefault: false,
};

function Alert({ tone = "error", children }) {
  if (!children) return null;
  return (
    <p
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${
        tone === "error"
          ? "border border-accent/30 bg-accent-soft/60 text-accent"
          : "border border-accent/20 bg-accent-soft/40 text-accent"
      }`}
    >
      {tone === "error" ? <FiAlertCircle size={13} /> : <FiCheckCircle size={13} />}
      {children}
    </p>
  );
}

export default function Account() {
  const router = useRouter();
  const { user, refresh, signOut } = useAuth();
  const [tab, setTab] = useState("profile");
  const [data, setData] = useState({ addresses: [], stats: { orders: 0, spent: 0 } });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    marketingOptIn: user?.marketingOptIn ?? true,
  });
  const [profileState, setProfileState] = useState({ saving: false, error: "", ok: "" });
  const [avatarState, setAvatarState] = useState({ busy: false, error: "" });
  const fileRef = useRef(null);

  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState(null);
  const [addressState, setAddressState] = useState({ saving: false, error: "", ok: "" });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passwordState, setPasswordState] = useState({ saving: false, error: "", ok: "" });

  useEffect(() => {
    if (typeof router.query.tab === "string" && TABS.some((item) => item.id === router.query.tab)) {
      setTab(router.query.tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      marketingOptIn: user.marketingOptIn,
    });
  }, [user]);

  const load = async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setData({ addresses: payload.addresses || [], stats: payload.stats || { orders: 0, spent: 0 } });
    } catch (error) {
      /* offline */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileState({ saving: true, error: "", ok: "" });
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setProfileState({ saving: false, error: payload.error || "Could not save your details." });
        return;
      }
      await refresh();
      if (payload.user?.phone && payload.user.phone !== data.phone) {
        load();
      }
      setProfileState({ saving: false, error: "", ok: "Details saved." });
    } catch (error) {
      setProfileState({ saving: false, error: "Could not save your details.", ok: "" });
    }
  };

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarState({ busy: true, error: "" });

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarState({ busy: false, error: "Use a PNG, JPG or WebP image." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarState({ busy: false, error: "That image is larger than 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: String(reader.result), name: file.name }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setAvatarState({ busy: false, error: payload.error || "Could not upload that photo." });
          return;
        }
        await refresh();
        setAvatarState({ busy: false, error: "" });
      } catch (error) {
        setAvatarState({ busy: false, error: "Could not upload that photo." });
      }
    };
    reader.onerror = () => setAvatarState({ busy: false, error: "Could not read that file." });
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    setAvatarState({ busy: true, error: "" });
    await fetch("/api/profile/avatar", { method: "DELETE" }).catch(() => {});
    await refresh();
    setAvatarState({ busy: false, error: "" });
  };

  const startEditAddress = (address) => {
    setEditingId(address.id);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
    });
    setAddressState({ saving: false, error: "", ok: "" });
  };

  const resetAddressForm = () => {
    setEditingId(null);
    setAddressForm({ ...EMPTY_ADDRESS, fullName: user?.fullName || "", phone: user?.phone || "" });
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setAddressState({ saving: true, error: "", ok: "" });
    try {
      const response = await fetch(editingId ? `/api/addresses/${editingId}` : "/api/addresses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAddressState({ saving: false, error: payload.error || "Could not save that address." });
        return;
      }
      resetAddressForm();
      setAddressState({ saving: false, error: "", ok: "Address saved." });
      load();
    } catch (error) {
      setAddressState({ saving: false, error: "Could not save that address.", ok: "" });
    }
  };

  const makeDefault = async (id) => {
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    }).catch(() => {});
    load();
  };

  const removeAddress = async (id) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" }).catch(() => {});
    if (editingId === id) resetAddressForm();
    load();
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordState({ saving: false, error: "Those new passwords do not match.", ok: "" });
      return;
    }
    setPasswordState({ saving: true, error: "", ok: "" });
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPasswordState({ saving: false, error: payload.error || "Could not update your password.", ok: "" });
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirm: "" });
      setPasswordState({ saving: false, error: "", ok: "Password updated." });
    } catch (error) {
      setPasswordState({ saving: false, error: "Could not update your password.", ok: "" });
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Your account"
          title={`Hello, ${user.firstName || "Queen"}`}
          description="Your details, delivery addresses and security — all in one quiet place."
          crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
          actions={
            <button type="button" onClick={signOut} className="btn-secondary">
              <FiLogOut size={14} /> Sign out
            </button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Orders placed", value: data.stats.orders },
            { label: "Lifetime spend", value: formatNaira(data.stats.spent) },
            { label: "Saved addresses", value: data.addresses.length },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <p className="label">{stat.label}</p>
              <p className="mt-1 font-display text-2xl text-ink">{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  router.replace({ pathname: "/Account", query: { tab: item.id } }, undefined, { shallow: true });
                }}
                className={`chip ${tab === item.id ? "chip-active" : ""}`}
                aria-pressed={tab === item.id}
              >
                <Icon size={13} /> {item.label}
              </button>
            );
          })}
        </div>

        {tab === "profile" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <form onSubmit={saveProfile} className="card p-5 sm:p-6">
              <h2 className="font-display text-xl text-ink">Personal details</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Your phone number is what our courier uses, so keep it current.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="label">First name</label>
                  <input
                    id="firstName"
                    required
                    value={profile.firstName}
                    onChange={(event) => setProfile({ ...profile, firstName: event.target.value })}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="label">Last name</label>
                  <input
                    id="lastName"
                    required
                    value={profile.lastName}
                    onChange={(event) => setProfile({ ...profile, lastName: event.target.value })}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={profile.phone}
                    onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                    className="field mt-1.5"
                    placeholder="0803 000 0000"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email (sign-in)</label>
                  <input id="email" value={user.email} readOnly className="field mt-1.5 opacity-70" />
                </div>
              </div>              <label className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2/60 p-3 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={profile.marketingOptIn}
                  onChange={(event) => setProfile({ ...profile, marketingOptIn: event.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                />

                Send me new-drop and promo notifications.
              </label>

              <label className="mt-4 flex items-start gap-2.5 rounded-2xl border border-line bg-surface-2/60 p-3 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={profile.pushOptIn}
                  onChange={(event) => setProfile({ ...profile, pushOptIn: event.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                />

                Push notifications on this device.
              </label>

              <div className="mt-4 flex flex-col gap-2">
                <Alert>{profileState.error}</Alert>
                <Alert tone="ok">{profileState.ok}</Alert>
              </div>

              <button type="submit" disabled={profileState.saving} className="btn-primary mt-4">
                <FiSave size={14} /> {profileState.saving ? "Saving…" : "Save details"}
              </button>
            </form>

            <div className="card p-5">
              <p className="label">Profile photo</p>
              <div className="mt-4 flex flex-col items-center gap-3">
                <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 text-2xl font-bold text-accent">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
                  ) : (
                    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
                  )}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadAvatar}
                  className="sr-only"
                  id="avatar"
                />
                <label htmlFor="avatar" className="btn-secondary w-full cursor-pointer">
                  <FiCamera size={14} /> {avatarState.busy ? "Uploading…" : "Change photo"}
                </label>
                {user.avatarUrl && (
                  <button type="button" onClick={removeAvatar} className="btn-ghost text-xs text-accent">
                    Remove photo
                  </button>
                )}
                <Alert>{avatarState.error}</Alert>
                <p className="text-center text-[11px] leading-relaxed text-muted">
                  PNG, JPG or WebP, up to 5MB. Stored in your Supabase avatars bucket.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "addresses" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="flex flex-col gap-3">
              {data.addresses.length === 0 && !loading && (
                <div className="card p-8 text-center">
                  <FiMapPin className="mx-auto text-muted" size={22} />
                  <p className="mt-2 font-display text-lg text-ink">No addresses yet</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Add one and checkout will fill it in for you.
                  </p>
                </div>
              )}

              {data.addresses.map((address) => (
                <article key={address.id} className="card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                        {address.label}
                        {address.isDefault && (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                        {address.fullName} · {formatPhone(address.phone)}
                        <br />
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                        <br />
                        {address.city}, {address.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => makeDefault(address.id)}
                          className="btn-ghost px-2 text-[11px]"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEditAddress(address)}
                        className="btn-icon h-8 w-8"
                        aria-label={`Edit ${address.label}`}
                      >
                        <FiEdit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAddress(address.id)}
                        className="btn-icon h-8 w-8 hover:border-accent hover:text-accent"
                        aria-label={`Delete ${address.label}`}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <form onSubmit={saveAddress} className="card p-5">
              <h2 className="font-display text-lg text-ink">
                {editingId ? "Edit address" : "Add an address"}
              </h2>

              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label htmlFor="label" className="label">Label</label>
                  <input
                    id="label"
                    value={addressForm.label}
                    onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })}
                    className="field mt-1.5"
                    placeholder="Home / Office"
                  />
                </div>
                <div>
                  <label htmlFor="fullName" className="label">Recipient</label>
                  <input
                    id="fullName"
                    required
                    value={addressForm.fullName}
                    onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="addressPhone" className="label">Phone</label>
                  <input
                    id="addressPhone"
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="line1" className="label">Street address</label>
                  <input
                    id="line1"
                    required
                    value={addressForm.line1}
                    onChange={(event) => setAddressForm({ ...addressForm, line1: event.target.value })}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="line2" className="label">Apartment / landmark (optional)</label>
                  <input
                    id="line2"
                    value={addressForm.line2}
                    onChange={(event) => setAddressForm({ ...addressForm, line2: event.target.value })}
                    className="field mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="city" className="label">City</label>
                    <input
                      id="city"
                      required
                      value={addressForm.city}
                      onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })}
                      className="field mt-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="label">State</label>
                    <select
                      id="state"
                      required
                      value={addressForm.state}
                      onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })}
                      className="field mt-1.5 cursor-pointer"
                    >
                      <option value="">Select</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(event) => setAddressForm({ ...addressForm, isDefault: event.target.checked })}
                    className="h-4 w-4 accent-[rgb(var(--accent))]"
                  />
                  Use as my default delivery address
                </label>

                <Alert>{addressState.error}</Alert>
                <Alert tone="ok">{addressState.ok}</Alert>

                <div className="flex gap-2">
                  <button type="submit" disabled={addressState.saving} className="btn-primary flex-1">
                    <FiSave size={14} /> {addressState.saving ? "Saving…" : editingId ? "Update" : "Add address"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetAddressForm} className="btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {tab === "security" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <form onSubmit={changePassword} className="card p-5 sm:p-6">
              <h2 className="font-display text-xl text-ink">Change password</h2>
              <p className="mt-1 text-sm text-ink-soft">
                You will stay signed in on this device after changing it.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <label htmlFor="currentPassword" className="label">Current password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                    className="field mt-1.5"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="label">New password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                    className="field mt-1.5"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm new password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirm}
                    onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })}
                    className="field mt-1.5"
                    autoComplete="new-password"
                  />
                </div>

                <Alert>{passwordState.error}</Alert>
                <Alert tone="ok">{passwordState.ok}</Alert>

                <button type="submit" disabled={passwordState.saving} className="btn-primary self-start">
                  <FiShield size={14} /> {passwordState.saving ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>

            <div className="card p-5">
              <p className="label">Account</p>
              <div className="mt-3 flex flex-col gap-2 text-xs text-ink-soft">
                <span className="flex items-center gap-2">
                  <FiPhone size={13} className="text-accent" /> {formatPhone(user.phone)}
                </span>
                <span className="flex items-center gap-2">
                  <FiPackage size={13} className="text-accent" /> {data.stats.orders} orders ·
                  {" "}{formatNaira(data.stats.spent)} spent
                </span>
                <span className="flex items-center gap-2">
                  <FiUser size={13} className="text-accent" /> Member since
                  {" "}{new Date(user.createdAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="divider my-4" />
              <div className="flex flex-col gap-2">
                <Link href="/Orders" className="btn-secondary text-xs">
                  View my orders
                </Link>
                <Link href="/Account?tab=addresses" className="btn-secondary text-xs">
                  Manage addresses
                </Link>
                {user.isAdmin && (
                  <Link href="/Admin/Dashboard" className="btn-primary text-xs">
                    Open admin panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
