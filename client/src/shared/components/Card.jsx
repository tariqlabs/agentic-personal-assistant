/**
 * Design system card - variant="default" | "feature" | "news".
 */
export function Card({ children, variant = "default", className = "", ...props }) {
  const variantClasses = {
    default: "border-surface-border bg-surface-card",
    feature: "border-surface-border bg-surface-card hover:border-primary-500/30",
    news: "border-surface-border bg-surface-card",
  };
  const c = variantClasses[variant] ?? variantClasses.default;
  return (
    <div
      className={`rounded-xl border p-4 ${c} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
