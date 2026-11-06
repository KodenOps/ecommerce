import {
  allowMethods,
  dbError,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { ORDER_SELECT, toOrder } from "@/lib/productMapper";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  const { supabase } = session;

  const id = String(req.query.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing order." });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) return dbError(res, error, "We could not load that order.");
    if (!data) return sendJson(res, 404, { error: "Order not found." });
    return sendJson(res, 200, { order: toOrder(data) });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const { error } = await supabase.rpc("admin_update_order", {
    p_order_id: id,
    p_status: body.status || null,
    p_payment_status: body.paymentStatus || null,
    p_courier: body.courier || null,
    p_tracking: body.trackingNumber || null,
    p_note: body.note || null,
  });

  if (error) return dbError(res, error, "We could not update that order.");

  const { data, error: fetchError } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();
  if (fetchError) return dbError(res, fetchError, "The order was updated, but could not be reloaded.");

  return sendJson(res, 200, { order: toOrder(data) });
}
