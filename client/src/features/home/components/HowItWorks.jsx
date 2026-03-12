import { motion } from "framer-motion";
import { Upload, MessageSquare, FileQuestion } from "lucide-react";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STEPS = [
  { icon: Upload, title: "Upload PDFs", desc: "Drag and drop your documents in the Chat section.", accent: "text-slate-300", bg: "bg-slate-800/60" },
  { icon: MessageSquare, title: "Chat or quiz", desc: "Ask questions or generate 30-question exams.", accent: "text-slate-300", bg: "bg-slate-800/60" },
  { icon: FileQuestion, title: "Study smarter", desc: "Practice with AI-powered exams from your content.", accent: "text-slate-300", bg: "bg-slate-800/60" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2">Simple flow</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">How it works</h2>
        <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
          Three steps to turn your documents into a learning powerhouse.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="text-center"
            >
              <div className={`inline-flex p-4 rounded-2xl mb-4 ${s.bg}`}>
                <Icon className={`w-10 h-10 ${s.accent}`} strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
