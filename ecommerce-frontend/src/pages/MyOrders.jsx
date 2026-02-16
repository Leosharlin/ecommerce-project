import { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    getMyOrders(token).then(setOrders);
  }, []);

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        My Orders 📦
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders yet</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <div className="flex justify-between mb-3">
                <h2 className="font-semibold">
                  Order ID: {o._id.slice(-6)}
                </h2>
                <span className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded">
                  {o.status}
                </span>
              </div>

              <p className="text-gray-600 mb-2">
                Items: {o.products.length}
              </p>

              <p className="font-bold text-lg">
                Total: ₹ {o.totalAmount}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
