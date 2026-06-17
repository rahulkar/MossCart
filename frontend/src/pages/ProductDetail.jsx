import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import EcoDots from "../components/ui/EcoDots.jsx";
import { productHighlights, productSpecs, stockMeta } from "../lib/productMeta.js";
import { formatPrice } from "../lib/format.js";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
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
      <div
        className="layout-container py-16 text-apple-textSecondary"
        data-testid="product-detail-loading"
      >
        Loading…
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="layout-container py-16" data-testid="product-detail-not-found">
        <p className="text-ink-950">Product not found.</p>
        <Link to="/products" className="text-apple-link mt-4 inline-block hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const highlights = productHighlights(product.highlights);
  const specs = productSpecs(product.specs);
  const stock = stockMeta(product.stock);

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-product-detail">
        <Link
          to="/products"
          className="text-caption text-apple-link hover:underline mb-6 inline-block tracking-[-0.224px]"
          data-testid="product-back"
        >
          ← All products
        </Link>
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-start">
          <div
            className="rounded-lg overflow-hidden bg-apple-gray aspect-square shadow-apple-card"
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
            <p
              className="text-micro text-apple-textTertiary uppercase tracking-wide font-semibold"
              data-testid="product-category"
            >
              {product.category}
            </p>
            <h1
              className="font-display text-[2rem] md:text-tile-heading font-semibold text-ink-950 text-balance leading-[1.14] mt-1"
              data-testid="product-name"
            >
              {product.name}
            </h1>
            {product.subtitle ? (
              <p
                className="text-[1.31rem] text-apple-textSecondary font-normal mt-2 leading-[1.19] tracking-[0.231px]"
                data-testid="product-subtitle"
              >
                {product.subtitle}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p
                className="text-[2rem] font-display font-semibold text-ink-950 tabular-nums leading-tight"
                data-testid="product-price"
              >
                {formatPrice(product.priceCents)}
              </p>
              {product.sku ? (
                <p
                  className="text-caption text-apple-textTertiary font-mono tracking-[-0.224px]"
                  data-testid="product-sku"
                >
                  SKU {product.sku}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-micro font-semibold uppercase tracking-wide ${stock.badgeClass}`}
                data-testid="product-stock-badge"
              >
                {stock.label}
              </span>
              <div
                className="inline-flex items-center gap-2 rounded-full bg-apple-gray text-ink-950 px-4 py-2 text-caption font-medium"
                data-testid="product-eco-badge"
              >
                <EcoDots score={product.ecoScore} size="md" />
                <span data-testid="product-eco-label">Green Index</span>
                <span data-testid="product-eco-score" className="tabular-nums">
                  {product.ecoScore}/5
                </span>
              </div>
            </div>

            <p
              className="text-apple-textSecondary mt-6 leading-[1.47] tracking-[-0.0234em] text-pretty"
              data-testid="product-description"
            >
              {product.description}
            </p>
            <p
              className="text-caption text-apple-textTertiary mt-2 tracking-[-0.224px]"
              data-testid="product-stock"
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            {highlights.length > 0 && (
              <section
                className="mt-8 rounded-lg bg-white p-5 shadow-apple-card"
                aria-labelledby="product-highlights-heading"
              >
                <h2
                  id="product-highlights-heading"
                  className="font-display text-micro font-semibold uppercase tracking-wide text-apple-textTertiary"
                >
                  At a glance
                </h2>
                <ul className="mt-3 space-y-2" data-testid="product-highlights">
                  {highlights.map((h) => (
                    <li
                      key={h}
                      className="flex gap-2 text-ink-950 text-caption leading-[1.29] tracking-[-0.224px]"
                    >
                      <span className="text-apple-nearBlack font-bold shrink-0" aria-hidden>
                        ✓
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {specs.length > 0 && (
              <section
                className="mt-6 rounded-lg bg-white p-5 shadow-apple-card"
                aria-labelledby="product-specs-heading"
              >
                <h2
                  id="product-specs-heading"
                  className="font-display text-micro font-semibold uppercase tracking-wide text-apple-textTertiary"
                >
                  Specifications
                </h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2" data-testid="product-specs">
                  {specs.map((row) => (
                    <div key={row.label} className="rounded-lg bg-apple-gray px-3 py-2">
                      <dt className="text-micro font-semibold uppercase tracking-wide text-apple-textTertiary">
                        {row.label}
                      </dt>
                      <dd className="text-caption text-ink-950 mt-0.5 leading-snug tracking-[-0.224px]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <button
              type="button"
              disabled={product.stock < 1 || addMutation.isPending}
              onClick={handleAdd}
              className="mt-8 w-full sm:w-auto rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
              data-testid="product-add-to-cart"
            >
              {addMutation.isPending ? "Adding…" : "Add to cart"}
            </button>
            {addMutation.isSuccess && (
              <p
                className="text-ink-950 text-caption mt-3 tracking-[-0.224px]"
                data-testid="product-add-success"
              >
                Added to cart.
              </p>
            )}
            {addMutation.isError && (
              <p className="text-red-600 text-caption mt-3" data-testid="product-add-error">
                {addMutation.error?.message || "Could not add to cart"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
