import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const WISHLIST_KEY = "wishlist_items";

const getWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const openProductInNewTab = (id) => {
    window.open(`/product/${id}`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const sync = () => setItems(getWishlist());
    sync();
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, []);

  const removeItem = (id) => {
    const next = items.filter((item) => item._id !== id);
    setItems(next);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const countText = useMemo(() => `My Wishlist (${items.length})`, [items.length]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">{countText}</h1>
        </div>

        {items.length === 0 ? (
          <div className="px-8 py-14">
            <div className="bg-gray-50 border border-gray-200 rounded-xl py-14 px-6 text-center">
              <div className="mx-auto w-28 h-28 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 text-gray-700"
                  aria-hidden="true"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-gray-900">Your wishlist is empty!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Save products you love and revisit them anytime.
              </p>
              <button
                type="button"
                onClick={() => navigate("/user")}
                className="mt-5 px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Explore Products
              </button>
            </div>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <div
                key={item._id}
                className="relative px-8 py-7 border-b border-gray-100"
              >
                <button
                  type="button"
                  onClick={() => openProductInNewTab(item._id)}
                  className="group w-full pr-12 text-left"
                >
                  <div className="flex items-start gap-6 rounded-md transition-colors group-hover:bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-28 h-28 object-cover rounded-sm mt-1"
                      loading="lazy"
                    />

                    <div className="flex-1 flex flex-col items-start">
                      <span className="block w-full text-left text-gray-900 text-sm leading-5 transition-colors group-hover:text-black">
                        {item.title}
                      </span>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-2xl font-semibold text-gray-900">
                          Rs {item.price}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          Rs {Math.round(item.price * 1.35)}
                        </span>
                        <span className="text-sm text-gray-700 font-semibold">
                          26% off
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(item._id)}
                  className="absolute right-8 top-8 text-gray-300 hover:text-red-500 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
