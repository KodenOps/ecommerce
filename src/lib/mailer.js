import nodemailer from "nodemailer";
import { downloadObject } from "@/lib/supabase/storage";

const DEFAULT_ADMIN_EMAIL = "femifadiya.segun@gmail.com";

/** The option the customer picked, with any extra attributes. */
function variantLine(item) {
  if (!item?.variantLabel) return "";
  return `${item.variantLabel}${item.variantAttributes ? ` (${item.variantAttributes})` : ""}`;
}

function escapeHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: { user, pass },
    from: process.env.SMTP_FROM || "QueenFizzie <noreply@localhost>",
  };
}

export async function sendOrderPlacedEmail({
  order,
  recipient = process.env.ADMIN_ORDER_EMAIL || DEFAULT_ADMIN_EMAIL,
  supabase,
  receipt,
}) {
  const mailConfig = getMailConfig();
  if (!mailConfig || !order) {
    return { sent: false, reason: "mail_not_configured" };
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const orderUrl = `${appUrl.replace(/\/$/, "")}/Admin/Orders?order=${order.id}`;

  const transporter = nodemailer.createTransport(mailConfig);
  const customer = order.customer || {};
  const promoCode = order.promoCode || "None";
  const total = Number(order.total ?? 0);
  const formattedTotal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(total);

  let attachment = null;
  if (supabase && receipt?.path) {
    const buffer = await downloadObject(supabase, "receipts", receipt.path).catch(() => null);
    if (buffer) {
      attachment = {
        filename: receipt.name || "receipt",
        content: buffer,
        contentType: receipt.mime || "application/octet-stream",
      };
    }
  }

  const itemsLines = (order.items || [])
    .map(
      (item) =>
        `        <li><strong>${escapeHtml(item.title || "Product")}</strong>${variantLine(item) ? ` — ${escapeHtml(variantLine(item))}` : ""}
          <br />Qty ${item.qty} × ${formatNaira(item.price)} = ${formatNaira(item.lineTotal)}${item.sku ? `<br /><span style="color:#6b7280;font-size:0.9em;">SKU: ${escapeHtml(item.sku)}</span>` : ""}
        </li>`
    )
    .join("\n");

  const subject = `New order ${order.reference} is awaiting payment confirmation`;
  const text = [
    "A new order has been placed and is awaiting payment confirmation.",
    "",
    `Reference: ${order.reference}`,
    `Customer: ${customer.name || "Unknown customer"}`,
    `Phone: ${customer.phone || "Not provided"}`,
    `Email: ${customer.email || "Not provided"}`,
    `Coupon used: ${promoCode}`,
    "Items:",
    ...(order.items || []).flatMap((item) => [
      `  - ${item.title}${variantLine(item) ? ` (${variantLine(item)})` : ""} × ${item.qty} @ ${formatNaira(item.price)} = ${formatNaira(item.lineTotal)}${item.sku ? ` [SKU ${item.sku}]` : ""}`,
    ]),
    `Total: ${formattedTotal}`,
    `Order URL: ${orderUrl}`,
    "",
    "Please review the receipt and confirm payment in the admin dashboard.",
    "",
    "QueenFizzie Admin",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px; color: #111827;">New order pending payment confirmation</h2>
      <p>A new order has been placed and is awaiting payment confirmation.</p>
      <p><strong>Customer:</strong> ${escapeHtml(customer.name || "Unknown customer")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(customer.phone || "Not provided")}</p>
      <p><strong>Email:</strong> ${escapeHtml(customer.email || "Not provided")}</p>
      <p><strong>Coupon used:</strong> ${escapeHtml(String(promoCode))}</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;">Item</th>
            <th style="text-align:right;padding:8px;border:1px solid #e5e7eb;">Qty</th>
            <th style="text-align:right;padding:8px;border:1px solid #e5e7eb;">Line total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px;border:1px solid #e5e7eb;">
                ${escapeHtml(lineLabelFor(item))}
              </td>
              <td style="text-align:right;padding:8px;border:1px solid #e5e7eb;">${item.qty}</td>
              <td style="text-align:right;padding:8px;border:1px solid #e5e7eb;">${formatNaira(item.lineTotal)}</td>
            </tr>`,
            )
            .join("\n")}
        </tbody>
      </table>
      <p style="margin:12px 0;"><strong>Total:</strong> ${formattedTotal}</p>
      <p><strong>Order URL:</strong> <a href="${orderUrl}">${orderUrl}</a></p>
      <p>Please review the payment receipt and confirm payment in the admin dashboard.</p>
      <p style="margin-top: 14px;">QueenFizzie Admin</p>
    </div>
  `;

  await transporter.sendMail({
    from: mailConfig.from,
    to: recipient,
    subject,
    text,
    html,
    attachments: attachment ? [attachment] : undefined,
  });

  return { sent: true };
}

/** One descriptive line for an order item, used in the email body.
 * Uses the raw labels the order row stores, and falls back to the
 * embedded product title when the item title is missing or generic. */
function lineLabelFor(item) {
  if (!item) return "Product";

  const title = item.title || "Product";
  const label = item.variantLabel || item.variant_label || null;
  const attributes = item.variantAttributes || item.variantAttributesFor ? item.variantAttributes : "";

  const parts = [title];
  if (label && label !== title) parts.push(label);
  if (attributes) parts.push(attributes);

  return parts.join(" · ");
}
