import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileUp } from "lucide-react";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Dropzone({
  onFileSelect,
  onUploadComplete,
  accept = "application/pdf,.pdf",
  uploadFn,
  successMessage = "Uploaded successfully.",
  className = "",
  variant = "default",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(null); // null | "uploading" | "success" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const borderStyles = {
    default:
      "border-dashed border-white/10 hover:border-blue-500/40 bg-slate-800/40",
    dragOver: "border-blue-500/60 bg-blue-500/10",
    uploading: "border-blue-500/40 bg-slate-800/40",
    success: "border-green-500/30 bg-green-500/5",
    error: "border-red-500/30 bg-red-500/5",
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
    e.target.value = "";
  };

  const triggerUpload = async () => {
    if (!selectedFile || !uploadFn) return;
    setStatus("uploading");
    setStatusMessage("");
    try {
      await uploadFn(selectedFile);
      setStatus("success");
      setStatusMessage(successMessage);
      setSelectedFile(null);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setStatus("error");
      setStatusMessage(err?.message ?? "Upload failed");
    }
  };

  const state = status || (dragOver ? "dragOver" : "default");
  const borderClass = borderStyles[state] || borderStyles.default;

  return (
    <div className={className}>
      <motion.div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={reducedMotion ? {} : { scale: 1.01 }}
        className={`flex flex-col items-center justify-center gap-2 py-6 px-5 rounded-xl border-2 transition-colors cursor-pointer min-h-[100px] ${borderClass}`}
        aria-label="Upload PDF: drag and drop or click to browse"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        <FileUp className="w-8 h-8 text-slate-600 shrink-0" />
        <p className="text-xs text-slate-500 text-center">
          Drag & drop PDF here or click to browse
        </p>
        {selectedFile && (
          <p className="text-xs text-slate-400 truncate max-w-full">
            {selectedFile.name}
          </p>
        )}
      </motion.div>

      {selectedFile && uploadFn && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerUpload}
            disabled={status === "uploading"}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
          >
            {status === "uploading" ? "Uploading…" : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            disabled={status === "uploading"}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-700/50 text-slate-400 hover:bg-slate-800/50 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className="mt-2 text-sm min-h-[1.25rem]"
      >
        {status === "uploading" && (
          <span className="text-slate-500 text-xs">Uploading…</span>
        )}
        {status === "success" && (
          <span className="text-emerald-400 text-xs">{statusMessage}</span>
        )}
        {status === "error" && (
          <span className="text-red-400 text-xs">{statusMessage}</span>
        )}
      </div>
    </div>
  );
}
