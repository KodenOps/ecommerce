import { createAdminSession } from "@/lib/adminAuth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = createAdminSession(req.body?.passcode);
  if (!token) {
    return res.status(401).json({ error: "Incorrect passcode." });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ token });
}
