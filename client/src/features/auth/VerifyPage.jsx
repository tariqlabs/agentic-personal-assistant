import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authApi } from "./api/authApi.js";

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification token");
      return;
    }
    authApi
      .verify(token)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setTimeout(() => navigate("/app", { replace: true }), 2000);
        } else {
          setStatus("error");
          setError(body.error || "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Verification failed");
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8 bg-slate-800/50 rounded-2xl shadow-xl border border-slate-700 text-center">
        {status === "loading" && (
          <p className="text-slate-300">Verifying your email…</p>
        )}
        {status === "success" && (
          <>
            <p className="text-blue-400 font-medium">Email verified successfully!</p>
            <p className="text-slate-400 text-sm mt-2">Redirecting to app…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-400">{error}</p>
            <Link
              to="/auth/login"
              className="mt-4 inline-block text-indigo-400 hover:text-indigo-300"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
