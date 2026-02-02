import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Chat request failed");
      }

      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: err?.message ?? "Chat request failed" }]);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:3001/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      setUploadStatus("Uploaded and ingested successfully.");
      setSelectedFile(null);
    } catch (err) {
      setUploadStatus(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onComposerKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeaderInner">
          <div className="appTitle">Agentic Personal Assistant</div>
          <div className="appSubtitle">Upload PDFs, then chat with your knowledge base.</div>
        </div>
      </header>

      <main className="appMain">
        <section className="uploadPanel">
          <div className="uploadRow">
            <label className="uploadButton" htmlFor="pdf-upload">
              Choose PDF
            </label>
            <input
              id="pdf-upload"
              className="uploadInput"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <button
              className="primaryButton"
              onClick={uploadDocument}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <div className="uploadMeta">
              {selectedFile ? selectedFile.name : "No file selected"}
            </div>
          </div>
          {uploadStatus && <div className="uploadStatus">{uploadStatus}</div>}
        </section>

        <section className="chatPanel">
          <div className="messages">
            {messages.length === 0 && (
              <div className="emptyState">
                Upload a PDF to ingest it, then ask a question below.
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "messageRow isUser" : "messageRow isAi"}>
                <div className="messageBubble">
                  {m.role === "ai" ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="messageRow isAi">
                <div className="messageBubble isTyping">Thinking…</div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="composer">
            <div className="composerInner">
              <textarea
                className="composerInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Message your assistant…"
                rows={1}
              />
              <button
                className="sendButton"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
            <div className="composerHint">Enter to send · Shift+Enter for a new line</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
