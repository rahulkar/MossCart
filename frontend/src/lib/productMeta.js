/** @param {unknown} raw */
export function productHighlights(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((h) => typeof h === "string" && h.trim());
}

/** @returns {{ label: string, value: string }[]} */
export function productSpecs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row) => row && typeof row === "object" && typeof row.label === "string" && typeof row.value === "string")
    .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
    .filter((row) => row.label && row.value);
}

/** @param {number} stock */
export function stockMeta(stock) {
  if (stock <= 0) {
    return { label: "Out of stock", tone: "out", badgeClass: "bg-slate-800/85 text-white" };
  }
  if (stock <= 5) {
    return { label: "Low stock", tone: "low", badgeClass: "bg-amber-500/90 text-white" };
  }
  return { label: "In stock", tone: "ok", badgeClass: "bg-white/90 text-slate-700" };
}
