/** @param {unknown} raw */
export function productHighlights(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((h) => typeof h === "string" && h.trim());
}

/** @returns {{ label: string, value: string }[]} */
export function productSpecs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (row) =>
        row &&
        typeof row === "object" &&
        typeof row.label === "string" &&
        typeof row.value === "string"
    )
    .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
    .filter((row) => row.label && row.value);
}

/** @param {number} stock */
export function stockMeta(stock) {
  if (stock <= 0) {
    return { label: "Out of stock", tone: "out", badgeClass: "bg-apple-surface5/95 text-white" };
  }
  if (stock <= 5) {
    return { label: "Low stock", tone: "low", badgeClass: "bg-apple-surface3 text-white" };
  }
  return { label: "In stock", tone: "ok", badgeClass: "bg-white/92 text-apple-nearBlack" };
}
