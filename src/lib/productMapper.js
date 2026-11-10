function safeParseMeta(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/** Supabase rows → the camelCase shape the storefront consumes. */
function normalizeSizeOption(size, fallbackPrice = 0) {
  if (!size || typeof size !== "object") return null;

  const value = String(size.value ?? size.label ?? size.size ?? "default");
  const label = String(size.label ?? size.value ?? size.size ?? value);
  const price = Number(size.price ?? size.amount ?? fallbackPrice ?? 0) || fallbackPrice || 0;
  const stock = Number(size.stock ?? 0) || 0;

  if (!value || !label) return null;

  const rawMeta = typeof size.meta === "string" ? safeParseMeta(size.meta) : size.meta;

  const meta =
    Array.isArray(rawMeta)
      ? rawMeta
          .filter(
            (item) =>
              typeof item === "object" &&
              String(item.key).trim() &&
              String(item.value).trim()
          )
          .map((item) => ({
            key: String(item.key).trim(),
            value: String(item.value).trim(),
          }))
      : [];

  return {
    value,
    label,
    price,
    stock,
    isDefault: Boolean(size.is_default ?? size.isDefault),
    meta,
  };
}

function normalizeSizes(row) {
  const rawSizes = Array.isArray(row?.sizes)
    ? row.sizes
    : Array.isArray(row?.product_variants)
      ? row.product_variants
      : Array.isArray(row?.size_options)
        ? row.size_options
        : Array.isArray(row?.variants)
          ? row.variants
          : [];

  const fallbackPrice = Number(row?.price ?? row?.selling_price ?? 0) || 0;
  const normalized = (rawSizes || [])
    .map((size) => normalizeSizeOption(size, fallbackPrice))
    .filter(Boolean);

  if (normalized.length > 0) {
    // The product price is the price the catalogue sorts and checks out at.
    // Keep the matching variant first so the default option, the card price
    // and the sort order all agree.
    const priceIndex = fallbackPrice > 0
      ? normalized.findIndex((size) => size.price === fallbackPrice)
      : -1;
    const defaultIndex = normalized.findIndex((size) => size.isDefault);
    const firstIndex = priceIndex >= 0 ? priceIndex : defaultIndex >= 0 ? defaultIndex : 0;

    if (firstIndex > 0) {
      const [first] = normalized.splice(firstIndex, 1);
      normalized.unshift(first);
    }

    return normalized;
  }

  if (fallbackPrice > 0 && (row?.title || row?.name)) {
    // A product with no saved options still sells at its own price. The flag
    // lets the admin editors tell this placeholder apart from a real option.
    return [{ value: "default", label: "Standard", price: fallbackPrice, stock: Number(row?.stock ?? 0) || 0, synthetic: true }];
  }

  return [];
}

function normalizeImageArray(row) {
  const rawImages = [];

  if (Array.isArray(row?.images)) {
    rawImages.push(...row.images);
  }
  if (Array.isArray(row?.image_urls)) {
    rawImages.push(...row.image_urls);
  }
  if (typeof row?.image === "string" && row.image.trim()) {
    rawImages.push(row.image);
  }
  if (typeof row?.image_url === "string" && row.image_url.trim()) {
    rawImages.push(row.image_url);
  }

  const cleaned = [...new Set(rawImages.map((value) => String(value || "").trim()).filter(Boolean))].slice(0, 3);
  return cleaned.length ? cleaned : [""];
}

export function toStoreProduct(row) {
  if (!row) return null;

  const sizes = normalizeSizes(row);
  const firstSize = sizes[0] || null;
  const price = Number(row.price ?? row.selling_price ?? firstSize?.price ?? 0) || 0;
  const compareAt = Number(row.old_price ?? row.compare_at ?? 0) || 0;
  const oldprice = compareAt > price ? compareAt : null;
  const images = normalizeImageArray(row);
  const primaryImage = images[0] || "";

  return {
    id: row.id,
    title: row.title || row.name || "Untitled product",
    price,
    oldprice,
    description: row.description || "",
    category: row.category,
    // The catalogue code this product points at (null for legacy free text).
    categoryCode: row.category_code || null,
    image: primaryImage,
    images,
    rating: { rate: Number(row.rating_rate ?? 4.8), count: row.rating_count ?? 0 },
    stock: row.stock ?? Number(row.unit ?? 0) ?? 0,
    lowStockAt: row.low_stock_at ?? 5,
    sku: row.sku || row.id,
    slug: row.slug,
    status: row.status,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    // "Colour", "Size", "Flavour" — the heading above the product's options.
    variantTitle: row.variant_title || "Options",
    sizes,
  };
}

export function toAdminProduct(row, sold = 0) {
  return { ...toStoreProduct(row), sold };
}

export function toOrderItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    variantValue: row.variant_value || null,
    variantLabel: row.variant_label || null,
    title: row.title,
    sku: row.sku,
    price: row.unit_price,
    qty: row.qty,
    lineTotal: row.line_total,
    image: row.image,
    variantAttributes: variantAttributesFor(row),
    variantDetail: variantDetailFor(row),
  };
}

/** "Colour = Rose, Amount = 4000" for the option on an order line. */
function variantAttributesFor(row) {
  const meta = Array.isArray(row.variant_meta)
    ? row.variant_meta
    : Array.isArray(row.meta)
      ? row.meta
      : [];
  return (meta || [])
    .filter(
      (item) =>
        typeof item === "object" &&
        String(item.key).trim() &&
        String(item.value).trim()
    )
    .map((item) => `${String(item.key).trim()} = ${String(item.value).trim()}`)
    .join(", ");
}

function variantDetailFor(row) {
  const product = row.product || row.product_name || null;
  const productTitle =
    product && typeof product === "object"
      ? (product.title || product.name || row.title || "")
      : product || (row.title || "");
  const label = row.variant_label || row.variantLabel || null;
  const attributes = variantAttributesFor(row);
  const parts = [productTitle];
  if (label && label !== productTitle) parts.push(label);
  if (attributes) parts.push(attributes);
  return parts.join(": ");
}

export function toOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotal: row.subtotal,
    discount: row.discount,
    delivery: row.delivery,
    total: row.total,
    promoCode: row.promo_code,
    placedAt: row.placed_at,
    paymentConfirmedAt: row.payment_confirmed_at,
    packedAt: row.packed_at,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    cancelledAt: row.cancelled_at,
    courier: row.courier,
    trackingNumber: row.tracking_number,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.address_line,
      city: row.city,
      state: row.state,
      notes: row.notes,
    },
    receipt: row.receipt_path
      ? {
          name: row.receipt_name,
          mime: row.receipt_mime,
          size: row.receipt_size,
          uploadedAt: row.receipt_uploaded_at,
        }
      : null,
    items: (row.order_items || []).map((item) => toOrderItem({ ...item, product: row })),
    events: (row.order_events || []).map((event) => ({
      id: event.id,
      type: event.type,
      message: event.message,
      actorName: event.actor_name,
      actorRole: event.actor_role,
      createdAt: event.created_at,
    })),
  };
}

export const ORDER_SELECT =
  "*, order_items(*), order_events(id, type, message, actor_name, actor_role, created_at)";

export function toNotification(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.read_at,
    createdAt: row.created_at,
    orderId: row.order_id,
    audience: row.audience,
  };
}
