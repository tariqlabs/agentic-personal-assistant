import { motion } from "framer-motion";
import { MessageSquare, FileQuestion, Database, Upload, Zap, Shield } from "lucide-react";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Chat with your docs",
    desc: "Ask any question and get answers sourced directly from your uploaded documents.",
    accent: "text-slate-300",
    bg: "bg-slate-600/30",
  },
  {
    icon: FileQuestion,
    title: "AI-generated exams",
    desc: "Turn your documents into 30-question multiple-choice exams with one click.",
    accent: "text-slate-300",
    bg: "bg-slate-600/30",
  },
  {
    icon: Database,
    title: "Vector RAG",
    desc: "State-of-the-art retrieval-augmented generation keeps answers accurate and grounded.",
    accent: "text-slate-300",
    bg: "bg-slate-600/30",
  },
  {
    icon: Upload,
    title: "PDF ingestion",
    desc: "Drag and drop any PDF. Content is chunked, embedded, and indexed instantly.",
    accent: "text-slate-300",
    bg: "bg-slate-600/30",
  },
  {
    icon: Zap,
    title: "Topic practice exams",
    desc: "No documents needed — pick a tech topic and get instant AI-powered questions.",
    accent: "text-slate-300",
    bg: "bg-slate-600/30",
  },
  {
    icon: Shield,
    title: "Per-user isolation",
    desc: "Your documents and exams are private to your account — completely isolated.",
    accent: "text-slate-300",
    bg: "bg-slate-600/30",
  },
];

export function Features() {
  return (
    <section id="features" className="relative z-10 py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2">
          What you get
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Everything you need to study smarter
        </h2>
        <p className="text-slate-300 mt-3 max-w-xl mx-auto text-sm sm:text-base">
          A complete AI learning toolkit, built around your own material.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
              whileHover={reducedMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              <div className={`inline-flex p-2.5 rounded-xl mb-4 ${f.bg}`}>
                <Icon className={`w-5 h-5 ${f.accent}`} />
              </div>
              <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
