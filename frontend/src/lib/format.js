export function formatPrice(cents) {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "$—";
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString();
  } catch {
    return "";
  }
}
