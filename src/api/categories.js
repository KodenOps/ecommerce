import { createServerSupabase, getSessionProfile } from "@/lib/supabase/server";

export async function loadPublicCategories(req, res) {
  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase
    .rpc("categories_public")
    .select("*");
  if (error) {
    const fallback = await supabase.from("categories").select("*").order("name", { ascending: true });
    if (fallback.error) return null;
    return fallback.data || [];
  }
  return data || [];
}

export async function loadAllCategories(supabase) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, code, name, color, description")
    .order("name", { ascending: true });
  if (error) return [];
  return data || [];
}

/** "Body & Face Cream" -> "body-face-cream", the code a catalogue row uses. */
export function categoryCodeFor(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * The catalogue row a product points at. The code wins, since that is the real
 * reference; the name is accepted so older editors and imports keep working.
 * Returns null when the catalogue has no such category.
 */
export async function resolveCategory(supabase, { code, name } = {}) {
  const wantedCode = String(code || "").trim();
  const wantedName = String(name || "").trim();
  if (!wantedCode && !wantedName) return null;

  const { data, error } = await supabase.from("categories").select("code, name");
  if (error || !Array.isArray(data)) return null;

  if (wantedCode) {
    const byCode = data.find((row) => String(row.code) === wantedCode);
    if (byCode) return { code: byCode.code, name: byCode.name };
  }

  if (wantedName) {
    const wanted = wantedName.toLowerCase();
    const byName = data.find((row) => String(row.name || "").trim().toLowerCase() === wanted);
    if (byName) return { code: byName.code, name: byName.name };
  }

  return null;
}

/**
 * Adds catalogue rows for category names that do not exist yet, then returns
 * name -> { code, name }. Used by the repo import so imported products point at
 * the same catalogue the admin manages instead of storing loose text.
 */
export async function ensureCategories(supabase, names) {
  const wanted = [
    ...new Set((names || []).map((value) => String(value || "").trim()).filter(Boolean)),
  ];
  const byName = new Map();
  if (!wanted.length) return byName;

  const { data, error } = await supabase.from("categories").select("code, name");
  if (error || !Array.isArray(data)) return byName;
  data.forEach((row) => {
    byName.set(String(row.name || "").trim().toLowerCase(), { code: row.code, name: row.name });
  });

  const missing = wanted.filter((name) => !byName.has(name.toLowerCase()));
  const rows = missing
    .map((name) => ({ code: categoryCodeFor(name), name }))
    .filter((row) => row.code);
  if (!rows.length) return byName;

  const { data: created } = await supabase
    .from("categories")
    .upsert(rows, { onConflict: "code", ignoreDuplicates: true })
    .select("code, name");
  (created || []).forEach((row) => {
    byName.set(String(row.name || "").trim().toLowerCase(), { code: row.code, name: row.name });
  });

  return byName;
}
