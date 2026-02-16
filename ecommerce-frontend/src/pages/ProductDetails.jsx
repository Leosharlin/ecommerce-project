import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts } from "../services/api";
import { CartContext } from "../context/CartContext";

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

const toDescriptionPoints = (text) => {
  const normalize = (value) =>
    value
      .replace(/^[-*•\s]+/, "")
      .replace(/\s+/g, " ")
      .trim();

  if (!text) return [];

  const lineBullets = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*•]\s*/.test(line))
    .map(normalize)
    .filter((line) => line.length > 1);

  if (lineBullets.length > 0) return lineBullets;

  const inlineBullets = text
    .split(/(?:^|\s)-\s*/)
    .map(normalize)
    .filter((part) => part.length > 1);

  if (inlineBullets.length > 1) return inlineBullets;

  return text
    .split(/\r?\n/)
    .map(normalize)
    .filter((line) => line.length > 1);
};

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then((res) => {
      const found = res.find((p) => p._id === id);
      setProduct(found || null);
    });
  }, [id]);

  useEffect(() => {
    if (!product?._id) return;
    const items = getWishlist();
    setIsWishlisted(items.some((item) => item._id === product._id));
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const extra = Array.isArray(product.images) ? product.images : [];
    return [product.image, ...extra].filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (!galleryImages.length) return;
    setSelectedImage(galleryImages[0]);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [galleryImages]);

  const description = useMemo(() => {
    if (!product) return "";
    if (product.description?.trim()) return product.description.trim();
    return "";
  }, [product]);

  const showDescriptionAsPoints = (product?.descriptionMode || "text") === "points";
  const descriptionPoints = useMemo(() => toDescriptionPoints(description), [description]);

  const toggleWishlist = () => {
    if (!product) return;
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 220);

    const items = getWishlist();
    const exists = items.some((item) => item._id === product._id);
    const next = exists
      ? items.filter((item) => item._id !== product._id)
      : [...items, { _id: product._id, title: product.title, image: product.image, price: product.price }];

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setIsWishlisted(!exists);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(2))));
  const handleZoomOut = () =>
    setZoomLevel((z) => {
      const next = Math.max(1, Number((z - 0.2).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const stopDragging = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (zoomLevel <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-5 sm:py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-10">
        <div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
            <div
              className={`relative overflow-hidden rounded-lg border border-gray-100 ${
                zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={stopDragging}
            >
              <img
                src={selectedImage || product.image}
                alt={product.title}
                className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover rounded-lg transition-transform duration-200"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})` }}
                loading="lazy"
                draggable={false}
              />

              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="h-8 w-8 rounded border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-50"
                  aria-label="Zoom out"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="px-2 h-8 rounded border border-gray-300 bg-white text-xs font-semibold hover:bg-gray-50"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="h-8 w-8 rounded border border-gray-300 bg-white text-sm font-semibold hover:bg-gray-50"
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {galleryImages.map((img, i) => (
              <button
                type="button"
                key={`${img}-${i}`}
                onClick={() => {
                  setSelectedImage(img);
                  setZoomLevel(1);
                  setPan({ x: 0, y: 0 });
                }}
                className={`bg-white rounded-lg border p-2 ${
                  selectedImage === img ? "border-black" : "border-gray-200"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.title} ${i + 1}`}
                  className="w-full h-16 sm:h-24 object-cover rounded"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.title}</h1>
            <button
              type="button"
              onClick={toggleWishlist}
              className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`h-7 w-7 transition-all duration-200 ${
                  isWishlisted ? "text-red-500" : "text-gray-500"
                } ${heartPop ? "scale-125" : "scale-100"}`}
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </button>
          </div>

          {showDescriptionAsPoints ? (
            <ul className="mt-3 ml-1 pl-5 list-disc list-outside text-sm text-gray-600 text-left space-y-2">
              {descriptionPoints.map((point, idx) => (
                <li key={`${product._id}-desc-${idx}`} className="text-left leading-7">
                  {point}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-3">{description}</p>
          )}

          <div className="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4">
            <span className="text-2xl font-bold text-gray-900">Rs {product.price}</span>
            <span className="text-sm text-gray-600 font-semibold">Inclusive of all taxes</span>
          </div>

          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              className="flex-1 min-h-[40px] bg-white text-gray-900 text-sm font-semibold border-[2px] border-black py-1 px-4 rounded-lg transition-colors hover:bg-black hover:text-white whitespace-normal leading-snug text-center"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
            <button
              className="flex-1 min-h-[40px] bg-black text-white text-sm font-semibold border-[2px] border-black py-1 px-4 rounded-lg transition-colors hover:bg-white hover:text-black whitespace-normal leading-snug text-center"
              onClick={() => {
                navigate("/checkout", { state: { buyNow: product } });
              }}
            >
              Buy Now
            </button>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-4">
            <p className="text-xs uppercase tracking-widest text-gray-400">Delivery</p>
            <p className="text-sm text-gray-600 mt-2">
              Free delivery on orders above Rs 499. Easy 7-day returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
