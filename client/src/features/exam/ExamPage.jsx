import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examApi } from "./api/examApi.js";
import { Button } from "../../shared/components/Button.jsx";
import { formLabels } from "../../shared/constants/formLabels.js";
import { ExamLoadingScreen } from "./ExamLoadingScreen.jsx";
import { ExamResultsPage } from "./ExamResultsPage.jsx";
import { ShieldAlert, FileText } from "lucide-react";

export function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const isExamActive = !!attempt && !submitted;

  useEffect(() => {
    if (!isExamActive) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isExamActive]);

  const safeNavigate = useCallback(
    (to, opts) => {
      if (isExamActive) {
        setShowExitWarning(true);
        return;
      }
      navigate(to, opts);
    },
    [isExamActive, navigate],
  );

  useEffect(() => {
    if (!isExamActive) return;
    const onPop = (e) => {
      window.history.pushState(null, "", window.location.href);
      setShowExitWarning(true);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [isExamActive]);

  useEffect(() => {
    if (!id) return;
    loadExam();
  }, [id]);

  async function loadExam() {
    setLoading(true);
    setError("");
    try {
      const res = await examApi.get(id);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load exam");
      setExam(data);
      if (data.questions?.length === 0) {
        setError("Exam has no questions. Prepare the exam first.");
      }
    } catch (err) {
      setError(err?.message ?? "Failed to load exam");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartExam() {
    if (!exam?.questions?.length) return;
    setStarting(true);
    setError("");
    try {
      const res = await examApi.start(id);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to start exam");
      setAttempt(data);
      setAnswers({});
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err?.message ?? "Failed to start exam");
    } finally {
      setStarting(false);
    }
  }

  function handleSelectOption(questionId, optionId) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!attempt?.questions?.length) return;
    const answerList = attempt.questions.map((q) => ({
      examQuestionId: q.id,
      selectedOptionId: answers[q.id] || "",
    }));
    try {
      const res = await examApi.submitAnswers(attempt.attemptId, answerList);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      const resultsRes = await examApi.getResults(attempt.attemptId);
      const resultsData = await resultsRes.json().catch(() => ({}));
      setResults(resultsData);
      setSubmitted(true);
    } catch (err) {
      setError(err?.message ?? "Failed to submit exam");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 bg-surface-900">
        <p className="text-text-muted">Loading exam…</p>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <ExamResultsPage
        results={results}
        onBack={() => navigate("/app/exam", { replace: true })}
      />
    );
  }

  if (error && !exam) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 bg-surface-900">
        <p className="text-error mb-4">{error}</p>
        <Button onClick={() => navigate("/app/exam")}>{formLabels.exam.backToExam}</Button>
      </div>
    );
  }

  const exitWarningModal = showExitWarning && (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Leave exam?</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Your progress will be lost and the exam won't be scored. Are you sure you want to leave?
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowExitWarning(false)}
            className="flex-1"
          >
            Continue exam
          </Button>
          <button
            onClick={() => { setShowExitWarning(false); setAttempt(null); setSubmitted(false); navigate("/app/exam", { replace: true }); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );

  if (!attempt) {
    const qLen = exam?.questions?.length || 0;
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FileText className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{exam?.title || "Exam"}</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {qLen} question{qLen !== 1 ? "s" : ""} &middot; Multiple choice
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <Button
            onClick={handleStartExam}
            disabled={starting || !qLen}
            className="w-full"
          >
            {starting ? formLabels.exam.starting : formLabels.exam.startExam}
          </Button>
          <button
            onClick={() => navigate("/app/exam")}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Back to exams
          </button>
        </div>
      </div>
    );
  }

  const questions = attempt.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const allAnswered = questions.every((q) => answers[q.id]);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const answeredCount = questions.filter((q) => answers[q.id]).length;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#020617]">
      {exitWarningModal}

      <div className="border-b border-white/[0.06] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-blue-400">{currentQuestionIndex + 1}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">{exam?.title}</h1>
            <p className="text-xs text-slate-500">
              Question {currentQuestionIndex + 1} of {questions.length} &middot; {answeredCount} answered
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowExitWarning(true)}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors shrink-0"
        >
          Exit
        </button>
      </div>

      <div className="px-4 sm:px-6 py-2 flex gap-1 overflow-x-auto border-b border-white/[0.04] bg-slate-900/40">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestionIndex(i)}
            className={`min-w-[32px] h-7 px-1.5 rounded-md text-xs font-medium shrink-0 touch-manipulation transition-colors ${
              i === currentQuestionIndex
                ? "bg-blue-600 text-white"
                : answers[questions[i].id]
                ? "bg-slate-700 text-white"
                : "bg-slate-800/60 text-slate-500 border border-white/[0.06]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {currentQ && (
          <div className="max-w-2xl mx-auto">
            <p className="text-white font-medium text-base sm:text-lg mb-5">{currentQ.questionText}</p>
            <div className="space-y-2.5">
              {(currentQ.options || []).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full text-left px-4 py-3.5 min-h-[48px] rounded-xl border transition-all touch-manipulation ${
                    answers[currentQ.id] === opt.id
                      ? "border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500/30"
                      : "border-white/[0.06] bg-slate-800/40 text-slate-300 hover:border-blue-500/40 hover:bg-slate-800/60"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md mr-3 text-xs font-bold ${
                    answers[currentQ.id] === opt.id
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}>
                    {opt.id}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] px-4 sm:px-6 py-3 flex flex-row gap-2 sm:justify-between bg-slate-900/80 backdrop-blur-sm">
        <Button
          variant="secondary"
          onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          disabled={currentQuestionIndex === 0}
          className="min-h-[44px] flex-1 sm:flex-initial"
        >
          {formLabels.exam.previous}
        </Button>
        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="min-h-[44px] flex-1 sm:flex-initial"
          >
            {allAnswered ? formLabels.exam.submitExam : `${answeredCount}/${questions.length} answered`}
          </Button>
        ) : (
          <Button
            onClick={() =>
              setCurrentQuestionIndex((i) =>
                Math.min(questions.length - 1, i + 1)
              )
            }
            className="min-h-[44px] flex-1 sm:flex-initial"
          >
            {formLabels.exam.next}
          </Button>
        )}
      </div>
    </div>
  );
}
