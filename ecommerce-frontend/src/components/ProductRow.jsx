import Slider from "react-slick";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function ProductRow({ title, products }) {
  const { cart, addToCart, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();

  const openProductInNewTab = (id) => {
    window.open(`/product/${id}`, "_blank", "noopener,noreferrer");
  };

  const settings = {
    infinite: products.length > 5,
    arrows: true,
    slidesToShow: Math.min(5, Math.max(products.length, 1)),
    slidesToScroll: 1,
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>

      {products.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
          No products in this category yet.
        </div>
      ) : (
      <Slider {...settings}>
        {products.map((p) => {
          const itemInCart = cart.find((item) => item._id === p._id);
          const qty = itemInCart?.qty ?? 0;

          return (
            <div key={p._id} className="px-3">
              <div className="border border-gray-200 p-4 rounded-lg hover:border-gray-400 transition-colors">
                <div className="cursor-pointer" onClick={() => openProductInNewTab(p._id)}>
                  <img src={p.image} className="h-40 w-full object-cover rounded" loading="lazy" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-gray-900 font-semibold">Rs {p.price}</p>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 items-center">
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(p)}
                      className="w-full h-[40px] box-border bg-white text-gray-900 text-sm font-semibold border-[2px] border-black rounded-md transition-colors hover:bg-black hover:text-white whitespace-nowrap flex items-center justify-center"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between border border-gray-300 rounded bg-gray-50">
                      <button onClick={() => decreaseQty(p._id)} className="px-2 py-1 text-base">
                        -
                      </button>
                      <span className="px-2 text-sm font-semibold">{qty}</span>
                      <button onClick={() => addToCart(p)} className="px-2 py-1 text-base">
                        +
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      navigate("/checkout", { state: { buyNow: p } });
                    }}
                    className="w-full h-[40px] box-border bg-black text-white text-sm font-semibold border-[2px] border-black rounded-md transition-colors hover:bg-white hover:text-black whitespace-nowrap flex items-center justify-center"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
      )}
    </div>
  );
}

export default ProductRow;
