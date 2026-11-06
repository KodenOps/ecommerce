export const DELIVERY_FEE = 3500;
export const FREE_DELIVERY_OVER = 150000;

/** Delivery is free once the bag reaches the threshold (or is empty). */
export function deliveryFeeFor(subtotal) {
  if (!subtotal || subtotal >= FREE_DELIVERY_OVER) return 0;
  return DELIVERY_FEE;
}
