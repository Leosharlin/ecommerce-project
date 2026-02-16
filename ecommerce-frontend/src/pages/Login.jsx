import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = await loginUser({ email, password });

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      const derivedName =
        data.name ||
        data.firstName ||
        data.user?.name ||
        data.user?.firstName ||
        email.split("@")[0];
      localStorage.setItem("name", derivedName);
      const [firstName = "", ...rest] = derivedName.split(" ");
      const currentProfile = (() => {
        try {
          return JSON.parse(localStorage.getItem("profile_info") || "{}");
        } catch {
          return {};
        }
      })();
      localStorage.setItem(
        "profile_info",
        JSON.stringify({
          firstName:
            data.firstName || data.user?.firstName || currentProfile.firstName || firstName,
          lastName:
            data.lastName || data.user?.lastName || currentProfile.lastName || rest.join(" "),
          email: data.email || data.user?.email || currentProfile.email || email,
          mobile: currentProfile.mobile || "",
          gender: currentProfile.gender || "male",
        })
      );
      navigate(data.role === "admin" ? "/admin" : "/user");
    } else {
      alert(data.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-2xl w-96"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Leo Store
        </h1>

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
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

        </div>


        <p className="text-right mb-4">
          <Link to="/forgot" className="text-black text-sm">
              Forgot Password?
          </Link>
        </p>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Login
        </button>

        <p className="text-center mt-5 text-gray-700">
          Don't have an account?{" "}
          <Link to="/register" className="text-black font-semibold">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

