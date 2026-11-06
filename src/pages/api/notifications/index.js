import {
  allowMethods,
  dbError,
  sameOrigin,
  sendJson,
  requireSession,
} from "@/lib/apiHelpers";
import { toNotification } from "@/lib/productMapper";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;

  const audience = profile.role === "ADMIN" ? "ADMIN" : "USER";

  if (req.method === "GET") {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("audience", audience)
      .order("created_at", { ascending: false })
      .limit(Math.min(50, Math.max(1, Number(req.query.limit) || 25)));
    if (audience === "USER") query = query.eq("user_id", profile.id);

    let unread = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("audience", audience)
      .is("read_at", null);
    if (audience === "USER") unread = unread.eq("user_id", profile.id);

    const [{ data, error }, { count }] = await Promise.all([query, unread]);
    if (error) return dbError(res, error, "We could not load your notifications.");

    return sendJson(res, 200, {
      notifications: (data || []).map(toNotification),
      unreadCount: count ?? 0,
    });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean).slice(0, 50) : null;
  let update = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("audience", audience)
    .is("read_at", null);
  if (audience === "USER") update = update.eq("user_id", profile.id);
  if (ids?.length) update = update.in("id", ids);
  else if (!req.body?.all) update = update.eq("id", req.body?.id || "");

  const { error } = await update;
  if (error) return dbError(res, error, "We could not update your notifications.");
  return sendJson(res, 200, { ok: true });
}
