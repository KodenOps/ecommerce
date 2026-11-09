import {
  allowMethods,
  dbError,
  readInt,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { createServerSupabase, getSessionProfile } from "@/lib/supabase/server";
import { toAdminProduct, toStoreProduct } from "@/lib/productMapper";
import { cleanMultiline, cleanText, slugify } from "@/lib/validation";
import {
  isMissingColumn,
  normalizeVariantOptions,
  syncProductVariants,
  variantTitleFor,
} from "@/lib/variants";

const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"];

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  if (req.method === "GET") {
    const supabase = createServerSupabase(req, res);
    const { profile } = await getSessionProfile(supabase);
    const isAdmin = profile?.role === "ADMIN";
    const wantsAll = isAdmin && String(req.query.all || "") === "1";

    let query = supabase.from("products").select("*, product_variants(*)");
    if (!wantsAll) query = query.eq("status", "ACTIVE");
    if (req.query.category) query = query.eq("category", String(req.query.category));
    if (req.query.q) query = query.ilike("title", `%${String(req.query.q).slice(0, 60)}%`);

    const { data, error } = await query
      .order("featured", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) return dbError(res, error, "We could not load the catalogue.");

    const products = (data || []).map(wantsAll ? toAdminProduct : toStoreProduct);
    return sendJson(res, 200, { products });
  }

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const title = cleanText(body.title, 120);
  const price = readInt(body.price, 0);
  const stock = Math.max(0, readInt(body.stock, 0));
  const status = STATUSES.includes(body.status) ? body.status : "ACTIVE";

  if (!title) return sendJson(res, 400, { error: "Give the product a name." });
  if (!price) return sendJson(res, 400, { error: "Price must be greater than zero." });

  const imageList = Array.isArray(body.images)
    ? body.images
    : typeof body.image === "string"
      ? [body.image]
      : [];
  const normalizedImages = [...new Set(
    imageList
      .map((value) => cleanText(value, 500))
      .filter(Boolean)
  )].slice(0, 3);
  const primaryImage = normalizedImages[0] ||
    cleanText(body.image, 500) ||
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=768&q=80";

  const suffix = Math.random().toString(36).slice(2, 6);
  const rawVariants = Array.isArray(body.variants)
    ? body.variants
    : Array.isArray(body.sizes)
      ? body.sizes
      : [];
  const variantOptions = normalizeVariantOptions(rawVariants, price);
  const product = {
    title,
    slug: `${slugify(title) || "product"}-${suffix}`,
    sku: cleanText(body.sku, 40) || `QF-${suffix.toUpperCase()}${String(Date.now()).slice(-3)}`,
    description: cleanMultiline(body.description, 900) || "A QueenFizzie ritual.",
    category: cleanText(body.category, 60) || "Skincare",
    price,
    old_price: body.oldPrice ? readInt(body.oldPrice, 0) || null : null,
    image: primaryImage,
    images: normalizedImages.length ? normalizedImages : [primaryImage],
    stock,
    low_stock_at: Math.max(1, readInt(body.lowStockAt, 5)),
    status,
    featured: Boolean(body.featured),
    variant_title: variantTitleFor(body.variantTitle ?? body.variant_title),
  };

  if (product.old_price && product.old_price <= product.price) product.old_price = null;

  const productWithoutTitle = { ...product };
  delete productWithoutTitle.variant_title;
  let { data, error } = await session.supabase
    .from("products")
    .insert(product)
    .select("*")
    .single();

  // A database that has not run the latest schema.sql yet has no variant_title
  // column; the product still saves and the heading falls back to "Options".
  if (isMissingColumn(error, "variant_title")) {
    ({ data, error } = await session.supabase
      .from("products")
      .insert(productWithoutTitle)
      .select("*")
      .single());
  }

  if (error) return dbError(res, error, "We could not create that product.");

  if (variantOptions.length) {
    try {
      await syncProductVariants(session.supabase, data.id, variantOptions, {
        replace: true,
      });
    } catch (variantError) {
      return dbError(
        res,
        variantError,
        "The product was created, but its options could not be saved."
      );
    }
  }

  if (status === "ACTIVE") {
    const { data: customers } = await session.supabase
      .from("profiles")
      .select("id")
      .eq("role", "CUSTOMER")
      .eq("marketing_opt_in", true);

    if (customers?.length) {
      await session.supabase.from("notifications").insert(
        customers.map((customer) => ({
          user_id: customer.id,
          audience: "USER",
          type: "PRODUCT",
          title: `New drop: ${product.title}`,
          body: `${product.title} is live in ${product.category}. Take a look before it sells out.`,
          href: `/ProductPreview?id=${data.id}`,
        }))
      );
    }
  }

  return sendJson(res, 201, { product: toAdminProduct(await reloadProduct(session.supabase, data)) });
}

async function reloadProduct(supabase, fallback) {
  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", fallback.id)
    .maybeSingle();
  return data || fallback;
}
