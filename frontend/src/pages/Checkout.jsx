import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

const showPaymentDeclineSim =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_CHECKOUT_FAILURE_SIM === "1";

const field =
  "w-full rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] text-ink-950 focus:ring-2 focus:ring-accent outline-none";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [simulateDecline, setSimulateDecline] = useState(false);
  const [declinedNotice, setDeclinedNotice] = useState("");
  const [form, setForm] = useState({
    shippingName: "",
    shippingLine1: "",
    shippingCity: "",
    shippingPostal: "",
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api("/api/cart"),
    enabled: Boolean(user),
  });

  const checkout = useMutation({
    mutationFn: (body) => {
      const q = simulateDecline ? "?fail=true" : "";
      return api(`/api/checkout${q}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      if (order?.paymentStatus === "failed") {
        setDeclinedNotice("Payment was declined (mock). Your cart is unchanged.");
        return;
      }
      setDeclinedNotice("");
      navigate("/profile", { replace: true });
    },
  });

  if (!user) {
    return (
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-checkout-guest">
          <Link to="/login" className="text-apple-link font-semibold hover:underline">
            Log in
          </Link>{" "}
          to checkout.
        </div>
      </div>
    );
  }

  const total =
    items?.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0) ?? 0;

  const submit = (e) => {
    e.preventDefault();
    setDeclinedNotice("");
    checkout.mutate(form);
  };

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-checkout">
        <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]" data-testid="checkout-title">
          Checkout
        </h1>
        <p className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]">Mock payment — no real card is charged.</p>
        {isLoading && <p className="text-apple-textTertiary">Loading cart…</p>}
        {!isLoading && (!items || items.length === 0) && (
          <p className="text-apple-textSecondary" data-testid="checkout-empty-cart">
            Your cart is empty.{" "}
            <Link to="/products" className="text-apple-link hover:underline font-semibold">
              Add items
            </Link>
          </p>
        )}
        {items?.length > 0 && (
          <div className="grid md:grid-cols-2 gap-10 xl:gap-14 items-start">
            <form onSubmit={submit} className="space-y-4" data-testid="checkout-form">
              <div>
                <label htmlFor="shippingName" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
                  Full name
                </label>
                <input
                  id="shippingName"
                  required
                  value={form.shippingName}
                  onChange={(e) => setForm((f) => ({ ...f, shippingName: e.target.value }))}
                  className={field}
                  data-testid="checkout-name"
                />
              </div>
              <div>
                <label htmlFor="shippingLine1" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
                  Address line
                </label>
                <input
                  id="shippingLine1"
                  required
                  value={form.shippingLine1}
                  onChange={(e) => setForm((f) => ({ ...f, shippingLine1: e.target.value }))}
                  className={field}
                  data-testid="checkout-line1"
                />
              </div>
              <div>
                <label htmlFor="shippingCity" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
                  City
                </label>
                <input
                  id="shippingCity"
                  required
                  value={form.shippingCity}
                  onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                  className={field}
                  data-testid="checkout-city"
                />
              </div>
              <div>
                <label htmlFor="shippingPostal" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
                  Postal code
                </label>
                <input
                  id="shippingPostal"
                  required
                  value={form.shippingPostal}
                  onChange={(e) => setForm((f) => ({ ...f, shippingPostal: e.target.value }))}
                  className={field}
                  data-testid="checkout-postal"
                />
              </div>
              {showPaymentDeclineSim && (
                <label className="flex items-center gap-2 text-caption text-apple-textSecondary tracking-[-0.224px]">
                  <input
                    type="checkbox"
                    checked={simulateDecline}
                    onChange={(e) => setSimulateDecline(e.target.checked)}
                    data-testid="checkout-simulate-decline"
                  />
                  Simulate payment decline (test only)
                </label>
              )}
              <button
                type="submit"
                disabled={checkout.isPending}
                className="w-full md:w-auto rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover disabled:opacity-50 border border-transparent"
                data-testid="checkout-pay-btn"
              >
                {checkout.isPending ? "Processing…" : "Pay now (mock)"}
              </button>
              {declinedNotice && (
                <p className="text-red-600 text-caption" data-testid="checkout-payment-failed">
                  {declinedNotice}
                </p>
              )}
              {checkout.isError && (
                <p className="text-red-600 text-caption" data-testid="checkout-error">
                  {checkout.error?.message || "Checkout failed"}
                </p>
              )}
            </form>
            <div className="rounded-lg bg-white p-6 h-fit shadow-apple-card" data-testid="checkout-order-summary">
              <h2 className="font-semibold text-tile-heading mb-4 text-ink-950 leading-[1.14]">Order summary</h2>
              <ul className="space-y-2 text-caption text-apple-textSecondary tracking-[-0.224px]">
                {items.map((line) => (
                  <li key={line.id} className="flex justify-between gap-2" data-testid={`checkout-summary-${line.id}`}>
                    <span>
                      {line.product.name} × {line.quantity}
                    </span>
                    <span className="text-ink-950 tabular-nums">${((line.product.priceCents * line.quantity) / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 flex justify-between font-semibold text-ink-950" data-testid="checkout-total">
                <span>Total</span>
                <span className="tabular-nums">${(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
