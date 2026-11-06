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
  const { supabase } = session;

  const { data, error } = await supabase.rpc("admin_overview");
  if (error) return dbError(res, error, "We could not load the dashboard.");

  const [{ data: recent }, { data: lowStock }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, reference, total, status, payment_status, customer_name, customer_phone, placed_at, order_items(title, qty)")
      .order("placed_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("id, title, stock, low_stock_at, image, category")
      .eq("status", "ACTIVE")
      .order("stock", { ascending: true })
      .limit(20),
  ]);

  return sendJson(res, 200, {
    stats: data,
    recentOrders: (recent || []).map((order) => ({
      id: order.id,
      reference: order.reference,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      placedAt: order.placed_at,
      itemCount: (order.order_items || []).reduce((sum, item) => sum + item.qty, 0),
    })),
    lowStock: (lowStock || [])
      .filter((product) => product.stock <= product.low_stock_at)
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        title: product.title,
        stock: product.stock,
        category: product.category,
        image: product.image,
      })),
  });
}
