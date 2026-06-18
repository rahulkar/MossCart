import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { Link } from "react-router-dom";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { formatPrice } from "../lib/format.js";

const emptyForm = {
  name: "",
  subtitle: "",
  sku: "",
  description: "",
  priceCents: "",
  stock: "",
  category: "",
  ecoScore: "",
  imageUrl: "",
};

export default function AdminProducts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api("/api/products/categories"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", "", "", "", page],
    queryFn: () => api(`/api/products?page=${page}&pageSize=12`),
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const create = useMutation({
    mutationFn: (body) => api("/api/products", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-categories"] });
      setForm(emptyForm);
      setMessage("Product created.");
    },
    onError: (err) => setMessage(err.message),
  });

  const update = useMutation({
    mutationFn: ({ id, body }) =>
      api(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-categories"] });
      setForm(emptyForm);
      setEditingId(null);
      setMessage("Product updated.");
    },
    onError: (err) => setMessage(err.message),
  });

  const remove = useMutation({
    mutationFn: (id) => api(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setMessage("Product deleted.");
    },
    onError: (err) => setMessage(err.message),
  });

  if (!user) {
    return (
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-admin-products-guest">
          <Link to="/login" className="text-apple-link font-semibold hover:underline">
            Log in
          </Link>{" "}
          as an admin to manage products.
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="bg-apple-gray min-h-full w-full">
        <div className="layout-container py-16 text-center" data-testid="page-admin-products-forbidden">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    setMessage("");
    const body = {
      ...form,
      priceCents: Number(form.priceCents),
      stock: Number(form.stock),
      ecoScore: Number(form.ecoScore),
    };
    if (editingId) {
      update.mutate({ id: editingId, body });
    } else {
      create.mutate(body);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      subtitle: p.subtitle || "",
      sku: p.sku || "",
      description: p.description || "",
      priceCents: String(p.priceCents ?? ""),
      stock: String(p.stock ?? ""),
      category: p.category || "",
      ecoScore: String(p.ecoScore ?? ""),
      imageUrl: p.imageUrl || "",
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  return (
    <div className="bg-apple-gray min-h-full w-full">
      <div className="layout-container py-10" data-testid="page-admin-products">
        <h1
          className="font-display text-section-heading font-semibold text-ink-950 mb-8 leading-[1.1]"
          data-testid="admin-products-title"
        >
          Admin products
        </h1>

        <form
          onSubmit={submit}
          className="rounded-lg bg-white p-6 shadow-apple-card mb-10 space-y-4 max-w-3xl"
          data-testid="admin-product-form"
        >
          <h2 className="font-semibold text-tile-heading text-ink-950 leading-[1.14]">
            {editingId ? "Edit product" : "Create product"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="ap-name" label="Name" value={form.name} onChange={setField("name")} required />
            <Input id="ap-sku" label="SKU" value={form.sku} onChange={setField("sku")} />
            <Input
              id="ap-subtitle"
              label="Subtitle"
              value={form.subtitle}
              onChange={setField("subtitle")}
            />
            <Input
              id="ap-category"
              label="Category"
              value={form.category}
              onChange={setField("category")}
              required
              list="admin-categories"
              data-testid="admin-product-category"
            />
            <datalist id="admin-categories">
              {categories?.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Input
              id="ap-price"
              label="Price (cents)"
              type="number"
              value={form.priceCents}
              onChange={setField("priceCents")}
              required
            />
            <Input
              id="ap-stock"
              label="Stock"
              type="number"
              value={form.stock}
              onChange={setField("stock")}
              required
            />
            <Input
              id="ap-eco"
              label="Eco score (1-5)"
              type="number"
              value={form.ecoScore}
              onChange={setField("ecoScore")}
              required
            />
            <Input
              id="ap-image"
              label="Image URL"
              value={form.imageUrl}
              onChange={setField("imageUrl")}
            />
          </div>
          <div>
            <label
              htmlFor="ap-description"
              className="block text-caption font-semibold text-ink-950 mb-1 tracking-[-0.224px]"
            >
              Description
            </label>
            <textarea
              id="ap-description"
              value={form.description}
              onChange={(e) => setField("description")(e.target.value)}
              required
              rows={3}
              className="w-full rounded-[11px] bg-apple-filterBg border-[3px] border-apple-filterBorder px-3.5 py-2.5 text-[17px] text-ink-950 focus:ring-2 focus:ring-accent outline-none"
              data-testid="admin-product-description"
            />
          </div>
          {message && (
            <p className="text-caption text-apple-textSecondary" data-testid="admin-product-message">
              {message}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {isLoading && <p className="text-apple-textTertiary">Loading…</p>}

        <div className="rounded-lg bg-white shadow-apple-card overflow-x-auto" data-testid="admin-products-table">
          <table className="w-full text-left text-caption">
            <thead className="bg-apple-gray text-apple-textSecondary">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Eco</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-apple-gray" data-testid={`admin-product-row-${p.id}`}>
                  <td className="px-4 py-3 text-ink-950 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(p.priceCents)}</td>
                  <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                  <td className="px-4 py-3 tabular-nums">{p.ecoScore}/5</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-apple-link font-semibold hover:underline"
                        data-testid={`admin-product-edit-${p.id}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove.mutate(p.id)}
                        className="text-red-600 font-semibold hover:underline"
                        data-testid={`admin-product-delete-${p.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-apple-textTertiary">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Admin product pagination">
            <button
              type="button"
              onClick={() => setPage((pg) => Math.max(1, pg - 1))}
              disabled={page <= 1}
              className="rounded-lg bg-white px-3 py-2 text-caption font-medium text-ink-950 shadow-apple-card disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-caption text-apple-textSecondary">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((pg) => Math.min(totalPages, pg + 1))}
              disabled={page >= totalPages}
              className="rounded-lg bg-white px-3 py-2 text-caption font-medium text-ink-950 shadow-apple-card disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
