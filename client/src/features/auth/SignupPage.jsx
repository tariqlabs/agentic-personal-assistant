import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema } from "../../shared/lib/validation.js";
import { setTokens } from "../../shared/lib/apiClient.js";
import { authApi } from "./api/authApi.js";
import { useAuth } from "../../shared/hooks/useAuth.jsx";
import { AuthLayout } from "./components/AuthLayout.jsx";
import { Upload, Sparkles, Trophy } from "lucide-react";

const BENEFITS = [
  { icon: Upload, text: "Upload any PDF — notes, textbooks, documentation" },
  { icon: Sparkles, text: "Chat with your content via RAG-powered AI" },
  { icon: Trophy, text: "Test yourself with AI-generated practice exams" },
];

export function SignupPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    shouldFocusError: true,
  });

  async function onSubmit(data) {
    try {
      const res = await authApi.signup(data.email, data.password, data.confirmPassword);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError("root", { message: body.error || "Signup failed. Please try again." });
        return;
      }
      setTokens(body.accessToken, body.refreshToken);
      setUser(body.user || { id: "authenticated" });
      navigate("/app", { replace: true });
    } catch (err) {
      setError("root", { message: err.message || "Signup failed. Please try again." });
    }
  }

  return (
    <AuthLayout
      title="Start learning smarter"
      subtitle="Create a free account and bring your own documents to life with AI-powered chat and exam generation."
      features={BENEFITS}
    >
      <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
      <p className="text-sm text-slate-400 mb-6">Sign up to get started for free</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root && (
          <div className="p-3 rounded-xl bg-red-500/15 text-red-300 text-xs" role="alert">
            {errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
          <input {...register("email")} type="email" className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary-500/60 focus:border-transparent outline-none transition" placeholder="you@example.com" />
          {errors.email && <p className="mt-1.5 text-xs text-red-400" role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <input {...register("password")} type="password" className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary-500/60 focus:border-transparent outline-none transition" placeholder="••••••••" />
          {errors.password && <p className="mt-1.5 text-xs text-red-400" role="alert">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm password</label>
          <input {...register("confirmPassword")} type="password" className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary-500/60 focus:border-transparent outline-none transition" placeholder="••••••••" />
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400" role="alert">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
