import { allowMethods, dbError, readInt, sendJson } from "@/lib/apiHelpers";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Public list of the categories that sold the most units this month, used by
 * the storefront "Shop by Routines" grid. Aggregate only — no order or customer
 * data is exposed.
 */
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  if (!isSupabaseConfigured()) return sendJson(res, 200, { categories: [] });

  const limit = Math.min(12, Math.max(1, readInt(req.query.limit, 6)));
  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase.rpc("category_demand", { p_limit: limit });

  if (error) {
    // The storefront still renders curated defaults when the helper has not
    // been installed on the project's database yet.
    const message = String(error.message || "");
    if (error.code === "PGRST202" || message.includes("category_demand")) {
      return sendJson(res, 200, { categories: [] });
    }
    return dbError(res, error, "We could not load the popular categories.");
  }

  const categories = (data || [])
    .map((row) => ({
      name: String(row.category || "").trim(),
      units: Number(row.units) || 0,
      products: Number(row.products) || 0,
      image: row.image || "",
    }))
    .filter((row) => row.name && row.units > 0);

  return sendJson(res, 200, { categories });
}
