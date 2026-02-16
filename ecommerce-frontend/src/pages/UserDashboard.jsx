import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/api";
import ProductRow from "../components/ProductRow";

function UserDashboard() {
  const [products, setProducts] = useState([]);

  const inferCategory = (product) => {
    const normalizedCategory = (product.category || "").toLowerCase().replace(/\s+/g, "");
    if (normalizedCategory === "mouse" || normalizedCategory === "keyboard" || normalizedCategory === "mousepad") {
      return normalizedCategory;
    }

    const title = (product.title || "").toLowerCase();
    if (title.includes("mouse pad") || title.includes("mousepad")) return "mousepad";
    if (title.includes("keyboard")) return "keyboard";
    if (title.includes("mouse")) return "mouse";
    return "mouse";
  };

  useEffect(() => {
    getProducts().then((res) => setProducts(res));
  }, []);

  const grouped = useMemo(() => {
    const mouse = [];
    const keyboard = [];
    const mousepad = [];

    products.forEach((p) => {
      const category = inferCategory(p);
      if (category === "keyboard") keyboard.push(p);
      else if (category === "mousepad") mousepad.push(p);
      else mouse.push(p);
    });

    return { mouse, keyboard, mousepad };
  }, [products]);

  return (
    <div className="bg-white min-h-screen px-3 py-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-black text-base sm:text-lg font-semibold mb-4 sm:mb-6">Discover Products</h1>
        <ProductRow title="Mouse" products={grouped.mouse} />
        <ProductRow title="Keyboard" products={grouped.keyboard} />
        <ProductRow title="Mouse Pad" products={grouped.mousepad} />
      </div>
    </div>
  );
}

export default UserDashboard;
