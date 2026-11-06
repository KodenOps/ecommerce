import { isAdminRequest } from "@/lib/adminAuth";
import { findReceipt } from "@/lib/ordersStore";

export default function handler(req, res) {
  if (!isAdminRequest(req)) {
    return res.status(401).json({ error: "Please sign in to the admin panel." });
  }

  const receipt = findReceipt(String(req.query.id || ""));
  if (!receipt) {
    return res.status(404).json({ error: "Receipt not found." });
  }

  res.setHeader("Content-Type", receipt.mime);
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).send(receipt.buffer);
}
