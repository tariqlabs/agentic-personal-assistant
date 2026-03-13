/**
 * Design D — black base + subtle dot grid only.
 * No floating particles; formal, easy-on-eyes for study websites.
 */
export function DotGridBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#020617]" aria-hidden>
      {/* Static dot grid — subtle white/gray dots on black */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(148,163,184,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
    </div>
  );
}
