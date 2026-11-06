import {
  allowMethods,
  dbError,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { cleanMultiline, cleanText } from "@/lib/validation";

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
  }

  const { data: customers, error: customerError } = await session.supabase
    .from("profiles")
    .select("id")
    .eq("role", "CUSTOMER");
  if (customerError) return dbError(res, customerError, "We could not load customers.");

  if (!customers?.length) return sendJson(res, 200, { sent: 0 });

  const { error } = await session.supabase.from("notifications").insert(
    customers.map((customer) => ({
      user_id: customer.id,
      audience: "USER",
      type: "ANNOUNCEMENT",
      title,
      body,
      href,
    }))
  );

  if (error) return dbError(res, error, "We could not send that announcement.");
  return sendJson(res, 201, { sent: customers.length });
}
