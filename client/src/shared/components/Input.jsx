/**
 * Design system input - dark theme, rounded.
 */
export function Input({
  className = "",
  error,
  ...props
}) {
  return (
    <input
      className={`w-full px-4 py-2 rounded-lg bg-slate-700/50 border text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors ${
        error ? "border-red-500" : "border-slate-600"
      } ${className}`}
      {...props}
    />
  );
}
