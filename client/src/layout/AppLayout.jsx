import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";
import { logout } from "../shared/lib/apiClient.js";
import { SIDEBAR_ITEMS } from "../shared/constants/sidebarItems.js";
import { DotGridBackground } from "../shared/components/DotGridBackground.jsx";
import { AppLogo } from "../shared/components/AppLogo.jsx";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navContent = (
    <>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AppLogo size={28} />
          {(!collapsed || mobileOpen) && (
            <h2 className="font-semibold text-white text-sm">Agentic RAG</h2>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 min-w-[44px] min-h-[44px] items-center justify-center"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {SIDEBAR_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/app"
              ? location.pathname === "/app" || location.pathname === "/app/"
              : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px] ${
                isActive
                  ? "bg-slate-800/60 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 text-sm min-h-[44px]"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || mobileOpen) && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen relative bg-[#020617]">
      <DotGridBackground />
      <div className="fixed top-0 left-0 z-40 flex items-center p-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 min-w-[44px] min-h-[44px]"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-[#020617]/95 backdrop-blur-sm transition-transform duration-200 ease-out lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-64 ${collapsed ? "lg:w-16" : ""}`}
      >
        {navContent}
      </aside>

      <main className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0 lg:ml-0 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
