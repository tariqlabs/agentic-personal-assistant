import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/hooks/useAuth.jsx";
import { ArrowRight } from "lucide-react";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative z-10 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 max-w-3xl mx-auto text-center">
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/60 text-slate-300 text-xs font-medium mb-6"
      >
        RAG-powered AI for your knowledge base
      </motion.div>

      <motion.h1
        initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-50 leading-[1.05] tracking-tight mb-5"
      >
        Learn faster from{" "}
        <span className="text-slate-200">
          your own documents
        </span>
      </motion.h1>

      <motion.p
        initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        Upload PDFs, chat with your knowledge base, and generate AI-powered
        exams — all in one place.
      </motion.p>

      <motion.div
        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 justify-center items-center"
      >
        {user ? (
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all hover:shadow-lg hover:shadow-primary-500/25 text-sm"
          >
            Go to App
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all hover:shadow-lg hover:shadow-primary-500/25 text-sm"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-white/15 text-white/80 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              Sign in
            </Link>
          </>
        )}
      </motion.div>

    </section>
  );
}
