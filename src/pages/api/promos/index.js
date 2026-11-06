import {
  allowMethods,
  dbError,
  readInt,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { cleanText, normalizePhone } from "@/lib/validation";

const TYPES = ["PERCENT", "FIXED"];

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const { data, error } = await session.supabase
      .from("promos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return dbError(res, error, "We could not load promo codes.");
    return sendJson(res, 200, { promos: data || [] });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const code = cleanText(body.code, 24).toUpperCase().replace(/\s+/g, "");
  const type = TYPES.includes(body.type) ? body.type : "PERCENT";
  const value = readInt(body.value, 0);

  if (!code || code.length < 3) {
    return sendJson(res, 400, { error: "Use a code of at least 3 characters." });
  }
  if (!value) return sendJson(res, 400, { error: "Set the discount value." });
  if (type === "PERCENT" && value > 100) {
    return sendJson(res, 400, { error: "A percentage discount cannot exceed 100%." });
  }

  const promo = {
    code,
    description: cleanText(body.description, 160) || (type === "PERCENT" ? `${value}% off` : `₦${value} off`),
    type,
    value,
    min_subtotal: Math.max(0, readInt(body.minSubtotal, 0)),
    max_uses: body.maxUses ? Math.max(1, readInt(body.maxUses, 1)) : null,
    active: body.active !== false,
    expires_at: body.expiresAt ? new Date(body.expiresAt).toISOString() : null,
  };

  const { data, error } = await session.supabase.from("promos").insert(promo).select("*").single();
  if (error) {
    if (error.code === "23505") {
      return sendJson(res, 409, { error: `The code ${code} already exists.` });
    }
    return dbError(res, error, "We could not create that promo.");
  }

  return sendJson(res, 201, { promo: data });
}
