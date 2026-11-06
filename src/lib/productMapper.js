/** Supabase rows → the camelCase shape the storefront consumes. */
export function toStoreProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    oldprice: row.old_price ?? null,
    description: row.description,
    category: row.category,
    image: row.image,
    rating: { rate: Number(row.rating_rate ?? 4.8), count: row.rating_count ?? 0 },
    stock: row.stock ?? 0,
    lowStockAt: row.low_stock_at ?? 5,
    sku: row.sku,
    slug: row.slug,
    status: row.status,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
  };
}

export function toAdminProduct(row, sold = 0) {
  return { ...toStoreProduct(row), sold };
}

export function toOrderItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    sku: row.sku,
    price: row.unit_price,
    qty: row.qty,
    lineTotal: row.line_total,
    image: row.image,
  };
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
    items: (row.order_items || []).map(toOrderItem),
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
