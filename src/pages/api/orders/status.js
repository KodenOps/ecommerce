import { readOrders } from "@/lib/ordersStore";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ids = String(req.query.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (!ids.length) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ orders: [] });
  }

  const orders = readOrders()
    .filter((order) => ids.includes(order.id))
    .map((order) => ({
      id: order.id,
      status: order.status,
      confirmedAt: order.confirmedAt ?? null,
    }));

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ orders });
}
