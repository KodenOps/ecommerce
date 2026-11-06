import {
  allowMethods,
  dbError,
  readInt,
  requireSession,
  sendJson,
} from "@/lib/apiHelpers";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const session = await requireSession(req, res);
  if (!session) return;

  const code = String(req.body?.code || "").trim().slice(0, 24);
  const subtotal = Math.max(0, readInt(req.body?.subtotal, 0));

  if (!code) return sendJson(res, 400, { error: "Enter a promo code." });

  const { data, error } = await session.supabase.rpc("validate_promo", {
    p_code: code,
    p_subtotal: subtotal,
  });

  if (error) return dbError(res, error, "We could not check that code.");
  return sendJson(res, 200, { promo: data });
}
