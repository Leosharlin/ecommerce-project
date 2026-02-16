import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerificationEmail } from "../services/api";

function EmailVerificationPending() {
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [statusMessage, setStatusMessage] = useState("");
  const canResend = secondsLeft === 0;

  useEffect(() => {
    if (secondsLeft === 0) return;
    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (!email || !canResend) return;
    const res = await resendVerificationEmail(email);
    setStatusMessage(res.msg || "Unable to resend email");
    if ((res.msg || "").toLowerCase().includes("resent")) {
      setSecondsLeft(30);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-xl shadow-2xl w-96 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Verify Your Email</h1>
        <p className="text-gray-700 mb-2">We sent a verification link to:</p>
        <p className="text-gray-900 font-semibold break-all mb-4">{email || "your email"}</p>
        <p className="text-sm text-gray-600 mb-5">
          Didn&apos;t receive it? You can resend after {secondsLeft}s.
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || !email}
          className={`w-full py-3 rounded-lg text-white transition ${
            canResend && email
              ? "bg-black hover:bg-gray-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Resend Verification Link
        </button>

        {statusMessage && <p className="text-sm text-gray-700 mt-4">{statusMessage}</p>}

        <p className="text-center mt-5 text-gray-700">
          Back to{" "}
          <Link to="/" className="text-black font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default EmailVerificationPending;
