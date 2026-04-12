import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";

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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center" data-testid="page-profile-guest">
        <Link to="/login" className="text-accent font-semibold">
          Log in
        </Link>{" "}
        to view your profile.
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
    <div className="max-w-6xl mx-auto px-4 py-10" data-testid="page-profile">
      <h1 className="font-display text-3xl font-bold text-ink-950 mb-8" data-testid="profile-title">
        Profile
      </h1>
      {isLoading && <p>Loading…</p>}
      {me && !editing && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 max-w-lg" data-testid="profile-card">
          <p className="text-sm text-slate-500">Name</p>
          <p className="font-semibold text-lg" data-testid="profile-name-display">
            {me.name}
          </p>
          <p className="text-sm text-slate-500 mt-4">Email</p>
          <p className="font-medium" data-testid="profile-email-display">
            {me.email}
          </p>
          <button
            type="button"
            onClick={startEdit}
            className="mt-6 text-accent font-semibold hover:underline"
            data-testid="profile-edit-btn"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={logout}
            className="block mt-4 text-sm text-slate-600 hover:text-red-600"
            data-testid="profile-logout-btn"
          >
            Log out
          </button>
        </div>
      )}
      {editing && (
        <form onSubmit={save} className="max-w-lg space-y-4" data-testid="profile-edit-form">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              data-testid="profile-name-input"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              data-testid="profile-email-input"
            />
          </div>
          {updateProfile.isError && (
            <p className="text-red-600 text-sm">{updateProfile.error?.message}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-accent text-white px-6 py-2 font-semibold"
              data-testid="profile-save-btn"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 px-6 py-2"
              data-testid="profile-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="mt-12" data-testid="profile-orders">
        <h2 className="font-display text-xl font-semibold mb-4" data-testid="profile-orders-heading">
          Orders
        </h2>
        {!orders?.length && <p className="text-slate-500">No orders yet.</p>}
        <ul className="space-y-3">
          {orders?.map((o) => (
            <li
              key={o.id}
              className="rounded-lg border border-slate-200 bg-white p-4 flex justify-between flex-wrap gap-2 items-center"
              data-testid={`profile-order-${o.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="font-medium" data-testid={`profile-order-total-${o.id}`}>
                  ${(o.totalCents / 100).toFixed(2)}
                </span>
                <span className="text-sm text-slate-500" data-testid={`profile-order-status-${o.id}`}>
                  {o.paymentStatus} · {new Date(o.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Link
                to={`/orders/${o.id}`}
                className="text-sm font-semibold text-accent hover:underline"
                data-testid={`profile-order-link-${o.id}`}
              >
                View receipt
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
