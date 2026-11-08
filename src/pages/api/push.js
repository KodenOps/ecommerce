import { sendJson, allowMethods, sameOrigin, requireSession } from "@/lib/apiHelpers";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const session = await requireSession(req, res);
  if (!session) return;

  if (req.method === "GET") {
    return sendJson(
      res,
      200,
      { vapidPublicKey: process.env.WEBPUSH_VAPID_PUBLIC_KEY_BASE64URL || "" }
    );
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const subscription = req.body?.subscription;
  if (!subscription || typeof subscription !== "object") {
    return sendJson(res, 400, { error: "Invalid subscription." });
  }

  const { endpoint, keys } = subscription;
  if (typeof endpoint !== "string" || !keys || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return sendJson(res, 400, { error: "Missing subscription fields." });
  }

  const supabase = session.supabase;
  const userId = session.profile.id;

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      { onConflict: "endpoint" }
    );

  if (error) return sendJson(res, 500, { error: "Could not save subscription." });
  return sendJson(res, 200, { ok: true });
}
