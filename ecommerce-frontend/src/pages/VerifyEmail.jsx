import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      const res = await verifyEmail(token);
      setMessage(res.msg || "Unable to verify email");
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-xl shadow-2xl w-96 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Email Verification</h1>
        <p className="text-gray-700 mb-5">{message}</p>
        <Link to="/" className="text-black font-semibold">
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmail;
