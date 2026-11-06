const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Format a number as Nigerian Naira, e.g. 19000 -> ₦19,000 */
export function formatNaira(value) {
  return naira.format(Number(value) || 0);
}

export default formatNaira;
