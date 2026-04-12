import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

export default function Cart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api("/api/cart"),
    enabled: Boolean(user),
  });

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }) =>
      api(`/api/cart/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id) => api(`/api/cart/items/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center" data-testid="page-cart-guest">
        <p className="text-slate-600">Sign in to view your cart.</p>
        <Link to="/login" className="text-accent font-semibold mt-4 inline-block" data-testid="cart-login-link">
          Log in
        </Link>
      </div>
    );
  }

  const total =
    items?.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0) ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-cart">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-8" data-testid="cart-title">
        Your cart
      </h1>
      {isLoading && <p data-testid="cart-loading">Loading…</p>}
      {!isLoading && (!items || items.length === 0) && (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center" data-testid="cart-empty">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link to="/products" className="text-accent font-semibold mt-4 inline-block" data-testid="cart-shop-link">
            Browse products
          </Link>
        </div>
      )}
      {items?.length > 0 && (
        <>
          <ul className="space-y-4" data-testid="cart-lines">
            {items.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap gap-4 items-center rounded-xl border border-slate-200 bg-white p-4"
                data-testid={`cart-line-${line.id}`}
              >
                <ProductImage
                  src={line.product.imageUrl}
                  className="w-20 h-20 object-cover rounded-lg"
                  testId={`cart-line-img-${line.id}`}
                  wrapClassName="w-20 h-20 shrink-0 rounded-lg overflow-hidden"
                />
                <div className="flex-1 min-w-[200px]">
                  <Link
                    to={`/products/${line.productId}`}
                    className="font-semibold text-ink-950 hover:text-accent"
                    data-testid={`cart-line-name-${line.id}`}
                  >
                    {line.product.name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    ${(line.product.priceCents / 100).toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`qty-${line.id}`} className="sr-only">
                    Quantity
                  </label>
                  <input
                    id={`qty-${line.id}`}
                    type="number"
                    min={1}
                    max={line.product.stock}
                    value={line.quantity}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (n >= 1) updateQty.mutate({ id: line.id, quantity: n });
                    }}
                    className="w-16 rounded border border-slate-300 px-2 py-1"
                    data-testid={`cart-line-qty-${line.id}`}
                  />
                </div>
                <p className="font-semibold w-24 text-right" data-testid={`cart-line-subtotal-${line.id}`}>
                  ${((line.product.priceCents * line.quantity) / 100).toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem.mutate(line.id)}
                  className="text-sm text-red-600 hover:underline"
                  data-testid={`cart-line-remove-${line.id}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-between items-center border-t border-slate-200 pt-6" data-testid="cart-summary">
            <span className="text-lg font-medium text-slate-700">Total</span>
            <span className="text-2xl font-bold text-ink-950" data-testid="cart-total">
              ${(total / 100).toFixed(2)}
            </span>
          </div>
          <Link
            to="/checkout"
            className="inline-block mt-6 rounded-lg bg-accent text-white px-8 py-3 font-semibold hover:bg-accent-hover"
            data-testid="cart-checkout-btn"
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </div>
  );
}
