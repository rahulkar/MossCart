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
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-order-guest">
          <Link to="/login" className="text-apple-link font-semibold hover:underline" data-testid="order-login-link">
            Log in
          </Link>{" "}
          to view this order.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="layout-container py-16 text-apple-textSecondary" data-testid="order-detail-loading">
        Loading order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="layout-container py-16" data-testid="order-detail-not-found">
        <p className="text-ink-950">Order not found.</p>
        <Link to="/profile" className="text-apple-link mt-4 inline-block hover:underline" data-testid="order-back-profile">
          Back to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-order-detail">
        <Link
          to="/profile"
          className="text-caption text-apple-link hover:underline mb-6 inline-block tracking-[-0.224px]"
          data-testid="order-back"
        >
          ← Profile
        </Link>
        <h1 className="font-display text-section-heading font-semibold text-ink-950 leading-[1.1]" data-testid="order-detail-title">
          Order receipt
        </h1>
        <p className="text-caption text-apple-textTertiary mt-2 tracking-[-0.224px]" data-testid="order-detail-meta">
          {order.paymentStatus} · {new Date(order.createdAt).toLocaleString()}
        </p>
        <p className="text-tile-heading font-semibold text-ink-950 mt-6 leading-[1.14]" data-testid="order-detail-total">
          Total ${(order.totalCents / 100).toFixed(2)}
        </p>
        <section className="mt-8" data-testid="order-detail-lines">
          <h2 className="font-semibold text-tile-heading text-ink-950 mb-4 leading-[1.14]">Items</h2>
          <ul className="space-y-4">
            {order.items?.map((line) => (
              <li
                key={line.id}
                className="flex gap-4 rounded-lg bg-white p-4 shadow-apple-card"
                data-testid={`order-line-${line.id}`}
              >
                <div className="w-20 h-20 shrink-0 rounded-lg bg-apple-gray overflow-hidden">
                  <ProductImage
                    src={line.product?.imageUrl}
                    className="w-full h-full object-cover"
                    testId={`order-line-img-${line.id}`}
                    wrapClassName="h-full w-full"
                  />
                </div>
                <div>
                  <p className="font-medium text-ink-950" data-testid={`order-line-name-${line.id}`}>
                    {line.product?.name}
                  </p>
                  <p className="text-caption text-apple-textTertiary tracking-[-0.224px]">
                    Qty {line.quantity} × ${(line.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-10 rounded-lg bg-white p-6 shadow-apple-card" data-testid="order-detail-shipping">
          <h2 className="font-semibold text-ink-950 mb-2">Ship to</h2>
          <p className="text-apple-textSecondary" data-testid="order-ship-name">
            {order.shippingName}
          </p>
          <p className="text-apple-textSecondary" data-testid="order-ship-line1">
            {order.shippingLine1}
          </p>
          <p className="text-apple-textSecondary" data-testid="order-ship-city">
            {order.shippingCity}, {order.shippingPostal}
          </p>
        </section>
      </div>
    </div>
  );
}
