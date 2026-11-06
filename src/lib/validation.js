/** Shared, dependency-free validation helpers for forms and API routes. */

export function cleanText(value, max = 160) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanMultiline(value, max = 600) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(normalizeEmail(value));
}

/**
 * Accepts 0803..., 803..., 234803..., +234803... and returns +234XXXXXXXXXX.
 * Returns null when the number cannot be a Nigerian mobile number.
 */
export function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  let national = "";
  if (digits.length === 11 && digits.startsWith("0")) national = digits.slice(1);
  else if (digits.length === 10) national = digits;
  else if (digits.length === 13 && digits.startsWith("234")) national = digits.slice(3);
  else if (digits.length === 14 && digits.startsWith("2340")) national = digits.slice(4);
  if (!/^[789][01]\d{8}$/.test(national)) return null;
  return `+234${national}`;
}

export function isNigerianPhone(value) {
  return Boolean(normalizePhone(value));
}

export function formatPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return String(value ?? "");
  const national = normalized.slice(4);
  return `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

export function parseMoney(value) {
  const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount);
}

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function passwordProblem(password) {
  const value = String(password ?? "");
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return "Include at least one letter and one number.";
  }
  return null;
}
