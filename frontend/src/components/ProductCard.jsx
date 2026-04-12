import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import { productHighlights, stockMeta } from "../lib/productMeta.js";

/** @param {{ score: number }} props */
function EcoDots({ score }) {
  const n = Math.min(5, Math.max(0, Number(score) || 0));
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < n ? "bg-emerald-500" : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
}

/**
 * @param {{
 *   product: Record<string, unknown> & { id: string; name: string; priceCents: number; imageUrl?: string; category?: string; ecoScore?: number; stock?: number; description?: string; subtitle?: string; highlights?: unknown };
 *   to?: string;
 *   linkTestId: string;
 *   imageTestId: string;
 *   imageAspectClass?: string;
 *   imageClassName?: string;
 *   maxHighlights?: number;
 *   featured?: boolean;
 * }} props
 */
export default function ProductCard({
  product: p,
  to = `/products/${p.id}`,
  linkTestId,
  imageTestId,
  imageAspectClass = "aspect-square",
  imageClassName = "w-full h-full object-cover",
  maxHighlights = 2,
  featured = false,
}) {
  const highlights = productHighlights(p.highlights).slice(0, maxHighlights);
  const stock = stockMeta(p.stock ?? 0);

  const shell = featured
    ? "group flex flex-col h-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-teal-200/80 transition duration-300"
    : "group flex flex-col h-full rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200/80 hover:-translate-y-0.5 transition-all duration-300";

  return (
    <Link
      to={to}
      className={shell}
      data-testid={linkTestId}
      data-image-state={p.imageUrl ? "present" : "missing"}
    >
      <div
        className={`relative ${imageAspectClass} bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/40 overflow-hidden shrink-0`}
      >
        <ProductImage
          src={p.imageUrl}
          className={featured ? `${imageClassName} group-hover:scale-105 transition duration-300` : `${imageClassName} group-hover:scale-[1.03] transition duration-500`}
          testId={imageTestId}
          wrapClassName="h-full w-full min-h-0"
        />
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          {p.category ? (
            <span className="rounded-full bg-white/92 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm ring-1 ring-slate-200/60">
              {p.category}
            </span>
          ) : (
            <span />
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm ${stock.badgeClass} ring-1 ring-black/5`}
          >
            {stock.label}
          </span>
        </div>
        {stock.tone === "out" && (
          <div className="absolute inset-0 bg-slate-900/25 pointer-events-none" aria-hidden />
        )}
      </div>

      <div
        className={`p-5 flex flex-col flex-1 min-h-0 ${featured ? "" : "border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/40"}`}
      >
        <h2 className="font-display font-semibold text-ink-950 leading-snug line-clamp-2">{p.name}</h2>
        {p.subtitle ? (
          <p className="text-sm text-teal-800/85 font-medium mt-1 line-clamp-1">{p.subtitle}</p>
        ) : null}
        <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">{p.description}</p>

        {highlights.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Highlights">
            {highlights.map((h) => (
              <li
                key={h}
                className="text-[11px] leading-tight rounded-md bg-emerald-50/90 text-emerald-900 px-2 py-1 border border-emerald-100/90 max-w-full truncate"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div data-testid={`product-card-eco-${p.id}`}>
            <EcoDots score={p.ecoScore ?? 0} />
            <p className="text-xs text-emerald-700 font-medium mt-1">Green index: {p.ecoScore ?? 0}/5</p>
          </div>
          <p className="text-lg font-display font-semibold text-accent tabular-nums shrink-0" data-testid={`product-price-${p.id}`}>
            ${(p.priceCents / 100).toFixed(2)}
          </p>
        </div>

        {!featured && (
          <p className="text-xs text-slate-400 mt-3 group-hover:text-teal-600 transition-colors">View details →</p>
        )}
      </div>
    </Link>
  );
}
