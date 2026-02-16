import { useState } from "react";
import { forgotPassword } from "../services/api";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await forgotPassword(email.trim());
    setMessage(res.msg || "Please try again");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded-xl shadow-md w-96" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-3 mb-4 rounded bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && <p className="text-sm text-gray-700 mt-3 text-left">{message}</p>}

        <p className="text-center mt-4">
          <Link to="/" className="text-black underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
