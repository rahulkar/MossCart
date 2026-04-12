import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-product-detail">
      <Link
        to="/products"
        className="text-sm text-slate-600 hover:text-accent mb-6 inline-block"
        data-testid="product-back"
      >
        ← All products
      </Link>
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div
          className="rounded-2xl overflow-hidden bg-slate-100 aspect-square"
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
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide" data-testid="product-category">
            {product.category}
          </p>
          <h1 className="font-display text-3xl font-bold text-ink-950" data-testid="product-name">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-accent mt-2" data-testid="product-price">
            ${(product.priceCents / 100).toFixed(2)}
          </p>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-4 py-2 text-sm font-medium"
            data-testid="product-eco-badge"
          >
            <span data-testid="product-eco-label">Green Index</span>
            <span data-testid="product-eco-score">{product.ecoScore}/5</span>
          </div>
          <p className="text-slate-600 mt-6 leading-relaxed" data-testid="product-description">
            {product.description}
          </p>
          <p className="text-sm text-slate-500 mt-4" data-testid="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <button
            type="button"
            disabled={product.stock < 1 || addMutation.isPending}
            onClick={handleAdd}
            className="mt-8 rounded-lg bg-accent text-white px-8 py-3 font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
