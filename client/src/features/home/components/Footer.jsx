import { Link } from "react-router-dom";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/app", label: "Features" },
      { href: "/app", label: "Chat" },
      { href: "/app/exam", label: "Exams" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "About" },
      { href: "#news", label: "Blog" },
      { href: "mailto:support@example.com", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/design-preview", label: "Design Preview" },
      { href: "/", label: "Help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/", label: "Privacy" },
      { href: "/", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-300 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Agentic RAG &copy; {new Date().getFullYear()}
          </span>
          <Link
            to="/auth/signup"
            className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </footer>
  );
}
