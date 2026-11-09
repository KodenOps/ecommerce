import {
  allowMethods,
  dbError,
  readInt,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import productRepo from "@/data/product_repo";
import { cleanMultiline, cleanText, slugify } from "@/lib/validation";
import {
  isMissingColumn,
  normalizeVariantOptions,
  syncVariantGroups,
} from "@/lib/variants";

const MAX_ITEMS = 1000;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=768&q=80";

function getRepoEntries(bodyItems) {
  if (Array.isArray(bodyItems) && bodyItems.length) return bodyItems.slice(0, MAX_ITEMS);
  if (!Array.isArray(productRepo)) return [];

  return productRepo
    .flatMap((entry) => {
      if (Array.isArray(entry?.products)) return entry.products;
      if (Array.isArray(entry)) return entry;
      return [entry];
    })
    .slice(0, MAX_ITEMS);
}

function toStock(value, fallback = 25) {
  const stock = Number(value);
  return Number.isFinite(stock) && stock >= 0 ? Math.round(stock) : fallback;
}

function toPrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? Math.round(price) : 0;
}

function compareAtFor(item, price) {
  const compareAt = toPrice(
    item?.compare_at ?? item?.compareAt ?? item?.old_price ?? item?.oldPrice
  );
  return compareAt > price ? compareAt : null;
}

function imageListFor(item, fallback) {
  const candidates = [
    cleanText(item?.image_url || item?.image, 500),
    ...(Array.isArray(item?.images) ? item.images.map((value) => cleanText(value, 500)) : []),
  ].filter(Boolean);

  const images = [...new Set(candidates)].slice(0, 3);
  return images.length ? images : [fallback];
}

function buildVariantRows(item, fallbackPrice) {
  const rawSizes = Array.isArray(item?.sizes) ? item.sizes : [];

  if (!rawSizes.length) {
    return [
      {
        value: "default",
        label: "Standard",
        price: toPrice(item?.selling_price ?? item?.price ?? fallbackPrice),
        stock: toStock(item?.stock ?? item?.unit, 25),
        is_default: true,
        meta: [],
      },
    ];
  }

  // An option the admin marked as default wins; otherwise the option that
  // matches the product price, so the card and the picker agree.
  const markedDefault = rawSizes.findIndex((size) =>
    Boolean(size?.is_default ?? size?.isDefault)
  );
  const priceIndex = rawSizes.findIndex(
    (size) => toPrice(size?.price) === fallbackPrice
  );
  const chosenDefault = markedDefault >= 0 ? markedDefault : priceIndex >= 0 ? priceIndex : 0;

  return rawSizes.map((size, index) => ({
    value: cleanText(size?.value || size?.label, 80) || `size-${index + 1}`,
    label: cleanText(size?.label || size?.value, 80) || `Size ${index + 1}`,
    price: toPrice(size?.price ?? item?.selling_price ?? item?.price),
    stock: toStock(size?.stock ?? item?.stock ?? item?.unit, 25),
    is_default: index === chosenDefault,
    meta: Array.isArray(size?.meta) ? size.meta : [],
  }));
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  try {
    const entries = getRepoEntries(req.body?.items);
    if (!entries.length) {
      return sendJson(res, 400, { error: "There are no repo items to sync." });
    }

    const skus = entries.map((item, index) =>
      cleanText(item?.id || item?.sku, 40) || `REPO-${index + 1}`
    );
    const uniqueSkus = [...new Set(skus)];

    const { data: existingRows, error: lookupError } = await session.supabase
      .from("products")
      .select("id, sku, slug, status, image, images, featured, rating_rate, rating_count")
      .in("sku", uniqueSkus);

    if (lookupError) {
      return dbError(res, lookupError, "We could not read the current catalogue.");
    }

    const existingBySku = new Map(
      (existingRows || []).map((row) => [String(row.sku), row])
    );

    let inserted = 0;
    let updated = 0;

    const rows = entries.map((item, index) => {
      const sku = skus[index];
      const existing = existingBySku.get(sku) || null;
      const title = cleanText(item?.name || item?.title, 120) || "Untitled product";
      const price = toPrice(item?.selling_price ?? item?.price);
      const category = cleanText(item?.category, 60) || "Skincare";
      const brand = cleanText(item?.brand, 80) || "QueenFizzie";
      const images = imageListFor(item, existing?.image || FALLBACK_IMAGE);
      const image = images[0] || FALLBACK_IMAGE;
      const slug =
        existing?.slug ||
        `${slugify(title) || "product"}-${slugify(sku) || `item-${index + 1}`}`.slice(0, 90);
      const listed = typeof item?.listed === "boolean" ? item.listed : null;
      const status = listed === null ? existing?.status || "ACTIVE" : listed ? "ACTIVE" : "DRAFT";
      // Only overwrite the heading when the repo item carries one, so a title
      // set on the product page survives a bulk repo sync.
      const variantTitle = cleanText(
        item?.variantTitle ?? item?.variant_title,
        60
      );

      if (existing) updated += 1;
      else inserted += 1;

      return {
        title,
        slug,
        sku,
        description:
          cleanMultiline(item?.description, 900) || `${brand} • ${category}`,
        category,
        price,
        // Never use cost price as a compare-at price. Only an explicit
        // compare-at value above the selling price is a real discount.
        old_price: compareAtFor(item, price),
        image,
        images,
        stock: toStock(item?.stock ?? item?.unit, 25),
        low_stock_at: Math.max(1, readInt(item?.lowStockAt ?? item?.low_stock_at, 5)),
        ...(variantTitle ? { variant_title: variantTitle } : {}),
        status,
        featured: existing?.featured ?? Boolean(item?.featured),
        rating_rate: existing?.rating_rate ?? 4.8,
        rating_count: existing?.rating_count ?? 0,
      };
    });

    let { data: savedRows, error: saveError } = await session.supabase
      .from("products")
      .upsert(rows, { onConflict: "sku" })
      .select("id, sku, status");

    // A database that has not run the latest schema.sql yet has no variant_title
    // column; sync the catalogue anyway and keep the default heading.
    if (isMissingColumn(saveError, "variant_title")) {
      const withoutTitle = rows.map((row) => {
        const copy = { ...row };
        delete copy.variant_title;
        return copy;
      });
      ({ data: savedRows, error: saveError } = await session.supabase
        .from("products")
        .upsert(withoutTitle, { onConflict: "sku" })
        .select("id, sku, status"));
    }

    if (saveError) {
      return dbError(res, saveError, "We could not sync the repo to the catalogue.");
    }

    const productBySku = new Map(
      (savedRows || []).map((row) => [String(row.sku), row])
    );

    const groups = entries
      .map((item, index) => {
        const product = productBySku.get(skus[index]);
        if (!product) return null;

        const price = toPrice(item?.selling_price ?? item?.price);
        return {
          productId: product.id,
          options: normalizeVariantOptions(buildVariantRows(item, price), price),
        };
      })
      .filter(Boolean);

    try {
      // replace: an option removed in the repo editor disappears from the shop.
      await syncVariantGroups(session.supabase, groups, { replace: true });
    } catch (variantError) {
      return dbError(
        res,
        variantError,
        "We could not sync the product options for the repo."
      );
    }

    const active = (savedRows || []).filter((row) => row.status === "ACTIVE").length;

    return sendJson(res, 200, {
      ok: true,
      synced: { inserted, updated, active, total: entries.length },
      message: `Synced ${entries.length} repo items — ${active} live in the shop.`,
    });
  } catch (error) {
    return dbError(res, error, "We could not sync the product repo into the database.");
  }
}
