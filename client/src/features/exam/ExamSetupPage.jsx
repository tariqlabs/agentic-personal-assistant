import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { examApi } from "./api/examApi.js";
import { chatApi } from "../chat/api/chatApi.js";
import { Button } from "../../shared/components/Button.jsx";
import { formLabels } from "../../shared/constants/formLabels.js";
import { DEFAULT_EXAMS } from "./constants/defaultExams.js";
import { ExamLoadingScreen } from "./ExamLoadingScreen.jsx";
import Upload from "../../shared/components/Upload.jsx";
import { TopicGrid } from "./components/TopicGrid.jsx";
import { ExamHistoryList } from "./components/ExamHistoryList.jsx";
import { FileText } from "lucide-react";

async function uploadDocument(file) {
  const response = await chatApi.ingest(file);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Upload failed");
}

export function ExamSetupPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Generated Exam");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exams, setExams] = useState([]);

  useEffect(() => {
    examApi
      .list()
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]));
  }, []);

  async function handleTopicExam(topicSlug, topicLabel) {
    setLoading(true);
    setError("");
    try {
      const res = await examApi.createTopicExam(topicSlug, `${topicLabel} Exam`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to generate exam");
      setExams((prev) => [{ id: data.id, title: data.title, status: "draft", questionCount: data.questions?.length ?? 0, lastScore: null }, ...prev]);
      navigate(`/app/exam/${data.id}`, { replace: true });
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("Exam generation timed out. Please try again.");
      } else {
        const msg = err?.message ?? "Failed to generate exam";
        setError(msg === "Session expired" ? "Please sign in again and try again." : msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePrepareExam() {
    setLoading(true);
    setError("");
    try {
      const res = await examApi.create(title, true);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to generate exam");
      setExams((prev) => [{ id: data.id, title: data.title, status: "draft", questionCount: data.questions?.length ?? 0, lastScore: null }, ...prev]);
      navigate(`/app/exam/${data.id}`, { replace: true });
    } catch (err) {
      if (err?.name === "AbortError") {
        setError("Exam generation timed out. Please try again.");
      } else {
        const msg = err?.message ?? "Failed to prepare exam";
        setError(
          msg.includes("Insufficient content")
            ? "No documents found. Upload PDFs above, then try again."
            : msg
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <ExamLoadingScreen />;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="border-b border-white/[0.06] px-5 sm:px-8 py-5">
        <h1 className="text-xl font-bold text-white tracking-tight">Exams</h1>
        <p className="text-sm text-slate-400 mt-1">
          Practice with instant topic exams or generate from your documents.
        </p>
      </div>

      {error && (
        <div className="mx-5 sm:mx-8 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center justify-between gap-3" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-red-400/60 hover:text-red-300 text-xs underline"
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 px-5 sm:px-8 py-6 space-y-8">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Quick practice</h2>
              <p className="text-xs text-slate-500 mt-1">
                30 AI-generated questions per topic. No upload needed.
              </p>
            </div>
          </div>

          <TopicGrid topics={DEFAULT_EXAMS} onSelect={handleTopicExam} />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">From your documents</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload a PDF and generate tailored exam questions with RAG.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="flex-1 min-w-0">
              <Upload
                uploadFn={uploadDocument}
                successMessage="PDF ready. Generate an exam from this content."
                onUploadSuccess={() => setError("")}
              />
            </div>

            <div className="flex flex-col gap-2.5 sm:w-56 shrink-0">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={formLabels.exam.titlePlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition"
                />
              </div>
              <Button onClick={handlePrepareExam} disabled={loading} className="w-full">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                {loading ? "Generating…" : "Generate exam"}
              </Button>
            </div>
          </div>
        </section>

        {exams.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">History</h2>
              <p className="text-xs text-slate-500 mt-1">
                Resume or review a previous exam.
              </p>
            </div>

            <ExamHistoryList exams={exams} onSelect={(id) => navigate(`/app/exam/${id}`)} />
          </section>
        )}
      </div>
    </div>
  );
}
