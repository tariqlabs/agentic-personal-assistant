/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        surface: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
          card: "#1e293b",
          border: "#334155",
        },
        "text-muted": "#94a3b8",
        "text-secondary": "#cbd5e1",
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        card: "1rem",
        section: "1.5rem",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        card: "0.75rem",
        button: "0.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      fontSize: {
        "heading1": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "heading2": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5" }],
        caption: ["0.875rem", { lineHeight: "1.25" }],
      },
      keyframes: {
      "float-slow": {
        "0%, 100%": { transform: "translate(0, 0) scale(1)" },
        "50%": { transform: "translate(30px, -20px) scale(1.05)" },
      },
      "float-medium": {
        "0%, 100%": { transform: "translate(0, 0)" },
        "50%": { transform: "translate(-20px, 30px)" },
      },
      "float-fast": {
        "0%, 100%": { transform: "translate(0, 0)" },
        "50%": { transform: "translate(15px, -25px)" },
      },
      aurora: {
        "0%, 100%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
      },
      "pulse-ring": {
        "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
        "50%": { opacity: "0.8", transform: "scale(1.05)" },
      },
    },
      animation: {
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-medium": "float-medium 12s ease-in-out infinite",
        "float-fast": "float-fast 10s ease-in-out infinite",
        aurora: "aurora 15s ease infinite",
        "spin-slow": "spin 3s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, #334155 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "28px 28px",
      },
    },
  },
  plugins: [],
};
