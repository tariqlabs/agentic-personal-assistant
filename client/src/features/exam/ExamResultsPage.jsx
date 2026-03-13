import { Button } from "../../shared/components/Button.jsx";
import { formLabels } from "../../shared/constants/formLabels.js";
import { CheckCircle, XCircle, Trophy, ArrowLeft } from "lucide-react";

export function ExamResultsPage({ results, onBack }) {
  if (!results) return null;

  const { score, correctCount, totalQuestions, examTitle, results: items } =
    results;

  const scoreColor =
    score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const scoreBg =
    score >= 70 ? "bg-emerald-500/10 border-emerald-500/20" : score >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";
  const scoreLabel =
    score >= 90 ? "Excellent!" : score >= 70 ? "Great job!" : score >= 50 ? "Keep practicing" : "Needs improvement";

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.06] px-5 sm:px-8 py-5">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${scoreBg}`}>
            <span className={`text-2xl font-bold leading-none ${scoreColor}`}>{score}%</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white">{examTitle || "Exam Results"}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {correctCount}/{totalQuestions} correct &middot; {scoreLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-3 max-w-2xl mx-auto w-full">
        {items?.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              item.isCorrect
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {item.isCorrect ? (
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-2">{item.questionText}</p>
                <div className="space-y-1">
                  {item.options?.map((o) => {
                    const isSelected = o.id === item.selectedOptionId;
                    const isCorrectOption = o.id === item.correctOptionId;
                    let optClass = "text-slate-500";
                    if (isCorrectOption) optClass = "text-emerald-400 font-medium";
                    else if (isSelected && !item.isCorrect) optClass = "text-red-400 line-through";
                    return (
                      <p key={o.id} className={`text-xs ${optClass}`}>
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold mr-1.5 bg-slate-800 text-slate-400">{o.id}</span>
                        {o.text}
                        {isCorrectOption && !item.isCorrect && <span className="ml-1 text-emerald-500/60">(correct)</span>}
                        {isSelected && !item.isCorrect && <span className="ml-1 text-red-500/60">(your answer)</span>}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] px-5 sm:px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <Button onClick={onBack} className="min-h-[44px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {formLabels.exam.backToExam}
          </Button>
        </div>
      </div>
    </div>
  );
}
