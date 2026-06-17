import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * @param {{ open: boolean; onClose: () => void }} props
 */
export default function LearnMoreModal({ open, onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      data-testid="home-learn-more-modal"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full sm:max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-apple-gray text-ink-950 shadow-apple-card outline-none"
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-black/5 bg-apple-gray/95 px-5 py-4 backdrop-blur-sm">
          <h2
            id={titleId}
            className="font-display text-tile-heading font-semibold text-ink-950 leading-[1.14] pr-2"
          >
            About MossCart
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-micro text-ink-950 hover:bg-black/10"
            data-testid="home-learn-more-close"
          >
            Close
          </button>
        </div>
        <div className="px-5 py-5 space-y-4 text-body text-apple-textSecondary leading-[1.47] tracking-[-0.0234em]">
          <p>
            MossCart is a demo storefront built around freshwater planted tanks: live moss,
            aquascaping stone, and maintenance supplies in one catalog.
          </p>
          <p>
            <strong className="text-ink-950 font-semibold">Green Index</strong> is a simple 1–5
            score shown on each product so you can compare listings when you care about sourcing and
            environmental impact. It is merchandising data for this demo, not a third-party
            certification.
          </p>
          <p>
            Checkout uses a <strong className="text-ink-950 font-semibold">mock payment</strong>{" "}
            only — no real cards are charged. Use it to practice cart → shipping → confirmation end
            to end.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/products"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover border border-transparent"
              data-testid="home-learn-more-shop"
            >
              Browse products
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-[980px] border border-apple-link px-5 py-2 text-caption text-apple-link hover:underline"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
