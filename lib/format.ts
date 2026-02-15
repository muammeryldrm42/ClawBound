export function formatCompactUSD(n?: number) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "—";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2, style: "currency", currency: "USD" }).format(v);
}

export function formatPrice(n?: number) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "—";
  if (v >= 1) return "$" + v.toFixed(4);
  if (v >= 0.01) return "$" + v.toFixed(6);
  return "$" + v.toPrecision(3);
}

export function formatPct(n?: number) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return sign + v.toFixed(2) + "%";
}
