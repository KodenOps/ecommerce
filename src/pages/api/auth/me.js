import { allowMethods, sendJson } from "@/lib/apiHelpers";
import { createServerSupabase, getSessionProfile, toPublicUser } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const supabase = createServerSupabase(req, res);
  const { user, profile } = await getSessionProfile(supabase);
  if (!user || !profile) return sendJson(res, 200, { user: null });

  const audience = profile.role === "ADMIN" ? "ADMIN" : "USER";
  let inbox = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("audience", audience)
    .is("read_at", null);
  if (audience === "USER") inbox = inbox.eq("user_id", profile.id);

  const { count } = await inbox;

  return sendJson(res, 200, {
    user: toPublicUser(supabase, profile),
    unreadNotifications: count ?? 0,
  });
}
