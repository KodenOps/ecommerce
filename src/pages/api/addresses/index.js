import {
  allowMethods,
  dbError,
  sameOrigin,
  sendJson,
  requireSession,
} from "@/lib/apiHelpers";
import { cleanText, normalizePhone } from "@/lib/validation";

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) return dbError(res, error, "We could not load your addresses.");
    return sendJson(res, 200, { addresses: data || [] });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const phone = normalizePhone(body.phone || profile.phone);
  const address = {
    user_id: profile.id,
    label: cleanText(body.label, 30) || "Home",
    full_name: cleanText(body.fullName, 80) || `${profile.first_name} ${profile.last_name}`.trim(),
    phone,
    line1: cleanText(body.line1, 160),
    line2: cleanText(body.line2, 160) || null,
    city: cleanText(body.city, 80),
    state: cleanText(body.state, 80),
    is_default: Boolean(body.isDefault),
  };

  if (!address.phone) return sendJson(res, 400, { error: "Enter a valid phone number." });
  if (!address.full_name || !address.line1 || !address.city || !address.state) {
    return sendJson(res, 400, { error: "Name, street, city and state are required." });
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true });
  if (!count) address.is_default = true;

  if (address.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id)
      .eq("is_default", true);
  }

  const { data, error } = await supabase.from("addresses").insert(address).select("*").single();
  if (error) return dbError(res, error, "We could not save that address.");
  return sendJson(res, 201, { address: data });
}
