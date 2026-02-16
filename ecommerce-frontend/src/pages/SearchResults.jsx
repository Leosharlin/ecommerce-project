import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProducts } from "../services/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery();
  const navigate = useNavigate();
  const openProductInNewTab = (id) => {
    window.open(`/product/${id}`, "_blank", "noopener,noreferrer");
  };
  const term = (query.get("q") || "").trim();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then((res) => setProducts(res));
  }, []);

  const matches = useMemo(() => {
    if (!term) return [];
    const q = term.toLowerCase();
    const normalizedQuery = q.replace(/\s+/g, "");
    return products.filter((p) => {
      const titleMatch = (p.title || "").toLowerCase().includes(q);
      const category = (p.category || "").toLowerCase().replace(/\s+/g, "");
      const categoryMatch = category.includes(normalizedQuery);
      return titleMatch || categoryMatch;
    });
  }, [products, term]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Search Results
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {term || "Search"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {matches.length} item{matches.length === 1 ? "" : "s"} found
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Browse our top picks tailored to your search.
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="mt-10 bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-700 font-semibold">No results</p>
            <p className="text-sm text-gray-500 mt-2">
              Try a different name or browse trending products.
            </p>
            <button
              className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => navigate("/user")}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((p) => (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => openProductInNewTab(p._id)}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Clean design, built for daily use
                    </p>
                    <p className="text-gray-900 font-bold mt-3">Rs {p.price}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    className="w-full border border-gray-300 rounded py-2 text-sm hover:bg-gray-50"
                    onClick={() => openProductInNewTab(p._id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;




