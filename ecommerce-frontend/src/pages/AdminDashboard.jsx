import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, getProducts, updateOrderStatus } from "../services/api";

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function getLast7DaysSeries(orders) {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: 0 });
  }

  orders.forEach((order) => {
    const created = new Date(order.createdAt || Date.now()).toISOString().slice(0, 10);
    const day = days.find((d) => d.key === created);
    if (day) day.value += Number(order.totalAmount || 0);
  });

  return days;
}

function AdminDashboard() {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        getAllOrders(token),
        getProducts(),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const pendingOrders = orders.filter((order) => order.status === "Placed").length;
    const lowStock = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock) <= 5);
    const outOfStock = products.filter((p) => Number(p.stock || 0) === 0);

    return {
      totalOrders,
      totalRevenue,
      totalProducts: products.length,
      pendingOrders,
      lowStock,
      outOfStock,
    };
  }, [orders, products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [orders]);

  const revenueSeries = useMemo(() => getLast7DaysSeries(orders), [orders]);
  const maxRevenue = useMemo(
    () => Math.max(1, ...revenueSeries.map((d) => d.value)),
    [revenueSeries]
  );

  const statusData = useMemo(() => {
    const placed = orders.filter((o) => o.status === "Placed").length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const total = Math.max(1, placed + shipped + delivered);
    return [
      { label: "Placed", value: placed, color: "bg-amber-400", percent: (placed / total) * 100 },
      { label: "Shipped", value: shipped, color: "bg-sky-500", percent: (shipped / total) * 100 },
      { label: "Delivered", value: delivered, color: "bg-emerald-500", percent: (delivered / total) * 100 },
    ];
  }, [orders]);

  const handleQuickStatus = async (id, status) => {
    await updateOrderStatus(id, status, token);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Products</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Pending Orders</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-2 pr-3">Order</th>
                      <th className="py-2 pr-3">User</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 text-gray-900">#{order._id.slice(-6)}</td>
                        <td className="py-2 pr-3 text-gray-700">{order.userId?.email || "N/A"}</td>
                        <td className="py-2 pr-3 text-gray-900">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-2 pr-3">
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{order.status}</span>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            {order.status !== "Shipped" && order.status !== "Delivered" && (
                              <button
                                onClick={() => handleQuickStatus(order._id, "Shipped")}
                                className="px-2 py-1 text-[11px] rounded bg-amber-500 text-white hover:bg-amber-600"
                              >
                                Ship
                              </button>
                            )}
                            {order.status !== "Delivered" && (
                              <button
                                onClick={() => handleQuickStatus(order._id, "Delivered")}
                                className="px-2 py-1 text-[11px] rounded bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Deliver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Stock Alerts</h2>
            <div>
              <p className="text-xs text-gray-500 mb-2">Low Stock (1-5)</p>
              {stats.lowStock.length === 0 ? (
                <p className="text-xs text-gray-400">No low stock items.</p>
              ) : (
                <div className="space-y-2">
                  {stats.lowStock.slice(0, 6).map((p) => (
                    <div key={p._id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 truncate pr-2">{p.title}</span>
                      <span className="text-amber-600 font-semibold">{p.stock}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Out of Stock</p>
              {stats.outOfStock.length === 0 ? (
                <p className="text-xs text-gray-400">No out-of-stock items.</p>
              ) : (
                <div className="space-y-2">
                  {stats.outOfStock.slice(0, 6).map((p) => (
                    <div key={p._id} className="text-xs text-red-600 truncate">
                      {p.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/admin/products"
              className="inline-block text-xs text-blue-600 hover:underline"
            >
              Go to Manage Products
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4 xl:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Revenue (Last 7 Days)</h2>
            <div className="grid grid-cols-7 gap-2 items-end h-36">
              {revenueSeries.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${Math.max(6, (d.value / maxRevenue) * 100)}%` }}
                    title={`${d.label}: ${formatCurrency(d.value)}`}
                  />
                  <span className="text-[10px] text-gray-500">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Orders by Status</h2>
            <div className="space-y-3">
              {statusData.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{s.label}</span>
                    <span className="text-gray-500">{s.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2">
                    <div className={`${s.color} h-2 rounded`} style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/products" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Manage Products
            </Link>
            <Link to="/admin/orders" className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              View All Orders
            </Link>
            <button
              onClick={loadData}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
