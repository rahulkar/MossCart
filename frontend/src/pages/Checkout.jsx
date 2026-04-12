import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

const showPaymentDeclineSim =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_CHECKOUT_FAILURE_SIM === "1";

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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center" data-testid="page-checkout-guest">
        <Link to="/login" className="text-accent font-semibold">
          Log in
        </Link>{" "}
        to checkout.
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
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-checkout">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-2" data-testid="checkout-title">
        Checkout
      </h1>
      <p className="text-slate-600 mb-8">Mock payment — no real card is charged.</p>
      {isLoading && <p>Loading cart…</p>}
      {!isLoading && (!items || items.length === 0) && (
        <p className="text-slate-600" data-testid="checkout-empty-cart">
          Your cart is empty.{" "}
          <Link to="/products" className="text-accent">
            Add items
          </Link>
        </p>
      )}
      {items?.length > 0 && (
        <div className="grid md:grid-cols-2 gap-10">
          <form onSubmit={submit} className="space-y-4" data-testid="checkout-form">
            <div>
              <label htmlFor="shippingName" className="block text-sm font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                id="shippingName"
                required
                value={form.shippingName}
                onChange={(e) => setForm((f) => ({ ...f, shippingName: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                data-testid="checkout-name"
              />
            </div>
            <div>
              <label htmlFor="shippingLine1" className="block text-sm font-medium text-slate-700 mb-1">
                Address line
              </label>
              <input
                id="shippingLine1"
                required
                value={form.shippingLine1}
                onChange={(e) => setForm((f) => ({ ...f, shippingLine1: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                data-testid="checkout-line1"
              />
            </div>
            <div>
              <label htmlFor="shippingCity" className="block text-sm font-medium text-slate-700 mb-1">
                City
              </label>
              <input
                id="shippingCity"
                required
                value={form.shippingCity}
                onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                data-testid="checkout-city"
              />
            </div>
            <div>
              <label htmlFor="shippingPostal" className="block text-sm font-medium text-slate-700 mb-1">
                Postal code
              </label>
              <input
                id="shippingPostal"
                required
                value={form.shippingPostal}
                onChange={(e) => setForm((f) => ({ ...f, shippingPostal: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                data-testid="checkout-postal"
              />
            </div>
            {showPaymentDeclineSim && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
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
              className="w-full md:w-auto rounded-lg bg-accent text-white px-8 py-3 font-semibold hover:bg-accent-hover disabled:opacity-50"
              data-testid="checkout-pay-btn"
            >
              {checkout.isPending ? "Processing…" : "Pay now (mock)"}
            </button>
            {declinedNotice && (
              <p className="text-red-600 text-sm" data-testid="checkout-payment-failed">
                {declinedNotice}
              </p>
            )}
            {checkout.isError && (
              <p className="text-red-600 text-sm" data-testid="checkout-error">
                {checkout.error?.message || "Checkout failed"}
              </p>
            )}
          </form>
          <div className="rounded-xl border border-slate-200 bg-white p-6 h-fit" data-testid="checkout-order-summary">
            <h2 className="font-semibold text-lg mb-4">Order summary</h2>
            <ul className="space-y-2 text-sm">
              {items.map((line) => (
                <li key={line.id} className="flex justify-between" data-testid={`checkout-summary-${line.id}`}>
                  <span>
                    {line.product.name} × {line.quantity}
                  </span>
                  <span>${((line.product.priceCents * line.quantity) / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between font-bold" data-testid="checkout-total">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
