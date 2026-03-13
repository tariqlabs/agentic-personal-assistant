import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/hooks/useAuth.jsx";
import { AppLogo } from "../../../shared/components/AppLogo.jsx";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#020617]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <AppLogo size={32} />
          <span className="font-semibold text-white text-sm tracking-tight">
            Agentic RAG
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link to="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link to="/#news" className="hover:text-white transition-colors">News</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/app"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white transition-colors"
            >
              Go to App
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
