import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import { formatPrice, formatDate } from "../lib/format.js";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { user } = useAuth();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api(`/api/orders/${id}`),
    enabled: Boolean(user && id),
  });

  if (!user) {
    return (
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-order-confirmation-guest">
          <Link to="/login" className="text-apple-link font-semibold hover:underline">
            Log in
          </Link>{" "}
          to view your order confirmation.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="layout-container py-16 text-apple-textSecondary"
        data-testid="order-confirmation-loading"
      >
        Loading confirmation…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="layout-container py-16" data-testid="order-confirmation-not-found">
        <p className="text-ink-950">Order not found.</p>
        <Link
          to="/profile"
          className="text-apple-link mt-4 inline-block hover:underline"
          data-testid="order-confirmation-back-profile"
        >
          Back to profile
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-order-confirmation">
        <h1
          className="font-display text-section-heading font-semibold text-ink-950 mb-2 leading-[1.1]"
          data-testid="order-confirmation-title"
        >
          Order confirmed
        </h1>
        <p
          className="text-apple-textSecondary mb-8 leading-[1.47] tracking-[-0.0234em]"
          data-testid="order-confirmation-subtitle"
        >
          Thank you for your order. A receipt has been sent to your account.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-lg bg-white p-6 shadow-apple-card" data-testid="order-confirmation-summary">
            <h2 className="font-semibold text-tile-heading text-ink-950 mb-4 leading-[1.14]">
              Order details
            </h2>
            <p
              className="text-caption text-apple-textTertiary tracking-[-0.224px] mb-4"
              data-testid="order-confirmation-meta"
            >
              {order.paymentStatus} · {formatDate(order.createdAt)}
            </p>
            <ul className="space-y-4">
              {order.items?.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4"
                  data-testid={`order-confirmation-line-${line.id}`}
                >
                  <div className="w-20 h-20 shrink-0 rounded-lg bg-apple-gray overflow-hidden">
                    <ProductImage
                      src={line.product?.imageUrl}
                      className="w-full h-full object-cover"
                      testId={`order-confirmation-line-img-${line.id}`}
                      wrapClassName="h-full w-full"
                    />
                  </div>
                  <div>
                    <p
                      className="font-medium text-ink-950"
                      data-testid={`order-confirmation-line-name-${line.id}`}
                    >
                      {line.product?.name}
                    </p>
                    <p className="text-caption text-apple-textTertiary tracking-[-0.224px]">
                      Qty {line.quantity} × {formatPrice(line.priceCents)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div
              className="mt-6 pt-4 border-t border-apple-gray flex justify-between font-semibold text-ink-950"
              data-testid="order-confirmation-total"
            >
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-apple-card" data-testid="order-confirmation-shipping">
              <h2 className="font-semibold text-tile-heading text-ink-950 mb-4 leading-[1.14]">
                Shipping address
              </h2>
              <p className="text-apple-textSecondary" data-testid="order-confirmation-ship-name">
                {order.shippingName}
              </p>
              <p className="text-apple-textSecondary" data-testid="order-confirmation-ship-line1">
                {order.shippingLine1}
              </p>
              <p className="text-apple-textSecondary" data-testid="order-confirmation-ship-city">
                {order.shippingCity}, {order.shippingPostal}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-lg bg-accent px-[15px] py-2 text-[17px] font-normal text-white hover:bg-accent-hover border border-transparent"
                data-testid="order-confirmation-shop-more"
              >
                Continue shopping
              </Link>
              <Link
                to="/profile"
                className="rounded-lg px-[15px] py-2 text-[17px] font-normal text-ink-950 bg-apple-filterBg border border-apple-filterBorder hover:bg-apple-gray"
                data-testid="order-confirmation-view-profile"
              >
                View profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
