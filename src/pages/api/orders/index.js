import {
  allowMethods,
  dbError,
  readInt,
  requireSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { sendOrderPlacedEmail } from "@/lib/mailer";
import { ORDER_SELECT, toOrder } from "@/lib/productMapper";
import { removeObject, uploadDataUrl } from "@/lib/supabase/storage";
import { cleanMultiline, cleanText, normalizePhone } from "@/lib/validation";

export const config = {
  api: { bodyParser: { sizeLimit: "9mb" } },
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;

  if (req.method === "GET") {
    let query = supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("placed_at", { ascending: false })
      .limit(50);
    if (profile.role !== "ADMIN") query = query.eq("user_id", profile.id);

    const { data, error } = await query;
    if (error) return dbError(res, error, "We could not load your orders.");
    return sendJson(res, 200, { orders: (data || []).map(toOrder) });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((item) => ({
      product_id: String(item?.productId || item?.product_id || item?.id || ""),
      qty: Math.min(20, Math.max(1, readInt(item?.qty, 1))),
      variant_value: cleanText(item?.variantValue, 60) || null,
      variant_label: cleanText(item?.variantLabel, 80) || null,
      variant_meta: (Array.isArray(item?.variantMeta) ? item.variantMeta : [])
        .filter(
          (meta) =>
            meta && typeof meta === "object" &&
            cleanText(meta.key, 40) && cleanText(meta.value, 80)
        )
        .slice(0, 10)
        .map((meta) => ({ key: cleanText(meta.key, 40), value: cleanText(meta.value, 80) })),
      title: cleanText(item?.title, 120) || null,
      sku: cleanText(item?.sku, 60) || null,
      unit_price: readInt(item?.price, 0),
      line_total: readInt(item?.price, 0) * readInt(item?.qty, 1),
      image: cleanText(item?.image || item?.imageUrl || "", 500) || null,
    }))
    .filter((item) => item.product_id);
  if (!items.length) return sendJson(res, 400, { error: "Your bag is empty." });

  const phone = normalizePhone(body.customer?.phone || profile.phone);
  const customer = {
    name: cleanText(body.customer?.name, 80) || `${profile.first_name} ${profile.last_name}`.trim(),
    email: cleanText(body.customer?.email, 120) || profile.email,
    phone: phone || "",
    address: cleanText(body.customer?.address, 200),
    city: cleanText(body.customer?.city, 80),
    state: cleanText(body.customer?.state, 80),
    notes: cleanMultiline(body.customer?.notes, 300),
  };

  if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.state) {
    return sendJson(res, 400, {
      error: "Name, phone, address, city and state are needed to place this order.",
    });
  }

  const uploaded = await uploadDataUrl(supabase, {
    bucket: "receipts",
    userId: profile.id,
    dataUrl: body.receipt?.dataUrl,
    name: body.receipt?.name || "receipt",
    options: { maxBytes: 8 * 1024 * 1024, allowPdf: true },
  });

  if (!uploaded) {
    return sendJson(res, 400, {
      error: "Please upload a clear image or PDF of your payment receipt (max 8MB).",
    });
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_customer: customer,
    p_items: items.map((item) => ({
      product_id: item.product_id,
      qty: item.qty,
      variant_value: item.variant_value,
      variant_label: item.variant_label,
      variant_meta: item.variant_meta,
      title: item.title,
      sku: item.sku,
      unit_price: item.unit_price,
      line_total: item.line_total,
      image: item.image,
    })),
    p_promo: cleanText(body.promoCode, 24) || null,
    p_receipt: {
      path: uploaded.path,
      name: uploaded.name,
      mime: uploaded.mime,
      size: uploaded.size,
    },
  });

  if (error) {
    await removeObject(supabase, "receipts", uploaded.path);
    return dbError(res, error, "We could not save your order. Please try again.");
  }

  const order = toOrder({
    ...data.order,
    order_items: Array.isArray(data.items) ? data.items : [],
    order_events: [],
  });

  try {
    await sendOrderPlacedEmail({
      order,
      recipient: process.env.ADMIN_ORDER_EMAIL || "femifadiya.segun@gmail.com",
      supabase,
      receipt: {
        path: data.order?.receipt_path,
        name: data.order?.receipt_name,
        mime: data.order?.receipt_mime,
      },
    });
  } catch (error) {
    console.error("[order-email] failed to send payment confirmation email", error);
  }

  return sendJson(res, 201, { order });
}
