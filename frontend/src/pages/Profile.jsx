import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";

const field =
  "w-full rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] text-ink-950 focus:ring-2 focus:ring-accent outline-none";

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: me, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => api("/api/users/me"),
    enabled: Boolean(user),
    initialData: user || undefined,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api("/api/orders"),
    enabled: Boolean(user),
  });

  const updateProfile = useMutation({
    mutationFn: (body) =>
      api("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
      setEditing(false);
    },
  });

  if (!user) {
    return (
      <div className="bg-apple-gray min-h-full">
        <div className="max-w-content mx-auto px-4 py-16 text-center" data-testid="page-profile-guest">
          <Link to="/login" className="text-apple-link font-semibold hover:underline">
            Log in
          </Link>{" "}
          to view your profile.
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setName(me?.name || "");
    setEmail(me?.email || "");
    setEditing(true);
  };

  const save = (e) => {
    e.preventDefault();
    updateProfile.mutate({ name, email });
  };

  return (
    <div className="bg-apple-gray min-h-full">
      <div className="max-w-content mx-auto px-4 py-10" data-testid="page-profile">
        <h1 className="font-display text-section-heading font-semibold text-ink-950 mb-8 leading-[1.1]" data-testid="profile-title">
          Profile
        </h1>
        {isLoading && <p className="text-apple-textTertiary">Loading…</p>}
        {me && !editing && (
          <div className="rounded-lg bg-white p-6 max-w-lg shadow-apple-card" data-testid="profile-card">
            <p className="text-micro text-apple-textTertiary tracking-[-0.12px]">Name</p>
            <p className="font-semibold text-tile-heading text-ink-950 leading-[1.14]" data-testid="profile-name-display">
              {me.name}
            </p>
            <p className="text-micro text-apple-textTertiary mt-4 tracking-[-0.12px]">Email</p>
            <p className="font-medium text-ink-950" data-testid="profile-email-display">
              {me.email}
            </p>
            <button
              type="button"
              onClick={startEdit}
              className="mt-6 text-apple-link font-semibold hover:underline"
              data-testid="profile-edit-btn"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={logout}
              className="block mt-4 text-caption text-apple-textSecondary hover:text-ink-950 tracking-[-0.224px]"
              data-testid="profile-logout-btn"
            >
              Log out
            </button>
          </div>
        )}
        {editing && (
          <form onSubmit={save} className="max-w-lg space-y-4" data-testid="profile-edit-form">
            <div>
              <label htmlFor="profile-name" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
                Name
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
                data-testid="profile-name-input"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                data-testid="profile-email-input"
              />
            </div>
            {updateProfile.isError && (
              <p className="text-red-600 text-caption">{updateProfile.error?.message}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-accent text-white px-[15px] py-2 text-[17px] font-normal hover:bg-accent-hover border border-transparent"
                data-testid="profile-save-btn"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg bg-apple-filterBg border-[3px] border-apple-filterBorder px-[15px] py-2 text-[17px] text-ink-950"
                data-testid="profile-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <section className="mt-12" data-testid="profile-orders">
          <h2 className="font-display text-tile-heading font-semibold text-ink-950 mb-4 leading-[1.14]" data-testid="profile-orders-heading">
            Orders
          </h2>
          {!orders?.length && <p className="text-apple-textTertiary text-caption">No orders yet.</p>}
          <ul className="space-y-3">
            {orders?.map((o) => (
              <li
                key={o.id}
                className="rounded-lg bg-white p-4 flex justify-between flex-wrap gap-2 items-center shadow-apple-card"
                data-testid={`profile-order-${o.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="font-medium text-ink-950" data-testid={`profile-order-total-${o.id}`}>
                    ${(o.totalCents / 100).toFixed(2)}
                  </span>
                  <span className="text-caption text-apple-textTertiary tracking-[-0.224px]" data-testid={`profile-order-status-${o.id}`}>
                    {o.paymentStatus} · {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/orders/${o.id}`}
                  className="text-caption font-semibold text-apple-link hover:underline"
                  data-testid={`profile-order-link-${o.id}`}
                >
                  View receipt
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
