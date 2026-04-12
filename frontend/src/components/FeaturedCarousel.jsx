import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard.jsx";

const AUTO_MS = 4500;

function readGapPx(el) {
  const g = getComputedStyle(el).gap || getComputedStyle(el).columnGap || "0";
  const n = parseFloat(g);
  return Number.isFinite(n) ? n : 24;
}

/**
 * @param {{
 *   products: Array<Record<string, unknown> & { id: string }>;
 *   isLoading?: boolean;
 * }} props
 */
export default function FeaturedCarousel({ products, isLoading }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const syncScroll = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);
    const left = root.scrollLeft;
    setCanPrev(left > 8);
    setCanNext(left < maxScroll - 8);

    const slides = root.querySelectorAll("[data-carousel-slide]");
    if (!slides.length) return;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const d = Math.abs(slide.offsetLeft - left);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  const stepSize = useCallback(() => {
    const root = scrollerRef.current;
    const slide = root?.querySelector("[data-carousel-slide]");
    if (!root || !slide) return 0;
    return slide.offsetWidth + readGapPx(root);
  }, []);

  const advance = useCallback(() => {
    const root = scrollerRef.current;
    if (!root || !products?.length) return;
    const maxScroll = root.scrollWidth - root.clientWidth;
    if (maxScroll <= 0) return;
    const step = stepSize();
    if (step <= 0) return;
    if (root.scrollLeft >= maxScroll - 12) {
      root.scrollTo({ left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    } else {
      root.scrollBy({ left: step, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [products?.length, reducedMotion, stepSize]);

  useEffect(() => {
    if (isLoading || !products?.length || products.length <= 1 || reducedMotion) return;
    const root = scrollerRef.current;
    if (!root) return;
    let paused = false;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);
    const id = setInterval(() => {
      if (!paused) advance();
    }, AUTO_MS);
    return () => {
      clearInterval(id);
      root.removeEventListener("mouseenter", pause);
      root.removeEventListener("mouseleave", resume);
    };
  }, [isLoading, products?.length, advance, reducedMotion]);

  useEffect(() => {
    syncScroll();
  }, [products, syncScroll]);

  const scrollPrev = () => {
    const root = scrollerRef.current;
    const step = stepSize();
    if (!root || step <= 0) return;
    root.scrollBy({ left: -step, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const scrollNext = () => {
    const root = scrollerRef.current;
    const step = stepSize();
    if (!root || step <= 0) return;
    root.scrollBy({ left: step, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const scrollToIndex = useCallback(
    (i, behavior = "smooth") => {
      const root = scrollerRef.current;
      if (!root) return;
      const slides = root.querySelectorAll("[data-carousel-slide]");
      const el = slides[i];
      if (!el) return;
      root.scrollTo({
        left: el.offsetLeft,
        behavior: reducedMotion ? "auto" : behavior,
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => syncScroll());
    ro.observe(root);
    return () => ro.disconnect();
  }, [syncScroll, products]);

  if (isLoading) {
    return (
      <p className="text-white/60 text-caption" data-testid="home-featured-loading">
        Loading…
      </p>
    );
  }

  if (!products?.length) {
    return null;
  }

  return (
    <div className="relative" data-testid="home-featured-carousel">
      <div className="flex justify-end gap-2 mb-4">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canPrev}
          className="h-9 w-9 rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-40 disabled:pointer-events-none text-lg leading-none"
          aria-label="Previous featured products"
          data-testid="home-featured-prev"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canNext}
          className="h-9 w-9 rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-40 disabled:pointer-events-none text-lg leading-none"
          aria-label="Next featured products"
          data-testid="home-featured-next"
        >
          ›
        </button>
      </div>

      <div
        ref={scrollerRef}
        onScroll={syncScroll}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
        style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent" }}
        data-testid="home-featured-grid"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured products"
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-carousel-slide
            className="snap-start shrink-0 w-[min(100%,18rem)] sm:w-[min(100%,20rem)] lg:w-[22rem]"
          >
            <ProductCard
              product={p}
              linkTestId={`home-featured-${p.id}`}
              imageTestId={`home-featured-img-${p.id}`}
              imageAspectClass="aspect-[4/3]"
              maxHighlights={2}
              featured
              darkSection
            />
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActive(i);
                scrollToIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/50"}`}
              aria-label={`Go to slide ${i + 1}`}
              data-testid={`home-featured-dot-${i}`}
            />
          ))}
        </div>
      )}

      <p className="text-center text-micro text-white/45 mt-3 tracking-[-0.12px]">
        {reducedMotion
          ? "Scroll sideways to see more."
          : "Auto-advances every few seconds — pauses while you hover. Scroll or use arrows."}
      </p>
    </div>
  );
}
