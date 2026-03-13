import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { requestResetSchema } from "../../shared/lib/validation.js";
import { authApi } from "./api/authApi.js";
import { AuthLayout } from "./components/AuthLayout.jsx";
import { Mail } from "lucide-react";

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(requestResetSchema),
    mode: "onSubmit",
    shouldFocusError: true,
  });

  async function onSubmit(data) {
    try {
      const res = await authApi.requestPasswordReset(data.email);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError("root", { message: body.error || "Request failed" });
        return;
      }
      setError("root", {
        type: "success",
        message: "If that email exists, we sent a reset link. Check your inbox and the server console (dev) for the link.",
      });
    } catch (err) {
      setError("root", { message: err.message || "Request failed" });
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure link to reset your password."
      features={[{ icon: Mail, text: "Check your inbox and spam folder. The link expires in 1 hour." }]}
    >
      <h2 className="text-xl font-bold text-white mb-1">Forgot password</h2>
      <p className="text-sm text-slate-400 mb-6">Enter your email to receive a reset link</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div className={`p-3 rounded-xl text-xs ${errors.root.type === "success" ? "bg-blue-500/15 text-blue-300" : "bg-red-500/15 text-red-300"}`} role="alert">
            {errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
          <input {...register("email")} type="email" className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary-500/60 focus:border-transparent outline-none transition" placeholder="you@example.com" />
          {errors.email && <p className="mt-1.5 text-xs text-red-400" role="alert">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-400">
        Remember your password?{" "}
        <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
