import { allowMethods, dbError, requireSession, sendJson } from "@/lib/apiHelpers";

/** Authenticated list of active codes shown on /Promos. */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const session = await requireSession(req, res);
  if (!session) return;

  const { supabase } = session;
  const { data, error } = await supabase
    .from("promos")
    .select("code, description, type, value, min_subtotal, expires_at")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return dbError(res, error, "We could not load the promos.");

  const now = Date.now();
  const promos = (data || []).filter(
    (promo) => !promo.expires_at || new Date(promo.expires_at).getTime() > now
  );

  return sendJson(res, 200, { promos });
}
