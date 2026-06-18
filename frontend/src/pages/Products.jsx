import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const PAGE_SIZE = 12;

function buildQuery(q, category, ecoMin, page, pageSize) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (ecoMin) params.set("ecoMin", ecoMin);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return `?${params.toString()}`;
}

const filterControl =
  "w-full rounded-[11px] bg-apple-filterBg text-apple-textSecondary border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] font-normal focus:ring-2 focus:ring-accent focus:border-transparent outline-none";

export default function Products() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [ecoMin, setEcoMin] = useState("");
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api("/api/products/categories"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", q, category, ecoMin, page],
    queryFn: () => api(`/api/products${buildQuery(q, category, ecoMin, page, PAGE_SIZE)}`),
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-products">
        <h1
          className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]"
          data-testid="products-title"
        >
          All products
        </h1>
        <p className="text-apple-textSecondary mb-8 max-w-2xl xl:max-w-4xl leading-[1.47] tracking-[-0.0234em]">
          Browse moss, aquascaping stone, and maintenance supplies. Filter by category or Green
          Index (eco score) for sustainably sourced picks.
        </p>
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 mb-8 lg:items-end">
          <div className="flex-1 min-w-[min(100%,12rem)] lg:min-w-[200px] flex flex-col">
            <label
              htmlFor="product-search"
              className="block text-micro text-apple-textTertiary mb-1 tracking-[-0.12px]"
            >
              Search
            </label>
            <input
              id="product-search"
              type="search"
              placeholder="Name, SKU, or description…"
              value={q}
              onChange={(e) => resetPage(setQ)(e.target.value)}
              className={filterControl}
              data-testid="products-search"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="product-category"
              className="block text-micro text-apple-textTertiary mb-1 tracking-[-0.12px]"
            >
              Category
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => resetPage(setCategory)(e.target.value)}
              className={`${filterControl} sm:w-48`}
              data-testid="products-category-filter"
            >
              <option value="">All categories</option>
              {categories?.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="product-eco"
              className="block text-micro text-apple-textTertiary mb-1 tracking-[-0.12px]"
            >
              Min eco score
            </label>
            <select
              id="product-eco"
              value={ecoMin}
              onChange={(e) => resetPage(setEcoMin)(e.target.value)}
              className={`${filterControl} sm:w-44`}
              data-testid="products-eco-filter"
            >
              <option value="">Any</option>
              <option value="4">4+ (greener)</option>
              <option value="5">5 only</option>
            </select>
          </div>
        </div>
        {isLoading && (
          <p className="text-apple-textTertiary text-caption" data-testid="products-loading">
            Loading…
          </p>
        )}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-7 xl:gap-8"
          data-testid="products-grid"
        >
          {products.map((p) => (
            <li key={p.id} className="min-h-0">
              <ProductCard
                product={p}
                linkTestId={`product-card-${p.id}`}
                imageTestId={`product-card-image-${p.id}`}
                imageAspectClass="aspect-square"
                maxHighlights={2}
              />
            </li>
          ))}
        </ul>
        {!isLoading && products.length === 0 && (
          <p className="text-apple-textTertiary text-caption" data-testid="products-empty">
            No products match your filters.
          </p>
        )}
        {totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center gap-3"
            aria-label="Product pagination"
            data-testid="products-pagination"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg bg-white px-3 py-2 text-caption font-medium text-ink-950 shadow-apple-card disabled:opacity-50"
              data-testid="products-prev-page"
            >
              Previous
            </button>
            <span className="text-caption text-apple-textSecondary" data-testid="products-page-info">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg bg-white px-3 py-2 text-caption font-medium text-ink-950 shadow-apple-card disabled:opacity-50"
              data-testid="products-next-page"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
