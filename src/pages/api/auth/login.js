import {
  allowMethods,
  dbError,
  readString,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { createServerSupabase, getSessionProfile, toPublicUser } from "@/lib/supabase/server";
import { isEmail, normalizeEmail } from "@/lib/validation";

// Small in-memory throttle; serverless instances each keep their own bucket.
const attempts = new Map();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.startedAt > WINDOW_MS) {
    attempts.set(key, { count: 1, startedAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password ?? "");

  if (!isEmail(email) || !password) {
    return sendJson(res, 400, { error: "Enter your email and password." });
  }

  const key = `${req.headers?.["x-forwarded-for"] || "local"}:${email}`;
  if (tooManyAttempts(key)) {
    return sendJson(res, 429, {
      error: "Too many sign-in attempts. Please wait a few minutes and try again.",
    });
  }

  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    const message = String(error?.message || "");
    if (/email not confirmed/i.test(message)) {
      return sendJson(res, 403, {
        error: "Confirm your email address first — check your inbox for the link.",
      });
    }
    if (/invalid login credentials/i.test(message)) {
      return sendJson(res, 401, { error: "Incorrect email or password." });
    }
    return dbError(res, error, "We could not sign you in. Please try again.");
  }

  const { profile } = await getSessionProfile(supabase);
  if (!profile) {
    return sendJson(res, 500, {
      error: "Your customer profile is missing. Ask an administrator to check your account.",
    });
  }

  attempts.delete(key);
  return sendJson(res, 200, { user: toPublicUser(supabase, profile) });
}
