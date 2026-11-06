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

  const [{ data: profiles, error }, { data: orders }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("user_id, total, status, payment_status, placed_at")
      .order("placed_at", { ascending: false }),
    supabase.from("addresses").select("*").eq("is_default", true),
  ]);

  if (error) return dbError(res, error, "We could not load customers.");

  const byUser = new Map();
  for (const order of orders || []) {
    const entry = byUser.get(order.user_id) || { orders: 0, spent: 0, lastOrderAt: null };
    entry.orders += 1;
    if (order.payment_status === "PAID") entry.spent += order.total;
    if (!entry.lastOrderAt) entry.lastOrderAt = order.placed_at;
    byUser.set(order.user_id, entry);
  }

  const defaultAddress = new Map((addresses || []).map((address) => [address.user_id, address]));

  const customers = (profiles || []).map((profile) => {
    const stats = byUser.get(profile.id) || { orders: 0, spent: 0, lastOrderAt: null };
    const address = defaultAddress.get(profile.id);
    return {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: `${profile.first_name} ${profile.last_name}`.trim(),
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      marketingOptIn: profile.marketing_opt_in,
      avatarPath: profile.avatar_path,
      createdAt: profile.created_at,
      orders: stats.orders,
      spent: stats.spent,
      lastOrderAt: stats.lastOrderAt,
      address: address
        ? `${address.line1}, ${address.city}, ${address.state}`
        : null,
    };
  });

  return sendJson(res, 200, { customers });
}
