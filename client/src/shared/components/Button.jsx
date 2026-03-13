/**
 * Design system button - primary and secondary variants.
 */
export function Button({
  children,
  variant = "primary",
  disabled,
  className = "",
  type = "button",
  ...props
}) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors";
  const variants = {
    primary:
      "bg-primary-600 hover:bg-primary-500 text-white border border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-surface-card hover:bg-surface-800 text-text-secondary border border-surface-border disabled:opacity-50 disabled:cursor-not-allowed",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
