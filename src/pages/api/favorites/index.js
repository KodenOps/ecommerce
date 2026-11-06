import {
  allowMethods,
  dbError,
  sameOrigin,
  sendJson,
  requireSession,
} from "@/lib/apiHelpers";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", profile.id);
    if (error) return dbError(res, error, "We could not load your favourites.");
    return sendJson(res, 200, { ids: (data || []).map((row) => row.product_id) });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const productId = String(req.body?.productId || "");
  const action = String(req.body?.action || "toggle");
  if (!productId) return sendJson(res, 400, { error: "Missing product." });

  const { data: existing } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", profile.id)
    .eq("product_id", productId)
    .maybeSingle();

  const shouldAdd = action === "add" ? true : action === "remove" ? false : !existing;

  if (shouldAdd) {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: profile.id, product_id: productId });
    if (error && error.code !== "23505") {
      return dbError(res, error, "We could not save that favourite.");
    }
  } else if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", profile.id)
      .eq("product_id", productId);
    if (error) return dbError(res, error, "We could not update your favourites.");
  }

  return sendJson(res, 200, { id: productId, saved: shouldAdd });
}
