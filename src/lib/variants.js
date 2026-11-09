import { cleanText, slugify } from "@/lib/validation";

const MAX_OPTIONS = 40;
const FALLBACK_TITLE = "Options";

/** True when Postgres rejects a write because a column does not exist yet. */
export function isMissingColumn(error, column) {
  if (!error || !column) return false;
  const message = `${error.message || ""} ${error.details || ""}`;
  return (
    new RegExp(`\\b${column}\\b`, "i").test(message) &&
    (error.code === "PGRST204" || error.code === "42703")
  );
}

/** The heading a product shows above its options, e.g. "Colour". */
export function variantTitleFor(value) {
  return cleanText(value, 60) || FALLBACK_TITLE;
}

function cleanMeta(meta) {
  if (!Array.isArray(meta)) return [];
  return meta
    .filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        String(entry.key ?? "").trim() &&
        String(entry.value ?? "").trim()
    )
    .map((entry) => ({
      key: String(entry.key).trim(),
      value: String(entry.value).trim(),
    }));
}

/**
 * Turn whatever an editor sent into variant rows the database accepts.
 * An option is one selectable variation of the product with its own price
 * (e.g. the title is "Colour" and the option is "red: 5000").
 */
export function normalizeVariantOptions(raw, fallbackPrice = 0) {
  const list = Array.isArray(raw) ? raw.slice(0, MAX_OPTIONS) : [];
  const usedValues = new Set();
  const options = [];

  list.forEach((item, index) => {
    if (!item || typeof item !== "object") return;

    const label = cleanText(item.label ?? item.name ?? item.value, 80);
    if (!label) return;

    const base =
      cleanText(item.value, 80) ||
      slugify(label) ||
      `option-${index + 1}`;
    let value = base;
    let suffix = 2;
    while (usedValues.has(value)) {
      value = `${base}-${suffix}`;
      suffix += 1;
    }
    usedValues.add(value);

    const price = Math.round(Number(item.price ?? fallbackPrice) || 0);

    options.push({
      value,
      label,
      price: Math.max(0, price),
      stock: Math.max(0, Math.round(Number(item.stock ?? 0) || 0)),
      is_default: Boolean(item.is_default ?? item.isDefault),
      meta: cleanMeta(item.meta),
    });
  });

  if (options.length) {
    const defaultIndex = options.findIndex((option) => option.is_default);
    const chosen = defaultIndex >= 0 ? defaultIndex : 0;
    options.forEach((option, index) => {
      option.is_default = index === chosen;
    });
  }

  return options;
}

const MAX_WRITE_CHUNK = 500;

function chunk(list, size = MAX_WRITE_CHUNK) {
  const chunks = [];
  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }
  return chunks;
}

function withoutMeta(row) {
  const copy = { ...row };
  delete copy.meta;
  return copy;
}

/**
 * Make product_variants match the options the admin just saved. Rows are
 * upserted on (product_id, value), so an option that already exists keeps its
 * id and stock, and — when the caller replaces the list — the options that were
 * removed in the editor are deleted.
 *
 * `groups` is [{ productId, options }]; passing many groups keeps the whole
 * repo sync to a handful of round trips.
 */
export async function syncVariantGroups(supabase, groups, { replace = false } = {}) {
  const entries = (Array.isArray(groups) ? groups : []).filter(
    (group) => group && group.productId
  );

  if (!entries.length) return { saved: 0, removed: 0 };

  const rows = entries.flatMap(({ productId, options }) =>
    (Array.isArray(options) ? options : []).map((option) => ({
      product_id: productId,
      value: option.value,
      label: option.label,
      price: option.price,
      stock: option.stock,
      is_default: Boolean(option.is_default),
      meta: Array.isArray(option.meta) ? option.meta : [],
    }))
  );

  if (!rows.length && !replace) return { saved: 0, removed: 0 };

  const productIds = entries.map((entry) => String(entry.productId));
  const keep = new Set(rows.map((row) => `${row.product_id}:${row.value}`));

  const { data: existingRows, error: readError } = await supabase
    .from("product_variants")
    .select("id, product_id, value")
    .in("product_id", productIds);

  if (readError) throw readError;

  const removedIds = replace
    ? (existingRows || [])
        .filter((row) => !keep.has(`${row.product_id}:${row.value}`))
        .map((row) => row.id)
    : [];

  if (rows.length) {
    for (const batch of chunk(rows)) {
      let { error: upsertError } = await supabase
        .from("product_variants")
        .upsert(batch, { onConflict: "product_id,value" });

      if (isMissingColumn(upsertError, "meta")) {
        ({ error: upsertError } = await supabase
          .from("product_variants")
          .upsert(batch.map(withoutMeta), { onConflict: "product_id,value" }));
      }

      if (upsertError) throw upsertError;
    }
  }

  for (const batch of chunk(removedIds, 200)) {
    const { error: deleteError } = await supabase
      .from("product_variants")
      .delete()
      .in("id", batch);

    if (deleteError) throw deleteError;
  }

  return { saved: rows.length, removed: removedIds.length };
}

/** Sync the options of a single product. */
export async function syncProductVariants(
  supabase,
  productId,
  options,
  { replace = false } = {}
) {
  if (!productId) return { saved: 0, removed: 0 };
  return syncVariantGroups(supabase, [{ productId, options }], { replace });
}
