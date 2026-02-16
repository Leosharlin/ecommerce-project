import { useEffect, useMemo, useState } from "react";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../services/api";

function AdminProducts() {
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    stock: "",
    image: "",
    imagesText: "",
    description: "",
    category: "mouse",
    descriptionMode: "text",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    image: "",
    imagesText: "",
    description: "",
    category: "mouse",
    descriptionMode: "text",
  });

  const loadProducts = async () => {
    const data = await getProducts();
    const list = Array.isArray(data) ? data : [];
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const imagePreview = useMemo(() => form.image.trim(), [form.image]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      stock: "",
      image: "",
      imagesText: "",
      description: "",
      category: "mouse",
      descriptionMode: "text",
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        price: Number(form.price),
        stock: Number(form.stock || 0),
        image: form.image.trim(),
        images: form.imagesText
          .split(/\r?\n/)
          .map((url) => url.trim())
          .filter(Boolean),
        description: form.description.trim(),
        category: form.category,
        descriptionMode: form.descriptionMode,
      };

      const res = await addProduct(payload, token);
      if (res?._id) {
        setMessage("Product added successfully");
        resetForm();
        loadProducts();
      } else {
        setMessage(res?.msg || "Unable to add product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteProduct(id, token);
    loadProducts();
  };

  const beginEdit = (p) => {
    setEditingId(p._id);
    setEditForm({
      title: p.title || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? 0),
      image: p.image || "",
      imagesText: Array.isArray(p.images) ? p.images.join("\n") : "",
      description: p.description || "",
      category: p.category || "mouse",
      descriptionMode: p.descriptionMode || "text",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      price: "",
      stock: "",
      image: "",
      imagesText: "",
      description: "",
      category: "mouse",
      descriptionMode: "text",
    });
  };

  const handleSaveEdit = async (id) => {
    const payload = {
      title: editForm.title.trim(),
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      image: editForm.image.trim(),
      images: editForm.imagesText
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean),
      description: editForm.description.trim(),
      category: editForm.category,
      descriptionMode: editForm.descriptionMode,
    };

    if (!payload.title || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) return;

    try {
      setMessage("");
      await updateProduct(id, payload, token);
      setMessage("Product updated successfully");
      cancelEdit();
      loadProducts();
    } catch (err) {
      setMessage(err.message || "Unable to update product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-lg p-5">
          <h1 className="text-lg font-semibold text-gray-900">Add New Product</h1>
          <p className="mt-1 text-xs text-gray-500">Fill all required details carefully.</p>

          <form className="mt-4 space-y-3" onSubmit={handleAddProduct}>
            <input
              type="text"
              required
              placeholder="Product title"
              className="w-full border border-gray-300 rounded p-3 bg-white text-sm"
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                required
                placeholder="Price"
                className="w-full border border-gray-300 rounded p-3 bg-white text-sm"
                value={form.price}
                onChange={(e) => onChange("price", e.target.value)}
              />
              <input
                type="number"
                min="0"
                required
                placeholder="Stock"
                className="w-full border border-gray-300 rounded p-3 bg-white text-sm"
                value={form.stock}
                onChange={(e) => onChange("stock", e.target.value)}
              />
            </div>
            <input
              type="url"
              required
              placeholder="Image URL"
              className="w-full border border-gray-300 rounded p-3 bg-white text-sm"
              value={form.image}
              onChange={(e) => onChange("image", e.target.value)}
            />
            <textarea
              rows={3}
              placeholder="Additional image URLs (one per line)"
              className="w-full border border-gray-300 rounded p-3 bg-white text-sm resize-none"
              value={form.imagesText}
              onChange={(e) => onChange("imagesText", e.target.value)}
            />
            <textarea
              rows={4}
              placeholder="Product description"
              className="w-full border border-gray-300 rounded p-3 bg-white text-sm resize-none"
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
            <select
              className="w-full border border-gray-300 rounded p-3 bg-white text-sm"
              value={form.descriptionMode}
              onChange={(e) => onChange("descriptionMode", e.target.value)}
            >
              <option value="text">Description: Normal Text</option>
              <option value="points">Description: Bullet Points</option>
            </select>
            <select
              className="w-full border border-gray-300 rounded p-3 bg-white text-sm"
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
            >
              <option value="mouse">Mouse</option>
              <option value="keyboard">Keyboard</option>
              <option value="mousepad">Mouse Pad</option>
            </select>

            {imagePreview && (
              <div className="border border-gray-200 rounded p-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-44 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add Product"}
            </button>
          </form>

          {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Manage Products</h2>
            <span className="text-xs text-gray-500">{products.length} items</span>
          </div>

          {products.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">No products available.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {editingId === p._id ? (
                    <div className="p-3 space-y-2">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="1"
                          className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                          value={editForm.price}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                        />
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                          value={editForm.stock}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))}
                        />
                      </div>
                      <input
                        type="url"
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                        value={editForm.image}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, image: e.target.value }))}
                      />
                      <textarea
                        rows={3}
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white resize-none"
                        value={editForm.imagesText}
                        placeholder="Additional image URLs (one per line)"
                        onChange={(e) => setEditForm((prev) => ({ ...prev, imagesText: e.target.value }))}
                      />
                      <textarea
                        rows={3}
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white resize-none"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                      />
                      <select
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                        value={editForm.descriptionMode}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, descriptionMode: e.target.value }))
                        }
                      >
                        <option value="text">Description: Normal Text</option>
                        <option value="points">Description: Bullet Points</option>
                      </select>
                      <select
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                        value={editForm.category}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="mouse">Mouse</option>
                        <option value="keyboard">Keyboard</option>
                        <option value="mousepad">Mouse Pad</option>
                      </select>
                      {editForm.image && (
                        <img src={editForm.image} alt="Edit preview" className="w-full h-36 object-cover rounded" />
                      )}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleSaveEdit(p._id)}
                          className="col-span-2 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                        <p className="mt-1 text-xs text-gray-600 min-h-[32px]">
                          {p.description || "No description"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                          {p.category || "mouse"}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-900">Rs {p.price}</span>
                          <span
                            className={`text-xs font-semibold ${
                              Number(p.stock || 0) === 0
                                ? "text-red-600"
                                : Number(p.stock || 0) <= 5
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            Stock: {p.stock ?? 0}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => beginEdit(p)}
                            className="py-2 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
