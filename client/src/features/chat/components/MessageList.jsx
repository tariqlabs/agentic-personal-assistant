import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

const MessageList = ({
  messages,
  loading,
  endOfMessagesRef,
  emptyStateMessage = "Send a message to start the conversation.",
  loadingText,
  renderMessage,
  messageKey = "text",
  roleKey = "role",
}) => {
  const defaultRenderMessage = (message, index) => {
    const isUser = message[roleKey] === "user";
    return (
      <div
        key={index}
        className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
            isUser ? "bg-slate-600 text-white" : "bg-slate-800/60"
          }`}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 text-white" />
          ) : (
            <Bot className="w-3.5 h-3.5 text-blue-400" />
          )}
        </div>

        <div
          className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-slate-700/80 text-white rounded-br-sm"
              : "bg-slate-800/60 text-slate-200 rounded-bl-sm"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap break-words">{message[messageKey]}</span>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
              <ReactMarkdown>{message[messageKey]}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 py-4 px-4 min-h-full">
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-3">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm text-slate-400 max-w-xs">{emptyStateMessage}</p>
        </div>
      )}

      {messages.map((m, i) =>
        renderMessage ? renderMessage(m, i) : defaultRenderMessage(m, i)
      )}

      {loading && (
        <div className="flex items-end gap-2.5">
          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-slate-800/60">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-800/60">
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
