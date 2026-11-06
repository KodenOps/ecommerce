import {
  allowMethods,
  dbError,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { createServerSupabase, getSessionProfile, toPublicUser } from "@/lib/supabase/server";
import { isEmail, normalizeEmail } from "@/lib/validation";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password ?? "");
  if (!isEmail(email) || !password) {
    return sendJson(res, 400, { error: "Enter your admin email and password." });
  }

  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    const message = String(error?.message || "");
    if (/invalid login credentials/i.test(message)) {
      return sendJson(res, 401, { error: "Incorrect email or password." });
    }
    return dbError(res, error, "We could not sign you in.");
  }

  const { profile } = await getSessionProfile(supabase);
  if (!profile || profile.role !== "ADMIN") {
    await supabase.auth.signOut().catch(() => {});
    return sendJson(res, 403, {
      error: "This account is not an administrator. Use the storefront sign-in instead.",
    });
  }

  return sendJson(res, 200, { user: toPublicUser(supabase, profile) });
}
