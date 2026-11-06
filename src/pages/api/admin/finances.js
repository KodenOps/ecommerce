import {
  allowMethods,
  dbError,
  requireAdminSession,
  sendJson,
} from "@/lib/apiHelpers";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;

  const { data, error } = await session.supabase.rpc("admin_finances");
  if (error) return dbError(res, error, "We could not load the finance report.");

  return sendJson(res, 200, { finances: data });
}
