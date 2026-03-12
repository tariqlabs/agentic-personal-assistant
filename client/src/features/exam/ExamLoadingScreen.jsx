import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotGridBackground } from "../../shared/components/DotGridBackground.jsx";
import { BrainCircuit } from "lucide-react";

const STAGES = [
  { label: "Analyzing topic…",                pct: 10 },
  { label: "Generating questions (batch 1)…", pct: 30 },
  { label: "Generating questions (batch 2)…", pct: 55 },
  { label: "Reviewing & finalizing…",         pct: 80 },
  { label: "Almost ready…",                   pct: 97 },
];

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularProgress({ percent }) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  return (
    <svg width="140" height="140" className="rotate-[-90deg]" aria-hidden>
      <circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke="#1e293b"
        strokeWidth="6"
      />
      <motion.circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke="#6366f1"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function ExamLoadingScreen() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) return;
    const durations = [10000, 20000, 20000, 15000];
    const timer = setTimeout(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, durations[stageIndex] ?? 6000);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  const stage = STAGES[stageIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center">
      <DotGridBackground />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
        <div className="relative">
          <CircularProgress percent={stage.pct} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center"
            >
              <BrainCircuit className="w-6 h-6 text-blue-400" />
            </motion.div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-2">
            Agentic RAG
          </p>
          <h2 className="text-xl font-bold text-white">Preparing your exam</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-white/50 min-h-[20px]"
          >
            {stage.label}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {STAGES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === stageIndex ? 20 : 6,
                backgroundColor: i <= stageIndex ? "#6366f1" : "#1e293b",
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-500/60"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
