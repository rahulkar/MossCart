import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api("/api/products"),
    select: (list) => list?.slice(0, 3) ?? [],
  });

  return (
    <div data-testid="page-home">
      <section
        className="bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950 text-white"
        data-testid="home-hero-section"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <p className="text-teal-300 text-sm font-semibold tracking-wide uppercase mb-3" data-testid="home-eyebrow">
            Planted tank focus
          </p>
          <h1
            className="font-display text-4xl md:text-5xl font-bold max-w-2xl leading-[1.15] text-balance"
            data-testid="home-hero-title"
          >
            Moss, stone, and supplies for aquascapes.
          </h1>
          <p
            className="mt-5 text-slate-300 max-w-2xl text-base sm:text-lg leading-relaxed text-pretty"
            data-testid="home-hero-subtitle"
          >
            Build iwagumi layouts, moss walls, and lush carpets — everything here is geared toward freshwater planted
            tanks.
          </p>
          <p className="mt-4 text-emerald-300/90 text-sm max-w-xl leading-relaxed" data-testid="home-green-pitch">
            Every listing shows a Green Index score so you can favor lower-impact moss, stone, and supply lines at a
            glance.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center mt-10 rounded-lg bg-teal-400 text-slate-950 px-6 py-3 text-sm font-semibold hover:bg-teal-300 transition shadow-lg shadow-teal-950/20"
            data-testid="home-cta-shop"
          >
            Shop catalog
          </Link>
        </div>
      </section>

      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 border-t border-slate-200/80 bg-white/60"
        data-testid="home-value-props"
      >
        <h2
          className="font-display text-2xl md:text-[1.35rem] font-semibold text-ink-950 mb-2 text-balance"
          data-testid="home-values-heading"
        >
          What we offer
        </h2>
        <p className="text-slate-500 text-sm max-w-2xl mb-8 leading-relaxed">
          Mosses, aquascaping stone, and maintenance supplies — browse by category or filter by sustainability signals.
        </p>
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
          <li
            className="flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            data-testid="home-value-fast"
          >
            <strong className="text-ink-950 font-semibold text-base">Moss &amp; hardscape</strong>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
              Live mosses and layout stone in one place, so you can plan carpets and hardscape together.
            </p>
          </li>
          <li
            className="flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            data-testid="home-value-mock"
          >
            <strong className="text-ink-950 font-semibold text-base">Safe checkout flow</strong>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
              Practice the full cart-to-confirmation path with a mock payment — no real card data.
            </p>
          </li>
          <li
            className="flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2 md:col-span-1"
            data-testid="home-value-eco"
          >
            <strong className="text-ink-950 font-semibold text-base">Green index</strong>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
              Each product carries an eco score for quick comparison when you care about sourcing and impact.
            </p>
          </li>
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <h2
          className="font-display text-2xl font-semibold text-ink-950 mb-2 text-balance"
          data-testid="home-featured-heading"
        >
          Featured picks
        </h2>
        <p className="text-slate-500 text-sm mb-8 max-w-2xl">A few popular listings from the catalog.</p>
        {isLoading && (
          <p className="text-slate-500" data-testid="home-featured-loading">
            Loading…
          </p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch" data-testid="home-featured-grid">
          {products?.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              linkTestId={`home-featured-${p.id}`}
              imageTestId={`home-featured-img-${p.id}`}
              imageAspectClass="aspect-[4/3]"
              maxHighlights={2}
              featured
            />
          ))}
        </div>
      </section>
    </div>
  );
}
