import {
  allowMethods,
  dbError,
  requireAdminSession,
  sendJson,
} from "@/lib/apiHelpers";
import { ORDER_SELECT, toOrder } from "@/lib/productMapper";

const STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  const { supabase } = session;

  const status = String(req.query.status || "");
  const search = String(req.query.q || "").trim().slice(0, 60);

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("placed_at", { ascending: false })
    .limit(Math.min(100, Math.max(1, Number(req.query.limit) || 60)));

  if (STATUSES.includes(status)) query = query.eq("status", status);
  if (search) {
    query = query.or(
      `reference.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,customer_email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return dbError(res, error, "We could not load orders.");
  return sendJson(res, 200, { orders: (data || []).map(toOrder) });
}
