import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api(`/api/orders/${id}`),
    enabled: Boolean(user && id),
  });

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center" data-testid="page-order-guest">
        <Link to="/login" className="text-accent font-semibold" data-testid="order-login-link">
          Log in
        </Link>{" "}
        to view this order.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16" data-testid="order-detail-loading">
        Loading order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16" data-testid="order-detail-not-found">
        <p>Order not found.</p>
        <Link to="/profile" className="text-accent mt-4 inline-block" data-testid="order-back-profile">
          Back to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-order-detail">
      <Link to="/profile" className="text-sm text-slate-600 hover:text-accent mb-6 inline-block" data-testid="order-back">
        ← Profile
      </Link>
      <h1 className="font-display text-3xl font-bold text-ink-950" data-testid="order-detail-title">
        Order receipt
      </h1>
      <p className="text-slate-500 mt-2" data-testid="order-detail-meta">
        {order.paymentStatus} · {new Date(order.createdAt).toLocaleString()}
      </p>
      <p className="text-lg font-semibold mt-6" data-testid="order-detail-total">
        Total ${(order.totalCents / 100).toFixed(2)}
      </p>
      <section className="mt-8" data-testid="order-detail-lines">
        <h2 className="font-semibold text-lg mb-4">Items</h2>
        <ul className="space-y-4">
          {order.items?.map((line) => (
            <li
              key={line.id}
              className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4"
              data-testid={`order-line-${line.id}`}
            >
              <div className="w-20 h-20 shrink-0 rounded bg-slate-100 overflow-hidden">
                <ProductImage
                  src={line.product?.imageUrl}
                  className="w-full h-full object-cover"
                  testId={`order-line-img-${line.id}`}
                  wrapClassName="h-full w-full"
                />
              </div>
              <div>
                <p className="font-medium" data-testid={`order-line-name-${line.id}`}>
                  {line.product?.name}
                </p>
                <p className="text-sm text-slate-500">
                  Qty {line.quantity} × ${(line.priceCents / 100).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6" data-testid="order-detail-shipping">
        <h2 className="font-semibold mb-2">Ship to</h2>
        <p data-testid="order-ship-name">{order.shippingName}</p>
        <p data-testid="order-ship-line1">{order.shippingLine1}</p>
        <p data-testid="order-ship-city">
          {order.shippingCity}, {order.shippingPostal}
        </p>
      </section>
    </div>
  );
}
