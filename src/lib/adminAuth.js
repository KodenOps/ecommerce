import crypto from "crypto";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function adminPasscode() {
  return process.env.ADMIN_PASSCODE || "QueenFizzie2026";
}

function sign(payload) {
  return crypto.createHmac("sha256", adminPasscode()).update(payload).digest("hex");
}

/**
 * Stateless admin token: no server memory needed, so it survives serverless
 * route bundles, restarts and multiple instances.
 */
export function createAdminSession(passcode) {
  if (!passcode || String(passcode) !== adminPasscode()) return null;
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expiry}`;
  return Buffer.from(`${payload}.${sign(payload)}`).toString("base64url");
}

export function isAdminRequest(req) {
  const header = req.headers?.["x-admin-token"];
  const fromHeader = Array.isArray(header) ? header[0] : header;
  const token = fromHeader || req.query?.token;
  if (!token || typeof token !== "string") return false;

  let decoded;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch (error) {
    return false;
  }

  const [scope, expiry, signature] = decoded.split(".");
  if (scope !== "admin" || !expiry || !signature) return false;
  if (Number(expiry) < Date.now()) return false;

  const expected = sign(`admin.${expiry}`);
  if (expected.length !== signature.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
