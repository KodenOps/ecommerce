import { sendJson, allowMethods, dbError, requireAdminSession, sameOrigin } from "@/lib/apiHelpers";
import { cleanMultiline, cleanText } from "@/lib/validation";
import { sendPush } from "@/lib/webpush";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const title = cleanText(req.body?.title, 90);
  const body = cleanMultiline(req.body?.body, 400);
  const href = cleanText(req.body?.href, 200) || null;

  if (!title || !body) {
    return sendJson(res, 400, { error: "Add a title and a message." });
  }    const { data: customers, error: customerError } = await session.supabase
    .from("profiles")
    .select("id, push_opt_in")
    .eq("push_opt_in", true);
  if (customerError) return dbError(customerError, "We could not load customers.");

  if (!customers?.length) return sendJson(res, 201, { sent: 0, pushOptIn: 0 });

  const { error: insertError } = await session.supabase.from("notifications").insert(
    customers.map((customer) => ({
      user_id: customer.id,
      audience: "USER",
      type: "ANNOUNCEMENT",
      title,
      body,
      href,
    }))
  );

  if (insertError) return dbError(insertError, "We could not send that announcement.");

  const icon = "/icons/icon-192.png";
  const encodePushMeta = (subscription, pushError) => ({
    endpoint: subscription.endpoint,
    pushError:
      pushError == null
        ? null
        : typeof pushError === "string"
          ? pushError
          : String(pushError?.message || pushError?.toString?.() || ""),
    pushCode: subscription._pushCode ?? null,
  });

  let fanoutErrors = 0;
  const pushMeta = [];

  try {
    const { data: subs } = await session.supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, user_id")
      .in("user_id", customers.map((c) => c.id));

    if (subs?.length) {
      for (const sub of subs) {
        const subscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
          _pushCode: null,
        };
        try {
          const alive = await sendPush(subscription, title, body, icon);
          if (!alive) {
            await session.supabase.from("push_subscriptions").delete().eq("id", sub.id);
            fanoutErrors += 1;
            pushMeta.push(encodePushMeta(subscription, "endpoint removed: endpoint not reachable or expired"));
            continue;
          }
        } catch (err) {
          console.error("[broadcast] push failed:", sub.endpoint, err?.message);
          await session.supabase.from("push_subscriptions").delete().eq("id", sub.id);
          fanoutErrors += 1;
          const raw = String(err?.message || err?.toString?.() || "");
          pushMeta.push(encodePushMeta(subscription, raw));
        }
      }
    }
  } catch (err) {
    console.error("[broadcast] push fan-out failed:", err?.message);
    pushMeta.push({ endpoint: null, pushError: String(err?.message || err ?? ""), pushCode: null });
  }

  return sendJson(res, 201, { sent: customers.length, fanoutErrors, pushOptIn: customers.length, pushMeta: pushMeta.slice(0, 50) });
}
