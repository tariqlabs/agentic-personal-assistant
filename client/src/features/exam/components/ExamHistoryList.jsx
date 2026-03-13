import { ChevronRight, Clock } from "lucide-react";

export function ExamHistoryList({ exams, onSelect }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((e) => {
        const hasScore = e.lastScore != null;
        const scoreColor =
          e.lastScore >= 70 ? "text-emerald-400" : e.lastScore >= 50 ? "text-amber-400" : "text-red-400";
        const scoreBorder =
          e.lastScore >= 70 ? "border-emerald-500/20" : e.lastScore >= 50 ? "border-amber-500/20" : "border-red-500/20";
        const qCount = e.questionCount || e.lastTotal || 0;

        return (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${
              hasScore
                ? `${scoreBorder} bg-slate-800/20 hover:bg-slate-800/40`
                : "border-slate-700/40 bg-slate-800/20 hover:border-blue-500/40 hover:bg-slate-800/40"
            }`}
          >
            {hasScore ? (
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                e.lastScore >= 70 ? "bg-emerald-500/10" : e.lastScore >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
              }`}>
                <span className={`text-sm font-bold ${scoreColor}`}>{e.lastScore}%</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-800/60 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate transition-colors">
                {e.title || "Exam"}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {hasScore
                  ? `${e.lastCorrect}/${e.lastTotal} correct`
                  : qCount > 0
                    ? `${qCount} questions`
                    : e.status === "in_progress" ? "In progress" : "Not started"
                }
              </p>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
