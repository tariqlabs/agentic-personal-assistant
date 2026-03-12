import { motion } from "framer-motion";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FALLBACK_NEWS = [
  { title: "AI industry updates", content: "Latest developments in RAG and document-based AI systems." },
  { title: "RAG best practices", content: "How to build accurate retrieval-augmented generation pipelines." },
  { title: "Vector databases for semantic search", content: "Pinecone, Weaviate, and open-source alternatives." },
  { title: "AI-powered learning tools", content: "Transform your documents into interactive study materials." },
];

export function News({ items = [] }) {
  const displayItems = items && items.length > 0 ? items : FALLBACK_NEWS;

  return (
    <section id="news" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center tracking-tight">
        AI & DevOps News
      </h2>
      <p className="text-slate-300 text-center mb-10 max-w-xl mx-auto text-sm sm:text-base">
        Stay updated with AI and DevOps trends.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayItems.map((n, i) => (
          <motion.div
            key={n.title || i}
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
            className="p-6 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <h3 className="font-semibold text-slate-200 text-base mb-3">{n.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{n.content}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
