import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../services/api";

const validatePassword = (value) => {
  if (value.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(value)) return "Password must include at least 1 uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must include at least 1 lowercase letter.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include at least 1 special character.";
  return "";
};

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
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
    const res = await resetPassword(token, password);
    setMessage(res.msg || "Please try again");
    setLoading(false);
    if ((res.msg || "").toLowerCase().includes("successful")) {
      setTimeout(() => navigate("/"), 1200);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md" onSubmit={handleReset}>
        <h1 className="text-xl mb-4 text-left">Reset Password</h1>
        <label className="block text-sm text-gray-700 mb-1 text-left">New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          className="border p-2 mb-3 w-full bg-white"
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
          required
        />
        {passwordError && <p className="text-xs text-red-600 mb-2 text-left">{passwordError}</p>}
        <label className="block text-sm text-gray-700 mb-1 text-left">Retype Password</label>
        <input
          type="password"
          placeholder="Retype password"
          className="border p-2 mb-4 w-full bg-white"
          value={confirmPassword}
          onChange={(e) => {
            const value = e.target.value;
            setConfirmPassword(value);
            setConfirmPasswordError(
              password !== value ? "Passwords do not match." : ""
            );
          }}
          required
        />
        {confirmPasswordError && (
          <p className="text-xs text-red-600 mb-2 text-left">{confirmPasswordError}</p>
        )}
        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset"}
        </button>
        {message && <p className="text-sm text-gray-700 mt-3 text-left">{message}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;
