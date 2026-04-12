import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import { productHighlights, stockMeta } from "../lib/productMeta.js";

/** @param {{ score: number; dark?: boolean }} props */
function EcoDots({ score, dark }) {
  const n = Math.min(5, Math.max(0, Number(score) || 0));
  const filled = dark ? "bg-white/80" : "bg-apple-nearBlack";
  const empty = dark ? "bg-white/25" : "bg-black/15";
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < n ? filled : empty}`} />
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
 *   darkSection?: boolean;
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
  darkSection = false,
}) {
  const highlights = productHighlights(p.highlights).slice(0, maxHighlights);
  const stock = stockMeta(p.stock ?? 0);

  const shell = `group flex flex-col h-full rounded-lg overflow-hidden shadow-apple-card ${darkSection ? "bg-apple-surface1" : "bg-white"}`;

  const titleCls = darkSection ? "font-display text-[1.31rem] font-bold text-white leading-[1.19] tracking-[0.231px] line-clamp-2" : "font-display text-[1.31rem] font-bold text-ink-950 leading-[1.19] tracking-[0.231px] line-clamp-2";
  const subtitleCls = darkSection ? "text-caption text-white/75 mt-1 line-clamp-1 tracking-[-0.224px]" : "text-caption text-apple-textSecondary mt-1 line-clamp-1 tracking-[-0.224px]";
  const descCls = darkSection ? "text-caption text-white/65 line-clamp-2 mt-2 leading-[1.29] tracking-[-0.224px]" : "text-caption text-apple-textSecondary line-clamp-2 mt-2 leading-[1.29] tracking-[-0.224px]";
  const priceCls = darkSection ? "text-[1.31rem] font-display font-semibold text-white tabular-nums shrink-0" : "text-[1.31rem] font-display font-semibold text-ink-950 tabular-nums shrink-0";
  const ecoLabelCls = darkSection ? "text-micro text-white/70 mt-1" : "text-micro text-apple-textSecondary mt-1";
  const highlightChip = darkSection
    ? "text-micro leading-tight rounded-[5px] bg-white/12 text-white/90 px-2 py-1 max-w-full truncate"
    : "text-micro leading-tight rounded-[5px] bg-apple-gray text-ink-950 px-2 py-1 max-w-full truncate";
  const stockRing = darkSection ? "ring-1 ring-white/15" : "ring-1 ring-black/[0.06]";

  return (
    <Link
      to={to}
      className={shell}
      data-testid={linkTestId}
      data-image-state={p.imageUrl ? "present" : "missing"}
    >
      <div className={`relative ${imageAspectClass} bg-apple-gray overflow-hidden shrink-0`}>
        <ProductImage
          src={p.imageUrl}
          className={imageClassName}
          testId={imageTestId}
          wrapClassName="h-full w-full min-h-0"
        />
        <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          {p.category ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-micro font-semibold uppercase tracking-wide ${darkSection ? "bg-black/40 text-white/90 backdrop-blur-sm" : "bg-white/92 text-apple-textSecondary backdrop-blur-sm"} ${stockRing}`}
            >
              {p.category}
            </span>
          ) : (
            <span />
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-micro font-semibold uppercase tracking-wide backdrop-blur-sm ${stock.badgeClass} ${stockRing}`}
          >
            {stock.label}
          </span>
        </div>
        {stock.tone === "out" && (
          <div className={`absolute inset-0 pointer-events-none ${darkSection ? "bg-black/35" : "bg-black/20"}`} aria-hidden />
        )}
      </div>

      <div className={`p-5 flex flex-col flex-1 min-h-0 ${darkSection ? "bg-apple-surface1" : "bg-white"}`}>
        <h2 className={titleCls}>{p.name}</h2>
        {p.subtitle ? <p className={subtitleCls}>{p.subtitle}</p> : null}
        <p className={descCls}>{p.description}</p>

        {highlights.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Highlights">
            {highlights.map((h) => (
              <li key={h} className={highlightChip}>
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div data-testid={`product-card-eco-${p.id}`}>
            <EcoDots score={p.ecoScore ?? 0} dark={darkSection} />
            <p className={ecoLabelCls}>
              Green index: {p.ecoScore ?? 0}/5
            </p>
          </div>
          <p className={priceCls} data-testid={`product-price-${p.id}`}>
            ${(p.priceCents / 100).toFixed(2)}
          </p>
        </div>

        {!featured && (
          <p className={`text-micro mt-3 ${darkSection ? "text-apple-linkDark group-hover:underline" : "text-apple-link group-hover:underline"}`}>
            View details →
          </p>
        )}
      </div>
    </Link>
  );
}
