import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, addToCart, decreaseQty, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">My Cart ({cart.length})</h1>
        </div>

        {cart.length === 0 ? (
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
                  className="h-12 w-12 text-gray-500"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6H19a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-gray-900">Your cart is empty!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Explore our products and add your favorites to cart.
              </p>
              <button
                type="button"
                onClick={() => navigate("/user")}
                className="mt-5 px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              {cart.map((item) => (
                <div key={item._id} className="relative px-8 py-7 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded-md"
                        loading="lazy"
                      />

                      <div className="min-w-0 text-left">
                        <h2 className="text-sm text-gray-900 leading-5">{item.title}</h2>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                          Rs {item.price * item.qty}
                        </p>
                        <p className="text-xs text-gray-500">Rs {item.price} each</p>

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => decreaseQty(item._id)}
                            className="w-8 h-8 border border-gray-300 rounded text-lg leading-none hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-semibold">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 border border-gray-300 rounded text-lg leading-none hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate("/checkout")}
                            className="ml-3 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="mt-1 text-gray-300 hover:text-red-500 transition-colors"
                      aria-label="Remove from cart"
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
                </div>
              ))}
            </div>

            <div className="px-8 py-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">Rs {total}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
