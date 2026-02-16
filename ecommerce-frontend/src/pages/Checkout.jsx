import { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import { placeOrder } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

const ADDRESS_KEY = "user_addresses";

function getSavedAddresses() {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const [addresses] = useState(getSavedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    getSavedAddresses()[0]?.id || ""
  );
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowItem = location.state?.buyNow;
  const orderItems = buyNowItem ? [{ ...buyNowItem, qty: 1 }] : cart;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const addressPreview = selectedAddress
    ? [selectedAddress.doorBlock, selectedAddress.line, selectedAddress.city, selectedAddress.state]
        .filter(Boolean)
        .join(", ")
    : "";
  const shortAddress =
    addressPreview.length > 52 ? `${addressPreview.slice(0, 52)}...` : `${addressPreview}...`;
  const hasSavedAddress = Boolean(selectedAddress);
  const currentStep = hasSavedAddress ? 2 : 1;

  const itemCount = useMemo(
    () => orderItems.reduce((sum, p) => sum + (p.qty || 1), 0),
    [orderItems]
  );

  const mrp = useMemo(
    () => orderItems.reduce((sum, p) => sum + p.price * (p.qty || 1), 0),
    [orderItems]
  );

  const fee = itemCount > 0 ? itemCount * 7 : 0;
  const discount = mrp > 0 ? Math.round(mrp * 0.05) : 0;
  const total = mrp + fee - discount;

  const handleCheckout = async () => {
    if (!hasSavedAddress) {
      alert("Please add and select an address first");
      return;
    }

    if (orderItems.length === 0) {
      alert("No items in checkout");
      return;
    }

    const orderProducts = [...orderItems];
    const res = await placeOrder(orderProducts, token);

    if (res.msg) {
      if (!buyNowItem) {
        clearCart();
      }
      navigate("/success");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <div className="bg-white border border-gray-200 rounded">
            <div className="grid grid-cols-3 text-sm text-center border-b border-gray-100">
              <div
                className={`py-3 font-semibold ${
                  currentStep === 1 ? "text-black" : "text-gray-700"
                }`}
              >
                1. Address
              </div>
              <div
                className={`py-3 font-semibold ${
                  currentStep >= 2 ? "text-black" : "text-gray-400"
                }`}
              >
                2. Order Summary
              </div>
              <div className="py-3 text-gray-400">3. Payment</div>
            </div>

            <div className="p-4">
              {addresses.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    No saved address found. Add address in profile to continue.
                  </p>
                  <button
                    onClick={() => navigate("/profile#addresses")}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  {selectedAddress && (
                    <div className="border border-gray-200 rounded p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-left">
                          <p className="text-lg font-normal text-gray-900">
                            Deliver to: {selectedAddress.name || "User"}, {selectedAddress.pincode}
                            <span className="ml-3 px-2 py-1 text-xs uppercase bg-gray-100 text-gray-600 rounded">
                              {selectedAddress.addressType || "Home"}
                            </span>
                          </p>
                          <p className="mt-1 text-gray-700">{shortAddress}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsChangingAddress((prev) => !prev)}
                          className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50"
                        >
                          {isChangingAddress ? "Done" : "Change"}
                        </button>
                      </div>

                      {isChangingAddress && (
                        <select
                          className="mt-3 w-full border border-gray-300 rounded p-2 text-sm"
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                        >
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {(a.name || "User")} - {a.city} ({a.pincode})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!hasSavedAddress ? (
            <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-500">
              Save/select an address to unlock Order Summary.
            </div>
          ) : orderItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-600">
              No items to checkout.
            </div>
          ) : (
            orderItems.map((item) => (
              <div key={item._id} className="bg-white border border-gray-200 rounded p-4 text-left">
                <div className="flex gap-4 items-start">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded border border-gray-200"
                  />

                  <div className="flex-1 text-left">
                    <h2 className="text-lg font-semibold text-gray-900 text-left">{item.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {item.qty || 1}
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      Rs. {item.price * (item.qty || 1)}
                    </p>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`delivery-${item._id}`} defaultChecked />
                        Express delivery by tomorrow
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name={`delivery-${item._id}`} />
                        Standard delivery in 2 days
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white border border-gray-200 rounded">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600">PRICE DETAILS</h3>
            </div>

            <div className="p-4 space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>MRP ({itemCount} items)</span>
                <span>Rs. {mrp}</span>
              </div>
              <div className="flex justify-between">
                <span>Fees</span>
                <span>Rs. {fee}</span>
              </div>
              <div className="flex justify-between text-gray-900">
                <span>Discount</span>
                <span>-Rs. {discount}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span>Rs. {total}</span>
              </div>

              <div className="bg-gray-100 text-gray-800 text-sm rounded p-2">
                You save Rs. {discount} on this order.
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!hasSavedAddress || orderItems.length === 0}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:text-gray-500 text-gray-900 font-semibold py-3 rounded"
          >
            Continue
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
