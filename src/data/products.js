import Promo from "./Promo";

const catalog = Array.isArray(Promo) ? Promo : (Promo && Promo.default) || [];

export const products = catalog;

export function getProductById(id) {
  if (!Number.isFinite(id)) return null;
  return catalog.find((item) => item && item.id === id) || null;
}
