import { Link } from "react-router-dom";
import { DotGridBackground } from "../../../shared/components/DotGridBackground.jsx";
import { Navbar } from "../../home/components/Navbar.jsx";
import { AppLogo } from "../../../shared/components/AppLogo.jsx";

export function AuthLayout({ title, subtitle, features, children, footerLink }) {
  return (
    <div className="min-h-screen relative bg-[#020617] flex flex-col">
      <DotGridBackground />
      <Navbar />

      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
        <div className="hidden md:flex flex-col gap-8 flex-1 max-w-md">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <AppLogo size={36} />
              <span className="font-bold text-white text-lg">Agentic RAG</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">{title}</h1>
            <p className="text-slate-300 text-sm leading-relaxed">{subtitle}</p>
          </div>

          {features && (
            <ul className="space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full max-w-sm flex-shrink-0">
          <div className="flex md:hidden items-center gap-2 mb-6 justify-center">
            <AppLogo size={32} />
            <span className="font-bold text-white">Agentic RAG</span>
          </div>

          <div className="bg-surface-900/80 backdrop-blur border border-surface-border rounded-2xl p-7">
            {children}
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 px-4 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>Agentic RAG &copy; {new Date().getFullYear()}</span>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
