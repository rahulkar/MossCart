import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { formatPrice, formatDate } from "../lib/format.js";

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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");

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

  const changePassword = useMutation({
    mutationFn: (body) =>
      api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwMessage("Password changed successfully.");
    },
    onError: (err) => setPwMessage(err.message),
  });

  if (!user) {
    return (
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-profile-guest">
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
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-profile">
        <h1
          className="font-display text-section-heading font-semibold text-ink-950 mb-8 leading-[1.1]"
          data-testid="profile-title"
        >
          Profile
        </h1>
        {isLoading && <p className="text-apple-textTertiary">Loading…</p>}
        {me && !editing && (
          <div
            className="rounded-lg bg-white p-6 max-w-lg shadow-apple-card"
            data-testid="profile-card"
          >
            <p className="text-micro text-apple-textTertiary tracking-[-0.12px]">Name</p>
            <p
              className="font-semibold text-tile-heading text-ink-950 leading-[1.14]"
              data-testid="profile-name-display"
            >
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
            <Input
              id="profile-name"
              label="Name"
              value={name}
              onChange={setName}
              data-testid="profile-name-input"
            />
            <Input
              id="profile-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              data-testid="profile-email-input"
            />
            {updateProfile.isError && (
              <p className="text-red-600 text-caption">{updateProfile.error?.message}</p>
            )}
            <div className="flex gap-3">
              <Button type="submit" data-testid="profile-save-btn">
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(false)}
                data-testid="profile-cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <section
          className="mt-12 rounded-lg bg-white p-6 shadow-apple-card max-w-lg"
          data-testid="profile-change-password"
        >
          <h2
            className="font-display text-tile-heading font-semibold text-ink-950 mb-4 leading-[1.14]"
            data-testid="profile-change-password-heading"
          >
            Change password
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPwMessage("");
              if (newPassword !== confirmPassword) {
                setPwMessage("New passwords do not match.");
                return;
              }
              changePassword.mutate({ currentPassword, newPassword });
            }}
            className="space-y-4"
            data-testid="profile-change-password-form"
          >
            <Input
              id="profile-current-password"
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
              data-testid="profile-current-password-input"
            />
            <Input
              id="profile-new-password"
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              required
              minLength={6}
              data-testid="profile-new-password-input"
            />
            <Input
              id="profile-confirm-password"
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              data-testid="profile-confirm-password-input"
            />
            {pwMessage && (
              <p
                className={`text-caption ${pwMessage.includes("success") ? "text-green-700" : "text-red-600"}`}
                data-testid="profile-change-password-message"
              >
                {pwMessage}
              </p>
            )}
            <Button
              type="submit"
              disabled={changePassword.isPending}
              data-testid="profile-change-password-btn"
            >
              {changePassword.isPending ? "Saving…" : "Change password"}
            </Button>
          </form>
        </section>

        <section className="mt-12" data-testid="profile-orders">
          <h2
            className="font-display text-tile-heading font-semibold text-ink-950 mb-4 leading-[1.14]"
            data-testid="profile-orders-heading"
          >
            Orders
          </h2>
          {!orders?.length && (
            <p className="text-apple-textTertiary text-caption">No orders yet.</p>
          )}
          <ul className="space-y-3">
            {orders?.map((o) => (
              <li
                key={o.id}
                className="rounded-lg bg-white p-4 flex justify-between flex-wrap gap-2 items-center shadow-apple-card"
                data-testid={`profile-order-${o.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span
                    className="font-medium text-ink-950"
                    data-testid={`profile-order-total-${o.id}`}
                  >
                    {formatPrice(o.totalCents)}
                  </span>
                  <span
                    className="text-caption text-apple-textTertiary tracking-[-0.224px]"
                    data-testid={`profile-order-status-${o.id}`}
                  >
                    {o.paymentStatus} · {formatDate(o.createdAt)}
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
