import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

const inputQty =
  "w-16 rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-2 py-1 text-center text-[17px] focus:ring-2 focus:ring-accent outline-none";

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
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-cart-guest">
          <p className="text-apple-textSecondary">Sign in to view your cart.</p>
          <Link to="/login" className="text-apple-link font-semibold mt-4 inline-block hover:underline" data-testid="cart-login-link">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const total =
    items?.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0) ?? 0;

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-cart">
        <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-8 leading-[1.1]" data-testid="cart-title">
          Your cart
        </h1>
        {isLoading && (
          <p className="text-apple-textTertiary" data-testid="cart-loading">
            Loading…
          </p>
        )}
        {!isLoading && (!items || items.length === 0) && (
          <div className="rounded-lg bg-white p-12 text-center shadow-apple-card" data-testid="cart-empty">
            <p className="text-apple-textSecondary">Your cart is empty.</p>
            <Link to="/products" className="text-apple-link font-semibold mt-4 inline-block hover:underline" data-testid="cart-shop-link">
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
                  className="flex flex-wrap gap-4 items-center rounded-lg bg-white p-4 shadow-apple-card"
                  data-testid={`cart-line-${line.id}`}
                >
                  <ProductImage
                    src={line.product.imageUrl}
                    className="w-20 h-20 object-cover rounded-lg"
                    testId={`cart-line-img-${line.id}`}
                    wrapClassName="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-apple-gray"
                  />
                  <div className="flex-1 min-w-[200px]">
                    <Link
                      to={`/products/${line.productId}`}
                      className="font-semibold text-ink-950 hover:text-apple-link"
                      data-testid={`cart-line-name-${line.id}`}
                    >
                      {line.product.name}
                    </Link>
                    <p className="text-caption text-apple-textTertiary tracking-[-0.224px]">
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
                      className={inputQty}
                      data-testid={`cart-line-qty-${line.id}`}
                    />
                  </div>
                  <p className="font-semibold w-24 text-right text-ink-950" data-testid={`cart-line-subtotal-${line.id}`}>
                    ${((line.product.priceCents * line.quantity) / 100).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem.mutate(line.id)}
                    className="text-caption text-apple-link hover:underline"
                    data-testid={`cart-line-remove-${line.id}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-between items-center pt-6" data-testid="cart-summary">
              <span className="text-[1.31rem] font-semibold text-apple-textSecondary">Total</span>
              <span className="text-section-heading font-semibold text-ink-950 leading-[1.1]" data-testid="cart-total">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
            <Link
              to="/checkout"
              className="inline-block mt-6 rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover border border-transparent"
              data-testid="cart-checkout-btn"
            >
              Proceed to checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
