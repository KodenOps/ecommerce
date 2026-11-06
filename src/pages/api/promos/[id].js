import {
  allowMethods,
  dbError,
  readInt,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { cleanText } from "@/lib/validation";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH", "DELETE"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const id = String(req.query.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing promo." });

  if (req.method === "DELETE") {
    const { error } = await session.supabase.from("promos").delete().eq("id", id);
    if (error) return dbError(res, error, "We could not delete that promo.");
    return sendJson(res, 200, { ok: true });
  }

  const body = req.body || {};
  const updates = {};

  if (body.description !== undefined) updates.description = cleanText(body.description, 160);
  if (body.value !== undefined) updates.value = readInt(body.value, 0);
  if (body.minSubtotal !== undefined) updates.min_subtotal = Math.max(0, readInt(body.minSubtotal, 0));
  if (body.maxUses !== undefined) {
    updates.max_uses = body.maxUses ? Math.max(1, readInt(body.maxUses, 1)) : null;
  }
  if (body.active !== undefined) updates.active = Boolean(body.active);
  if (body.expiresAt !== undefined) {
    updates.expires_at = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;
  }

  if (!Object.keys(updates).length) return sendJson(res, 400, { error: "Nothing to update." });
  if (updates.value !== undefined && updates.value <= 0) {
    return sendJson(res, 400, { error: "Discount value must be greater than zero." });
  }

  const { data, error } = await session.supabase
    .from("promos")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return dbError(res, error, "We could not update that promo.");
  if (!data) return sendJson(res, 404, { error: "Promo not found." });
  return sendJson(res, 200, { promo: data });
}
