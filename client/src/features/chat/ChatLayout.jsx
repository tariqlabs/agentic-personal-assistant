import { useState, useEffect, useRef } from "react";
import { chatApi } from "./api/chatApi.js";
import MessageList from "./components/MessageList.jsx";
import Composer from "./components/Composer.jsx";
import Upload from "../../shared/components/Upload.jsx";
import { ConversationSidebar } from "./components/ConversationSidebar.jsx";
import { MessageSquare, PanelLeftClose, PanelLeftOpen } from "lucide-react";

async function uploadDocument(file) {
  const response = await chatApi.ingest(file);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Upload failed");
}

export function ChatLayout() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingForId, setLoadingForId] = useState(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const endOfMessagesRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (activeId) {
      sessionStorage.setItem("activeConversationId", activeId);
      loadMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, loadingForId, activeId]);

  async function loadConversations() {
    try {
      const res = await chatApi.getConversations();
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
      const stored = sessionStorage.getItem("activeConversationId");
      const validStored = data.some((c) => c.id === stored);
      if (data.length > 0 && !activeId) {
        setActiveId(validStored ? stored : data[0].id);
      }
    } catch { /* ignore */ }
  }

  async function loadMessages(id) {
    try {
      const res = await chatApi.getMessages(id);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.map((m) => ({ role: m.role === "assistant" ? "ai" : m.role, text: m.content })));
    } catch { setMessages([]); }
  }

  async function createConversation() {
    try {
      const res = await chatApi.createConversation();
      if (!res.ok) return;
      const conv = await res.json();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
    } catch { /* ignore */ }
  }

  async function deleteConversation(convId) {
    try {
      const res = await chatApi.deleteConversation(convId);
      if (!res.ok) return;
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeId === convId) {
        setActiveId(remaining[0]?.id ?? null);
        setMessages([]);
      }
    } catch { /* ignore */ }
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    let convId = activeId;
    if (!convId) {
      const res = await chatApi.createConversation();
      if (!res.ok) return;
      const conv = await res.json();
      convId = conv.id;
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
    }
    setLoading(true);
    setLoadingForId(convId);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    try {
      const res = await chatApi.sendMessage(convId, trimmed);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
      if (data.title) {
        setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title: data.title } : c)));
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: err?.message ?? "Failed" }]);
    } finally {
      setLoading(false);
      setLoadingForId(null);
    }
  }

  async function askQuestions() {
    if (!activeId || loading) return;
    setLoading(true);
    setLoadingForId(activeId);
    try {
      const res = await chatApi.generateQuestions(activeId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages((prev) => [...prev, { role: "ai", text: data.answer || "" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: err?.message ?? "Failed" }]);
    } finally {
      setLoading(false);
      setLoadingForId(null);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const showLoading = loading && activeId === loadingForId;

  return (
    <div className="flex h-full overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        sidebarOpen={sidebarOpen}
        onSelect={setActiveId}
        onCreate={createConversation}
        onDelete={deleteConversation}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <h1 className="text-sm font-medium text-slate-200 truncate">
            {conversations.find((c) => c.id === activeId)?.title || "Chat"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !showLoading && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-white font-semibold mb-1.5">Start a conversation</h2>
              <p className="text-sm text-slate-400 max-w-xs mb-6">
                Ask anything about your uploaded documents, or type a general question.
              </p>
              <div className="w-full max-w-md">
                <Upload
                  uploadFn={uploadDocument}
                  successMessage="PDF ready for Q&A. Ask about your slides."
                  onUploadSuccess={() => {}}
                />
              </div>
            </div>
          )}
          {messages.length > 0 && (
            <MessageList messages={messages} loading={showLoading} endOfMessagesRef={endOfMessagesRef} />
          )}
          {messages.length === 0 && showLoading && (
            <MessageList messages={[]} loading={showLoading} endOfMessagesRef={endOfMessagesRef} />
          )}
        </div>

        <Composer
          input={input}
          setInput={setInput}
          func1={sendMessage}
          func2={askQuestions}
          onComposerKeyDown={onKeyDown}
          loading={showLoading}
          placeholder="Ask anything about your documents…"
          hintText="Enter to send · Shift+Enter for new line"
        />
      </div>
    </div>
  );
}
