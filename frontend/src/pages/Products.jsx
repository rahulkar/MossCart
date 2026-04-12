import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import ProductImage from "../components/ProductImage.jsx";

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
            placeholder="Search by name or description…"
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
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
        {products?.map((p) => (
          <li key={p.id}>
            <Link
              to={`/products/${p.id}`}
              className="block rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition"
              data-testid={`product-card-${p.id}`}
              data-image-state={p.imageUrl ? "present" : "missing"}
            >
              <div className="aspect-square bg-slate-100 overflow-hidden">
                <ProductImage
                  src={p.imageUrl}
                  className="w-full h-full object-cover"
                  testId={`product-card-image-${p.id}`}
                  wrapClassName="h-full w-full"
                />
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{p.category}</p>
                <h2 className="font-semibold text-ink-950">{p.name}</h2>
                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                <p
                  className="text-xs text-emerald-700 font-medium mt-2"
                  data-testid={`product-card-eco-${p.id}`}
                >
                  Green index: {p.ecoScore}/5
                </p>
                <p className="text-accent font-semibold mt-1" data-testid={`product-price-${p.id}`}>
                  ${(p.priceCents / 100).toFixed(2)}
                </p>
              </div>
            </Link>
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
