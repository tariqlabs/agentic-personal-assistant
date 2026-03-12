import { motion } from "framer-motion";
import { TechIcon } from "../../../shared/components/TechIcon.jsx";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TopicGrid({ topics, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
      {topics.map(({ slug, label }, i) => (
        <motion.button
          key={slug}
          onClick={() => onSelect(slug, label)}
          initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.03 }}
          whileHover={reducedMotion ? {} : { y: -3, transition: { duration: 0.15 } }}
          className="group relative flex flex-col items-center gap-2.5 px-3 py-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all touch-manipulation"
        >
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <TechIcon slug={slug} size={36} />
          </div>
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-white text-center leading-tight transition-colors">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
