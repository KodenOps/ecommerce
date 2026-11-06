import {
  allowMethods,
  dbError,
  readInt,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { createServerSupabase } from "@/lib/supabase/server";
import { toAdminProduct, toStoreProduct } from "@/lib/productMapper";
import { cleanMultiline, cleanText, slugify } from "@/lib/validation";

const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"];

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH", "DELETE"])) return;

  const id = String(req.query.id || "");
  if (!id) return sendJson(res, 400, { error: "Missing product." });

  if (req.method === "GET") {
    const supabase = createServerSupabase(req, res);
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) return dbError(res, error, "We could not load that product.");
    if (!data) return sendJson(res, 404, { error: "Product not found." });
    return sendJson(res, 200, { product: toStoreProduct(data) });
  }

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  if (req.method === "DELETE") {
    const { data, error } = await session.supabase
      .from("products")
      .update({ status: "ARCHIVED" })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return dbError(res, error, "We could not archive that product.");
    if (!data) return sendJson(res, 404, { error: "Product not found." });
    return sendJson(res, 200, { product: toAdminProduct(data) });
  }

  const body = req.body || {};
  const updates = {};

  if (body.title !== undefined) {
    const title = cleanText(body.title, 120);
    if (!title) return sendJson(res, 400, { error: "Product name cannot be empty." });
    updates.title = title;
  }
  if (body.description !== undefined) updates.description = cleanMultiline(body.description, 900);
  if (body.category !== undefined) updates.category = cleanText(body.category, 60) || "Skincare";
  if (body.price !== undefined) {
    const price = readInt(body.price, 0);
    if (price <= 0) return sendJson(res, 400, { error: "Price must be greater than zero." });
    updates.price = price;
  }
  if (body.oldPrice !== undefined) {
    const oldPrice = body.oldPrice === null || body.oldPrice === "" ? null : readInt(body.oldPrice, 0);
    updates.old_price = oldPrice && oldPrice > 0 ? oldPrice : null;
  }
  if (body.stock !== undefined) updates.stock = Math.max(0, readInt(body.stock, 0));
  if (body.lowStockAt !== undefined) updates.low_stock_at = Math.max(1, readInt(body.lowStockAt, 5));
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return sendJson(res, 400, { error: "Unknown product status." });
    updates.status = body.status;
  }
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);
  if (body.image !== undefined) updates.image = cleanText(body.image, 500);
  if (body.sku !== undefined) updates.sku = cleanText(body.sku, 40);

  if (!Object.keys(updates).length) return sendJson(res, 400, { error: "Nothing to update." });

  if (updates.title) {
    updates.slug = `${slugify(updates.title) || "product"}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await session.supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return dbError(res, error, "We could not update that product.");
  if (!data) return sendJson(res, 404, { error: "Product not found." });
  return sendJson(res, 200, { product: toAdminProduct(data) });
}
