import {
  createServerSupabase,
  getSessionProfile,
  toPublicUser,
} from "./supabase/server";

export function noStore(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

export function sendJson(res, status, payload) {
  noStore(res);
  return res.status(status).json(payload);
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { error: "Method not allowed" });
  return false;
}

export function sameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers?.host;
  } catch (error) {
    return false;
  }
}

const MESSAGES = {
  AUTH_REQUIRED: [401, "Please sign in to continue."],
  FORBIDDEN: [403, "This area is for administrators only."],
  EMPTY_CART: [400, "Your bag is empty."],
  INCOMPLETE_DELIVERY: [400, "Name, phone, address, city and state are needed."],
  RECEIPT_REQUIRED: [400, "Please upload your payment receipt."],
  PRODUCT_NOT_FOUND: [409, "A product in your bag is no longer available."],
  PROMO_INVALID: [400, "That promo code is not valid."],
  PROMO_EXPIRED: [400, "That promo code has expired."],
  PROMO_EXHAUSTED: [400, "That promo code has been fully redeemed."],
  PROMO_MINIMUM: [400, "Your bag has not reached the minimum spend for that code."],
  ORDER_NOT_FOUND: [404, "Order not found."],
};

/** Turns a PostgREST/Postgres error into a safe, human message. */
export function dbError(res, error, fallback = "Something went wrong. Please try again.") {
  const raw = String(error?.message || "");
  const code = error?.code;

  if (code === "23505" || /duplicate key/i.test(raw)) {
    return sendJson(res, 409, { error: "That record already exists." });
  }
  if (code === "23514" || code === "P0001") {
    for (const [prefix, [status, message]] of Object.entries(MESSAGES)) {
      if (raw.startsWith(prefix)) return sendJson(res, status, { error: message });
    }
    if (raw.startsWith("OUT_OF_STOCK")) {
      const detail = raw.split(":").slice(1).join(":").trim();
      return sendJson(res, 409, { error: detail || "One of your items just sold out." });
    }
    if (raw.startsWith("PRODUCT_UNAVAILABLE")) {
      const detail = raw.split(":").slice(1).join(":").trim();
      return sendJson(res, 409, { error: detail || "One of your items is no longer available." });
    }
    if (raw.startsWith("INVALID_TRANSITION")) {
      const detail = raw.split(":").slice(1).join(":").trim();
      return sendJson(res, 409, { error: detail || "That status change is not allowed." });
    }
    if (raw === "ROLE_IMMUTABLE") {
      return sendJson(res, 403, { error: "Role changes are handled by the store owner." });
    }
    if (code === "23514") {
      return sendJson(res, 400, { error: "Some of those details are not valid." });
    }
  }
  if (code === "42501" || /row-level security|permission denied/i.test(raw)) {
    return sendJson(res, 403, { error: "You do not have permission to do that." });
  }
  if (/JWT|token/i.test(raw) && /expired|invalid/i.test(raw)) {
    return sendJson(res, 401, { error: "Your session expired. Please sign in again." });
  }
  // A missing column or SQL function means the database is behind the code.
  // "Please try again" would never work, so say the shop is unavailable.
  if (code === "42703" || code === "42883" || code === "PGRST202") {
    console.error(
      "[api] the database is missing a column or function — re-run supabase/schema.sql",
      error
    );
    return sendJson(res, 503, {
      error:
        "The shop is briefly unavailable — please try that again in a few minutes, or message us on WhatsApp and we will take your order.",
    });
  }

  console.error("[api]", error);
  return sendJson(res, 500, { error: fallback });
}

/** Returns { supabase, user, profile, publicUser } or answers 401. */
export async function requireSession(req, res) {
  const supabase = createServerSupabase(req, res);
  const { user, profile } = await getSessionProfile(supabase);
  if (!user || !profile) {
    sendJson(res, 401, { error: "Please sign in to continue." });
    return null;
  }
  return { supabase, user, profile, publicUser: toPublicUser(supabase, profile) };
}

export async function requireAdminSession(req, res) {
  const session = await requireSession(req, res);
  if (!session) return null;
  if (session.profile.role !== "ADMIN") {
    sendJson(res, 403, { error: "This area is for administrators only." });
    return null;
  }
  return session;
}

export function readString(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

export function readInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}
