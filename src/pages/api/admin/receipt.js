import {
  allowMethods,
  dbError,
  requireAdminSession,
  sendJson,
} from "@/lib/apiHelpers";
import { downloadObject } from "@/lib/supabase/storage";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  const { supabase } = session;

  const id = String(req.query.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing order." });

  const { data: order, error } = await supabase
    .from("orders")
    .select("receipt_path, receipt_mime, receipt_name")
    .eq("id", id)
    .maybeSingle();

  if (error) return dbError(res, error, "We could not load that receipt.");
  if (!order?.receipt_path) return sendJson(res, 404, { error: "No receipt on this order." });

  const buffer = await downloadObject(supabase, "receipts", order.receipt_path);
  if (!buffer) return sendJson(res, 404, { error: "Receipt file not found." });

  res.setHeader("Content-Type", order.receipt_mime || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${String(order.receipt_name || "receipt").replace(/"/g, "")}"`);
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).send(buffer);
}
