import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const RECEIPT_DIR = path.join(DATA_DIR, "receipts");

function ensureDirs() {
  fs.mkdirSync(RECEIPT_DIR, { recursive: true });
}

export function readOrders() {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function writeOrders(orders) {
  ensureDirs();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function createOrderId(orders) {
  let id;
  do {
    id = `QF-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (orders.some((order) => order.id === id));
  return id;
}

const DATA_URL = /^data:(image\/(?:png|jpeg|jpg|webp)|application\/pdf);base64,([A-Za-z0-9+/=\s]+)$/i;

export function saveReceipt(orderId, dataUrl) {
  const match = DATA_URL.exec(String(dataUrl || "").trim());
  if (!match) return null;

  let mime = match[1].toLowerCase();
  if (mime === "image/jpg") mime = "image/jpeg";

  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) return null;

  const extension = mime === "application/pdf" ? "pdf" : mime.split("/")[1];
  const file = `${orderId}.${extension}`;

  ensureDirs();
  fs.writeFileSync(path.join(RECEIPT_DIR, file), buffer);

  return { file, mime, size: buffer.length };
}

export function findReceipt(orderId) {
  const orders = readOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order?.receipt?.file) return null;

  const filePath = path.join(RECEIPT_DIR, path.basename(order.receipt.file));
  if (!filePath.startsWith(RECEIPT_DIR + path.sep)) return null;

  try {
    return { buffer: fs.readFileSync(filePath), mime: order.receipt.mime };
  } catch (error) {
    return null;
  }
}
