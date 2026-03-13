import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";

export function ConversationSidebar({
  conversations,
  activeId,
  sidebarOpen,
  pendingIds,
  onSelect,
  onCreate,
  onDelete,
}) {
  return (
    <aside
      className={`flex flex-col border-r border-white/[0.06] bg-transparent transition-all duration-200 overflow-hidden ${
        sidebarOpen ? "w-60 shrink-0" : "w-0"
      }`}
    >
      <div className="p-3 border-b border-white/[0.06] shrink-0">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {conversations.length === 0 && (
          <p className="px-3 py-4 text-xs text-slate-500 text-center">
            No conversations yet
          </p>
        )}
        {conversations.map((c) => {
          const loading = pendingIds?.has(c.id);
          return (
            <div
              key={c.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left truncate transition-colors cursor-pointer ${
                activeId === c.id
                  ? "bg-slate-800/60 text-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
              onClick={() => onSelect(c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(c.id)}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 text-blue-400 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              )}
              <span className="truncate flex-1">{c.title || "New chat"}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="shrink-0 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
