import {
  allowMethods,
  dbError,
  sameOrigin,
  sendJson,
  requireSession,
} from "@/lib/apiHelpers";
import { cleanText, normalizePhone } from "@/lib/validation";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH", "DELETE"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;
  const id = String(req.query.id || "");

  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return sendJson(res, 404, { error: "Address not found." });

  if (req.method === "DELETE") {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) return dbError(res, error, "We could not remove that address.");

    const { data: remaining } = await supabase
      .from("addresses")
      .select("id, is_default")
      .eq("user_id", profile.id);
    if (remaining?.length && !remaining.some((address) => address.is_default)) {
      await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", remaining[0].id);
    }
    return sendJson(res, 200, { ok: true });
  }

  const body = req.body || {};
  const updates = {};

  if (body.label !== undefined) updates.label = cleanText(body.label, 30) || "Home";
  if (body.fullName !== undefined) updates.full_name = cleanText(body.fullName, 80);
  if (body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (!phone) return sendJson(res, 400, { error: "Enter a valid phone number." });
    updates.phone = phone;
  }
  if (body.line1 !== undefined) updates.line1 = cleanText(body.line1, 160);
  if (body.line2 !== undefined) updates.line2 = cleanText(body.line2, 160) || null;
  if (body.city !== undefined) updates.city = cleanText(body.city, 80);
  if (body.state !== undefined) updates.state = cleanText(body.state, 80);

  if (!Object.keys(updates).length && body.isDefault === undefined) {
    return sendJson(res, 400, { error: "Nothing to update." });
  }

  if (body.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id)
      .eq("is_default", true);
    updates.is_default = true;
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return dbError(res, error, "We could not save that address.");
  return sendJson(res, 200, { address: data });
}
