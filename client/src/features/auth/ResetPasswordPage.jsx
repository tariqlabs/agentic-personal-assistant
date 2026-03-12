import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "../../shared/lib/validation.js";
import { authApi } from "./api/authApi.js";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data) {
    try {
      const res = await authApi.resetPassword(data.token, data.password, data.confirmPassword);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError("root", { message: body.error || "Reset failed" });
        return;
      }
      navigate("/auth/login", { replace: true });
    } catch (err) {
      setError("root", { message: err.message || "Reset failed" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8 bg-slate-800/50 rounded-2xl shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
        <p className="text-slate-400 mb-6">Enter your new password</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register("token")} type="hidden" />
          {errors.root && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {errors.root.message}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">New password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
