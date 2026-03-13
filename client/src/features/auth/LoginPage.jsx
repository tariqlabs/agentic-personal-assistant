import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginSchema } from "../../shared/lib/validation.js";
import { setTokens } from "../../shared/lib/apiClient.js";
import { authApi } from "./api/authApi.js";
import { useAuth } from "../../shared/hooks/useAuth.jsx";
import { AuthLayout } from "./components/AuthLayout.jsx";
import { MessageSquare, FileQuestion, Database } from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, text: "Chat with your PDF documents using AI" },
  { icon: FileQuestion, text: "Generate practice exams from your content" },
  { icon: Database, text: "Retrieval-augmented generation — accurate, grounded answers" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    shouldFocusError: true,
  });

  async function onSubmit(data) {
    try {
      const res = await authApi.login(data.email, data.password);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError("root", { message: body.error || "Invalid email or password" });
        return;
      }
      setTokens(body.accessToken, body.refreshToken);
      setUser(body.user || { id: "authenticated" });
      navigate("/app", { replace: true });
    } catch (err) {
      setError("root", { message: err.message || "Login failed. Please try again." });
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue learning from your documents with AI-powered chat and exams."
      features={FEATURES}
    >
      <h2 className="text-xl font-bold text-white mb-1">Sign in</h2>
      <p className="text-sm text-slate-400 mb-6">Enter your credentials to continue</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {reason && (
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-300 text-xs">{reason}</div>
        )}
        {errors.root && (
          <div className="p-3 rounded-xl bg-red-500/15 text-red-300 text-xs" role="alert">
            {errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary-500/60 focus:border-transparent outline-none transition"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-400" role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary-500/60 focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-400" role="alert">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
