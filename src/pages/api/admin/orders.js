import { isAdminRequest } from "@/lib/adminAuth";
import { readOrders, writeOrders } from "@/lib/ordersStore";

const publicOrder = (order) => ({
  ...order,
  receipt: order.receipt
    ? {
        name: order.receipt.name,
        mime: order.receipt.mime,
        size: order.receipt.size,
      }
    : null,
});

export default function handler(req, res) {
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Please sign in to the admin panel." });
  }

  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({ orders: readOrders().map(publicOrder) });
  }

  if (req.method === "POST") {
    const id = String(req.body?.id || "").trim();
    const orders = readOrders();
    const index = orders.findIndex((order) => order.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (orders[index].status !== "Payment Confirmed") {
      orders[index] = {
        ...orders[index],
        status: "Payment Confirmed",
        confirmedAt: new Date().toISOString(),
      };
      writeOrders(orders);
    }

    return res.status(200).json({ order: publicOrder(orders[index]) });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
