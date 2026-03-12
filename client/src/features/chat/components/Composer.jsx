import { useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

const Composer = ({
  input,
  setInput,
  func1,
  func2,
  loading,
  onComposerKeyDown,
  placeholder = "Ask anything about your documents…",
  buttonText1,
  buttonText2,
  hintText,
  disabledCondition = (input, loading) => loading || !input.trim(),
  inputType = "textarea",
  rows = 1,
}) => {
  const isDisabled = disabledCondition(input, loading);
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || inputType !== "textarea") return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input, inputType]);

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="relative flex items-end gap-2 rounded-2xl ring-1 ring-white/[0.06] bg-slate-800/60 px-4 py-3 focus-within:border-primary-500/60 transition-colors">
        {inputType === "textarea" ? (
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none leading-relaxed min-h-[22px] max-h-[160px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onComposerKeyDown}
            placeholder={placeholder}
            rows={rows}
          />
        ) : (
          <input
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            type={inputType}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onComposerKeyDown}
            placeholder={placeholder}
          />
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {func2 && (
            <button
              type="button"
              onClick={func2}
              disabled={loading}
              title="Generate questions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 disabled:opacity-40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Questions</span>
            </button>
          )}
          <button
            type="button"
            onClick={func1}
            disabled={isDisabled}
            title="Send"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
      {hintText && (
        <p className="mt-2 text-xs text-slate-500 text-center">{hintText}</p>
      )}
    </div>
  );
};

export default Composer;
