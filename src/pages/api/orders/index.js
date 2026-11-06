import { getProductById } from "@/data/products";
import { deliveryFeeFor } from "@/lib/pricing";
import {
  createOrderId,
  readOrders,
  saveReceipt,
  writeOrders,
} from "@/lib/ordersStore";

export const config = {
  api: {
    bodyParser: { sizeLimit: "8mb" },
  },
};

const clean = (value, max = 160) => String(value ?? "").trim().slice(0, max);

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body ?? {};
    const customer = {
      name: clean(body.customer?.name, 80),
      email: clean(body.customer?.email, 120),
      phone: clean(body.customer?.phone, 30),
      address: clean(body.customer?.address, 200),
      city: clean(body.customer?.city, 80),
      state: clean(body.customer?.state, 80),
      notes: clean(body.customer?.notes, 300),
    };

    if (!customer.name || !customer.address || !customer.city || !customer.state) {
      return res.status(400).json({ error: "Delivery details are incomplete." });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    const lines = items
      .map((item) => {
        const product = getProductById(Number(item?.id));
        const qty = Math.min(20, Math.max(1, Number(item?.qty) || 1));
        return product ? { product, qty } : null;
      })
      .filter(Boolean);

    if (!lines.length) {
      return res.status(400).json({ error: "Your bag is empty." });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
    const delivery = deliveryFeeFor(subtotal);

    const orders = readOrders();
    const id = createOrderId(orders);
    const storedReceipt = saveReceipt(id, body.receipt?.dataUrl);

    if (!storedReceipt) {
      return res.status(400).json({
        error: "Please upload a clear image or PDF of your payment receipt (max 5MB).",
      });
    }

    const order = {
      id,
      createdAt: new Date().toISOString(),
      status: "Confirming Payment",
      confirmedAt: null,
      customer,
      items: lines.map(({ product, qty }) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        qty,
        image: product.image,
      })),
      subtotal,
      delivery,
      total: subtotal + delivery,
      payment: "Bank transfer",
      receipt: {
        ...storedReceipt,
        name: clean(body.receipt?.name, 120) || storedReceipt.file,
      },
    };

    orders.unshift(order);
    writeOrders(orders);

    return res.status(201).json({ order });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "We could not save your order. Please try again." });
  }
}
