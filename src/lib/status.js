/** Single source of truth for order / payment lifecycle labels. */

export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

export const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: "Confirming Payment",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_HINTS = {
  PENDING_PAYMENT: "We are checking your transfer against the uploaded receipt.",
  PAYMENT_CONFIRMED: "Payment approved — your order is queued for packing.",
  PROCESSING: "Your order is being packed in Shomolu.",
  SHIPPED: "On the way with our courier partner.",
  DELIVERED: "Delivered. We hope you love it.",
  CANCELLED: "This order was cancelled.",
};

export const PAYMENT_STATUS_LABELS = {
  AWAITING_CONFIRMATION: "Awaiting confirmation",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const PAYMENT_STATUS = {
  AWAITING_CONFIRMATION: "AWAITING_CONFIRMATION",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
};

export function statusLabel(status) {
  return ORDER_STATUS_LABELS[status] || String(status || "").replace(/_/g, " ");
}

export function paymentLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || String(status || "").replace(/_/g, " ");
}

export function canTransition(from, to) {
  if (!ORDER_STATUS_LABELS[to]) return false;
  if (from === to) return false;
  if (from === ORDER_STATUS.DELIVERED || from === ORDER_STATUS.CANCELLED) return false;
  if (to === ORDER_STATUS.CANCELLED) return true;
  if (from === ORDER_STATUS.PENDING_PAYMENT) {
    return to === ORDER_STATUS.PAYMENT_CONFIRMED || to === ORDER_STATUS.PROCESSING;
  }
  const currentIndex = ORDER_STATUS_FLOW.indexOf(from);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(to);
  return currentIndex >= 0 && nextIndex > currentIndex;
}

export const NEXT_STATUSES = {
  PENDING_PAYMENT: [
    ORDER_STATUS.PAYMENT_CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.CANCELLED,
  ],
  PAYMENT_CONFIRMED: [ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  PROCESSING: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  SHIPPED: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
};
