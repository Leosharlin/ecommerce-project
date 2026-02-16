import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const validatePassword = (value) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(value)) return "Password must include at least 1 uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must include at least 1 lowercase letter.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include at least 1 special character.";
  return "";
};

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const passError = validatePassword(password);
    const confirmError =
      !confirmPassword
        ? "Please retype your password."
        : password !== confirmPassword
        ? "Passwords do not match."
        : "";

    setPasswordError(passError);
    setConfirmPasswordError(confirmError);
    if (passError || confirmError) return;

    setLoading(true);
    const res = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });
    setLoading(false);
    setMessage(res.msg || "Please try again");

    if (res.msg?.toLowerCase().includes("verification email sent")) {
      navigate(`/email-verification?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-2xl w-96"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create Account ✨
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="First name"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last name (optional)"
            className="w-full border border-gray-300 p-3 mt-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
              setPasswordError(validatePassword(value));
              if (confirmPassword) {
                setConfirmPasswordError(
                  value !== confirmPassword ? "Passwords do not match." : ""
                );
              }
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>

        </div>
        {passwordError && <p className="text-xs text-red-600 mb-3 text-left">{passwordError}</p>}

        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Retype Password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);
              setConfirmPasswordError(
                password !== value ? "Passwords do not match." : ""
              );
            }}
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 cursor-pointer text-gray-600"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {confirmPasswordError && (
          <p className="text-xs text-red-600 mb-3 text-left">{confirmPasswordError}</p>
        )}


        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {message && <p className="text-sm text-gray-700 mt-3 text-left">{message}</p>}

        <p className="text-center mt-5 text-gray-700">
          Already have an account?{" "}
          <Link to="/" className="text-black font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
