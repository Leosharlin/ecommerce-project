import { useEffect, useMemo, useState } from "react";
import { deleteOrder, getAllOrders, updateOrderStatus } from "../services/api";

function fmtCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminOrders() {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const placed = orders.filter((o) => o.status === "Placed").length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    return { placed, shipped, delivered, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .filter((o) => (statusFilter === "All" ? true : o.status === statusFilter))
      .filter((o) => {
        if (!query) return true;
        const orderId = (o._id || "").toLowerCase();
        const email = (o.userId?.email || "").toLowerCase();
        return orderId.includes(query) || email.includes(query);
      });
  }, [orders, statusFilter, search]);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status, token);
    setMessage(`Order status updated to ${status}`);
    loadOrders();
  };

  const handleDelete = async (id) => {
    await deleteOrder(id, token);
    setMessage("Order deleted");
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h1 className="text-lg font-semibold text-gray-900">Admin Orders</h1>
          <p className="mt-1 text-xs text-gray-500">Track, filter and update customer orders.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Placed</p>
            <p className="text-xl font-semibold text-gray-900">{stats.placed}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Shipped</p>
            <p className="text-xl font-semibold text-gray-900">{stats.shipped}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Delivered</p>
            <p className="text-xl font-semibold text-gray-900">{stats.delivered}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="text-xl font-semibold text-gray-900">{fmtCurrency(stats.revenue)}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Placed", "Shipped", "Delivered"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs rounded border ${
                    statusFilter === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search by order ID or user email"
              className="w-full md:w-80 border border-gray-300 rounded p-2 text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {message && <p className="mt-3 text-xs text-gray-700">{message}</p>}

          {loading ? (
            <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No orders found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 pr-3">Order</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Items</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 text-gray-900">#{o._id.slice(-6)}</td>
                      <td className="py-2 pr-3 text-gray-700">{o.userId?.email || "N/A"}</td>
                      <td className="py-2 pr-3 text-gray-900">{o.products?.length || 0}</td>
                      <td className="py-2 pr-3 text-gray-900">{fmtCurrency(o.totalAmount)}</td>
                      <td className="py-2 pr-3">
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{o.status}</span>
                      </td>
                      <td className="py-2 pr-3 text-gray-600">{fmtDate(o.createdAt)}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          {o.status !== "Shipped" && o.status !== "Delivered" && (
                            <button
                              onClick={() => handleStatus(o._id, "Shipped")}
                              className="px-2 py-1 text-[11px] rounded bg-amber-500 text-white hover:bg-amber-600"
                            >
                              Ship
                            </button>
                          )}
                          {o.status !== "Delivered" && (
                            <button
                              onClick={() => handleStatus(o._id, "Delivered")}
                              className="px-2 py-1 text-[11px] rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Deliver
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(o._id)}
                            className="px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                            aria-label="Delete order"
                            title="Delete order"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3.5 w-3.5"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
