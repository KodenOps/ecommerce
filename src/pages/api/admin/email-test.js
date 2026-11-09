import { sendJson, allowMethods, dbError, requireAdminSession, sameOrigin } from "@/lib/apiHelpers";
import { getMailConfig, sendOrderPlacedEmail } from "@/lib/mailer";
import { cleanEmail, cleanMultiline, cleanText } from "@/lib/validation";

export const config = {
  api: { bodyParser: { sizeLimit: "9mb" } },
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const to = cleanEmail(req.body?.to, 120);
  const subject = cleanText(req.body?.subject, 200) || "QueenFizzie test email";
  const body = cleanMultiline(req.body?.body, 8000);

  if (!to) return sendJson(res, 400, { error: "Add a valid recipient email." });
  if (!body) return sendJson(res, 400, { error: "Add a message body." });

  const mailConfig = getMailConfig();
  if (!mailConfig) {
    return sendJson(
      res,
      400,
      { error: "Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS." }
    );
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const orderUrl = `${appUrl.replace(/\/$/, "")}/Admin/Orders?order=test`;

  const testOrder = {
    id: "test-" + Date.now(),
    reference: "TEST-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING_PAYMENT",
    subtotal: 50000,
    discount: 0,
    delivery: 3500,
    total: 53500,
    promoCode: null,
    placedAt: new Date().toISOString(),
    paymentConfirmedAt: null,
    packedAt: null,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    courier: null,
    trackingNumber: null,
    customer_name: "Test Customer",
    customer_email: to,
    customer_phone: "+234 800 000 0000",
    address_line: "1 Test Street",
    city: "Lagos",
    state: "Lagos",
    notes: null,
    receipt_path: null,
    receipt_name: null,
    receipt_mime: null,
    receipt_size: null,
    receipt_uploaded_at: null,
    promo_code: null,
    order_items: [
      {
        id: "item-1",
        product_id: "test-product",
        qty: 2,
        variant_value: "rose",
        variant_label: "Rose",
        variant_meta: [],
        title: "Zobo Glow Serum",
        sku: "ZG-001",
        unit_price: 25000,
        line_total: 50000,
        image: null,
      },
    ],
    order_events: [],
  };

  console.log("[email-test] sending to", to, "from", mailConfig.from, "with port", mailConfig.port, "secure", mailConfig.secure);

  try {
    await sendOrderPlacedEmail({
      order: testOrder,
      recipient: to,
      supabase: session.supabase,
      receipt: null,
    });
    console.log("[email-test] sent ok for", to);
    return sendJson(res, 201, { ok: `Test email sent to ${to}.` });
  } catch (error) {
    const raw = String(error?.message || error?.toString?.() || "");
    console.error("[email-test] failed for", to, "error", error?.code, raw, JSON.stringify(error?.stack));
    if (error?.code === "ETRANSPORTCLOSED" || raw.includes("connect") || raw.includes("ETIMEDOUT") || raw.includes("ECONNREFUSED")) {
      return dbError(error, "Could not reach the mail server. Check SMTP_HOST, SMTP_PORT and your network.");
    }
    return dbError(error, "Could not send that test email.");
  }
}
