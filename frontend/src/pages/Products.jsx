import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

function buildQuery(q, category, ecoMin) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (ecoMin) params.set("ecoMin", ecoMin);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function Products() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [ecoMin, setEcoMin] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api("/api/products/categories"),
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", q, category, ecoMin],
    queryFn: () => api(`/api/products${buildQuery(q, category, ecoMin)}`),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-products">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-2" data-testid="products-title">
        All products
      </h1>
      <p className="text-slate-600 mb-6">
        Browse moss, aquascaping stone, and maintenance supplies. Filter by category or Green Index (eco score) for
        sustainably sourced picks.
      </p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            placeholder="Search name, SKU, or description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-accent focus:border-accent outline-none"
            data-testid="products-search"
          />
        </div>
        <div>
          <label htmlFor="product-category" className="block text-xs font-medium text-slate-500 mb-1">
            Category
          </label>
          <select
            id="product-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-48 rounded-lg border border-slate-300 px-4 py-2.5"
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
        <div>
          <label htmlFor="product-eco" className="block text-xs font-medium text-slate-500 mb-1">
            Min eco score
          </label>
          <select
            id="product-eco"
            value={ecoMin}
            onChange={(e) => setEcoMin(e.target.value)}
            className="w-full sm:w-44 rounded-lg border border-slate-300 px-4 py-2.5"
            data-testid="products-eco-filter"
          >
            <option value="">Any</option>
            <option value="4">4+ (greener)</option>
            <option value="5">5 only</option>
          </select>
        </div>
      </div>
      {isLoading && <p data-testid="products-loading">Loading…</p>}
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7" data-testid="products-grid">
        {products?.map((p) => (
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
      {!isLoading && products?.length === 0 && (
        <p className="text-slate-500" data-testid="products-empty">
          No products match your filters.
        </p>
      )}
    </div>
  );
}
