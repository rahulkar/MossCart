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
    <div className="w-full min-w-0" data-testid="page-home">
      <section className="bg-apple-black text-white" data-testid="home-hero-section">
        <div className="layout-container py-20 md:py-28 md:min-h-[70vh] flex flex-col justify-center">
          <p
            className="text-caption text-white/80 font-normal tracking-[-0.224px] mb-3"
            data-testid="home-eyebrow"
          >
            Planted tank focus
          </p>
          <h1
            className="font-display text-[2rem] sm:text-[2.5rem] md:text-display-hero font-semibold max-w-2xl xl:max-w-4xl 2xl:max-w-5xl text-balance text-white tracking-[-0.28px] leading-[1.07] md:leading-[1.07]"
            data-testid="home-hero-title"
          >
            Moss, stone, and supplies for aquascapes.
          </h1>
          <p
            className="mt-5 text-[1.31rem] font-normal leading-[1.19] tracking-[0.231px] text-white/90 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl text-pretty"
            data-testid="home-hero-subtitle"
          >
            Build iwagumi layouts, moss walls, and lush carpets — everything here is geared toward freshwater planted
            tanks.
          </p>
          <p
            className="mt-4 text-caption text-white/70 max-w-xl leading-[1.29] tracking-[-0.224px]"
            data-testid="home-green-pitch"
          >
            Every listing shows a Green Index score so you can favor lower-impact moss, stone, and supply lines at a
            glance.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover border border-transparent"
              data-testid="home-cta-shop"
            >
              Shop catalog
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-[980px] border border-apple-linkDark px-5 py-2 text-caption text-apple-linkDark hover:underline"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-apple-gray text-ink-950" data-testid="home-value-props">
        <div className="layout-container py-16 md:py-24">
          <h2
            className="font-display text-section-heading font-semibold text-ink-950 mb-2 text-balance max-w-2xl"
            data-testid="home-values-heading"
          >
            What we offer
          </h2>
          <p className="text-apple-textSecondary text-caption max-w-2xl mb-10 leading-[1.29] tracking-[-0.224px]">
            Mosses, aquascaping stone, and maintenance supplies — browse by category or filter by sustainability signals.
          </p>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 xl:gap-8 items-stretch">
            <li
              className="flex flex-col h-full rounded-lg bg-white p-6 shadow-apple-card"
              data-testid="home-value-fast"
            >
              <strong className="text-tile-heading font-normal text-ink-950">Moss &amp; hardscape</strong>
              <p className="mt-3 text-caption text-apple-textSecondary leading-[1.29] tracking-[-0.224px] flex-1">
                Live mosses and layout stone in one place, so you can plan carpets and hardscape together.
              </p>
            </li>
            <li
              className="flex flex-col h-full rounded-lg bg-white p-6 shadow-apple-card"
              data-testid="home-value-mock"
            >
              <strong className="text-tile-heading font-normal text-ink-950">Safe checkout flow</strong>
              <p className="mt-3 text-caption text-apple-textSecondary leading-[1.29] tracking-[-0.224px] flex-1">
                Practice the full cart-to-confirmation path with a mock payment — no real card data.
              </p>
            </li>
            <li
              className="flex flex-col h-full rounded-lg bg-white p-6 shadow-apple-card sm:col-span-2 md:col-span-1"
              data-testid="home-value-eco"
            >
              <strong className="text-tile-heading font-normal text-ink-950">Green index</strong>
              <p className="mt-3 text-caption text-apple-textSecondary leading-[1.29] tracking-[-0.224px] flex-1">
                Each product carries an eco score for quick comparison when you care about sourcing and impact.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-apple-black text-white py-16 md:py-24">
        <div className="layout-container">
          <h2
            className="font-display text-[2rem] md:text-section-heading font-semibold mb-2 text-balance text-white leading-[1.1]"
            data-testid="home-featured-heading"
          >
            Featured picks
          </h2>
          <p className="text-caption text-white/70 mb-10 max-w-2xl leading-[1.29] tracking-[-0.224px]">
            A few popular listings from the catalog.
          </p>
          {isLoading && (
            <p className="text-white/60 text-caption" data-testid="home-featured-loading">
              Loading…
            </p>
          )}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10 items-stretch"
            data-testid="home-featured-grid"
          >
            {products?.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                linkTestId={`home-featured-${p.id}`}
                imageTestId={`home-featured-img-${p.id}`}
                imageAspectClass="aspect-[4/3]"
                maxHighlights={2}
                featured
                darkSection
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
