import { allowMethods, sameOrigin, sendJson } from "@/lib/apiHelpers";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const supabase = createServerSupabase(req, res);
  await supabase.auth.signOut().catch(() => {});
  return sendJson(res, 200, { ok: true });
}
