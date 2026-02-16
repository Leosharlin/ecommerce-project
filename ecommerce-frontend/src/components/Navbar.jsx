import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/api";
import { CartContext } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const userName = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const normalizedName = userName.trim();
  const displayName =
    normalizedName.length > 0
      ? normalizedName.charAt(0).toUpperCase() +
        normalizedName.slice(1).toLowerCase()
      : "User";

  useEffect(() => {
    if (isAdmin) return;
    getProducts().then((res) => setProducts(res));
  }, [isAdmin]);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return products
      .filter((p) => (p.title || "").toLowerCase().startsWith(query))
      .slice(0, 6);
  }, [products, search]);

  const cartCount = useMemo(() => cart.length, [cart]);

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center gap-6 relative z-50">
      {/* Logo / Title -> Home */}
      <h1
        onClick={() => navigate(isAdmin ? "/admin" : "/user")}
        className="text-3xl font-extrabold text-black cursor-pointer tracking-wide"
      >
        Leo Store
      </h1>

      {/* Centered Search */}
      {!isAdmin && (
      <div className="flex-1 flex justify-center pl-40">
        <div className="w-full max-w-md relative">
          <div className="flex items-stretch border border-gray-300 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-gray-500">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 text-sm focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const q = search.trim();
                if (q) {
                  setShowSuggestions(false);
                  navigate(`/search?q=${encodeURIComponent(q)}`);
                }
              }
            }}
          />
          {search.trim() && (
            <button
              type="button"
              className="px-2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setShowSuggestions(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="px-4 bg-black text-white hover:bg-gray-800 flex items-center justify-center"
            aria-label="Search"
            onClick={() => {
              const q = search.trim();
              if (q) {
                setShowSuggestions(false);
                navigate(`/search?q=${encodeURIComponent(q)}`);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            {suggestions.map((p) => (
              <button
                key={p._id}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearch(p.title);
                  setShowSuggestions(false);
                  navigate(`/search?q=${encodeURIComponent(p.title)}`);
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
        </div>
      </div>
      )}

      {/* Right side links */}
      {isAdmin ? (
        <div className="ml-auto">
          <div className="relative group">
            <div className="flex items-center gap-2 text-gray-700 cursor-pointer select-none text-sm font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Admin</span>
            </div>

            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Admin Panel</p>
              </div>

              <div className="py-2 text-sm text-gray-700">
                <Link to="/admin" className="px-5 py-2 block hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link to="/admin/products" className="px-5 py-2 block hover:bg-gray-50">
                  Manage Products
                </Link>
                <Link to="/admin/orders" className="px-5 py-2 block hover:bg-gray-50">
                  View Orders
                </Link>
              </div>

              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  className="w-full border border-black text-black text-sm font-semibold py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="flex items-center gap-6 text-lg">
        <div className="relative group">
          <div className="flex items-center gap-2 text-gray-700 cursor-pointer select-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{displayName}</span>
          </div>

          <div className="absolute right-0 mt-3 w-[320px] bg-white border border-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-lg font-semibold text-gray-900 leading-none">Your Account</p>
            </div>

            <div className="py-2 text-sm text-gray-700">
              <Link
                to="/profile"
                className="px-6 py-3 block hover:bg-gray-50 transition-colors"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                className="px-6 py-3 block hover:bg-gray-50 transition-colors"
              >
                Orders
              </Link>
              <Link
                to="/wishlist"
                className="px-6 py-3 block hover:bg-gray-50 transition-colors"
              >
                Wishlist
              </Link>
              <div className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                Gift Cards
              </div>
              <div className="px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                Contact Us
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                className="w-full border border-black text-black text-sm font-semibold py-2 rounded hover:bg-gray-100 transition-colors"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <Link to="/wishlist" className="flex items-center gap-2 hover:text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          <span>Wishlist</span>
        </Link>

        <Link to="/cart" className="flex items-center gap-2 hover:text-black">
          <span className="relative inline-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6H19a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] leading-[18px] text-center rounded-full font-semibold">
                {cartCount}
              </span>
            )}
          </span>
          <span>Cart</span>
        </Link>
      </div>
      )}
    </nav>
  );
}

export default Navbar;
