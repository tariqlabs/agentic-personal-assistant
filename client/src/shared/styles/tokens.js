/**
 * Design tokens - Figma-style single source of truth.
 * Aligns with Tailwind theme in tailwind.config.js.
 */
export const tokens = {
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    card: "1rem",
    section: "1.5rem",
  },
  typography: {
    heading1: { fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2 },
    heading2: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.4 },
  },
  color: {
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryMuted: "#4338ca",
    surface: {
      base: "#0f172a",
      elevated: "#1e293b",
      card: "#1e293b",
      border: "#334155",
      borderMuted: "#475569",
      bg: "#0f172a",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#cbd5e1",
      muted: "#94a3b8",
    },
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    card: "0.75rem",
    button: "0.5rem",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
};
