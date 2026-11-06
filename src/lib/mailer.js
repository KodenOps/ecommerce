import nodemailer from "nodemailer";
import { downloadObject } from "@/lib/supabase/storage";

const DEFAULT_ADMIN_EMAIL = "femifadiya.segun@gmail.com";

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

  const subject = `New order ${order.reference} is awaiting payment confirmation`;
  const text = [
    "A new order has been placed and is awaiting payment confirmation.",
    "",
    `Reference: ${order.reference}`,
    `Customer: ${customer.name || "Unknown customer"}`,
    `Phone: ${customer.phone || "Not provided"}`,
    `Email: ${customer.email || "Not provided"}`,
    `Coupon used: ${promoCode}`,
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
      <ul style="padding-left: 18px; margin: 12px 0;">
        <li><strong>Reference:</strong> ${order.reference}</li>
        <li><strong>Customer:</strong> ${customer.name || "Unknown customer"}</li>
        <li><strong>Phone:</strong> ${customer.phone || "Not provided"}</li>
        <li><strong>Email:</strong> ${customer.email || "Not provided"}</li>
        <li><strong>Coupon used:</strong> ${promoCode}</li>
        <li><strong>Total:</strong> ${formattedTotal}</li>
      </ul>
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
