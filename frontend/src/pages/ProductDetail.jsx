import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { productHighlights, productSpecs, stockMeta } from "../lib/productMeta.js";

function EcoDots({ score }) {
  const n = Math.min(5, Math.max(0, Number(score) || 0));
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < n ? "bg-emerald-600" : "bg-emerald-200/80"}`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api(`/api/products/${id}`),
    enabled: Boolean(id),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      api("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: id, quantity: 1 }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleAdd = () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    addMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16" data-testid="product-detail-loading">
        Loading…
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16" data-testid="product-detail-not-found">
        <p>Product not found.</p>
        <Link to="/products" className="text-accent mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const highlights = productHighlights(product.highlights);
  const specs = productSpecs(product.specs);
  const stock = stockMeta(product.stock);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-product-detail">
      <Link
        to="/products"
        className="text-sm text-slate-600 hover:text-accent mb-6 inline-block"
        data-testid="product-back"
      >
        ← All products
      </Link>
      <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div
          className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-teal-50/50 aspect-square ring-1 ring-slate-200/80 shadow-md"
          data-testid="product-image-wrap"
          data-image-state={product.imageUrl ? "present" : "missing"}
        >
          <ProductImage
            src={product.imageUrl}
            className="w-full h-full object-cover"
            testId="product-image"
            wrapClassName="h-full w-full"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500 uppercase tracking-wide font-medium" data-testid="product-category">
            {product.category}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-950 text-balance" data-testid="product-name">
            {product.name}
          </h1>
          {product.subtitle ? (
            <p className="text-lg text-teal-800/90 font-medium mt-2" data-testid="product-subtitle">
              {product.subtitle}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="text-3xl font-display font-semibold text-accent tabular-nums" data-testid="product-price">
              ${(product.priceCents / 100).toFixed(2)}
            </p>
            {product.sku ? (
              <p className="text-sm text-slate-500 font-mono" data-testid="product-sku">
                SKU {product.sku}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                stock.tone === "out"
                  ? "bg-slate-100 text-slate-600"
                  : stock.tone === "low"
                    ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
                    : "bg-teal-50 text-teal-900 ring-1 ring-teal-200/80"
              }`}
              data-testid="product-stock-badge"
            >
              {stock.label}
            </span>
            <div
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-900 px-4 py-2 text-sm font-medium ring-1 ring-emerald-200/70"
              data-testid="product-eco-badge"
            >
              <EcoDots score={product.ecoScore} />
              <span data-testid="product-eco-label">Green Index</span>
              <span data-testid="product-eco-score" className="tabular-nums">
                {product.ecoScore}/5
              </span>
            </div>
          </div>

          <p className="text-slate-600 mt-6 leading-relaxed text-pretty" data-testid="product-description">
            {product.description}
          </p>
          <p className="text-sm text-slate-500 mt-2" data-testid="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {highlights.length > 0 && (
            <section className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm" aria-labelledby="product-highlights-heading">
              <h2 id="product-highlights-heading" className="font-display text-sm font-semibold uppercase tracking-wide text-slate-500">
                At a glance
              </h2>
              <ul className="mt-3 space-y-2" data-testid="product-highlights">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                    <span className="text-emerald-600 font-bold shrink-0" aria-hidden>
                      ✓
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {specs.length > 0 && (
            <section className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5" aria-labelledby="product-specs-heading">
              <h2 id="product-specs-heading" className="font-display text-sm font-semibold uppercase tracking-wide text-slate-500">
                Specifications
              </h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2" data-testid="product-specs">
                {specs.map((row) => (
                  <div key={row.label} className="rounded-lg bg-white/90 px-3 py-2 ring-1 ring-slate-200/70">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{row.label}</dt>
                    <dd className="text-sm text-ink-950 mt-0.5 leading-snug">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <button
            type="button"
            disabled={product.stock < 1 || addMutation.isPending}
            onClick={handleAdd}
            className="mt-8 w-full sm:w-auto rounded-xl bg-accent text-white px-8 py-3.5 font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-900/10"
            data-testid="product-add-to-cart"
          >
            {addMutation.isPending ? "Adding…" : "Add to cart"}
          </button>
          {addMutation.isSuccess && (
            <p className="text-green-600 text-sm mt-3" data-testid="product-add-success">
              Added to cart.
            </p>
          )}
          {addMutation.isError && (
            <p className="text-red-600 text-sm mt-3" data-testid="product-add-error">
              {addMutation.error?.message || "Could not add to cart"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
