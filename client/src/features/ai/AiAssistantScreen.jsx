import { useEffect, useRef, useState, useCallback } from "react";
import { IconButton, SafetyHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Brain, Send, Bot, AlertCircle, History, Plus, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";
const MAX_MESSAGES = 20;

const WELCOME = {
  id: "welcome",
  role: "assistant",
  content:
    'היי! אני המורה בכיס שלך 🤖\nנתקעת בשיעורי בית? צריך הסבר על נושא? כתוב לי ואני אעזור!',
};

function getHeaders() {
  const token = localStorage.getItem("helpin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(API_KEY ? { "x-api-key": API_KEY } : {}),
  };
}

export function AiAssistantScreen({ onBack, onReport }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const conversationIdRef = useRef(null);

  const [messages, setMessages] = useState([WELCOME]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [remaining, setRemaining] = useState(MAX_MESSAGES);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/api/ai/status`, {
      headers: getHeaders(),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const fetchConversations = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/ai/conversations`, { headers: getHeaders() });
      if (res.ok) setConversations(await res.json());
    } catch {}
    finally { setHistoryLoading(false); }
  }, []);

  const saveConversation = useCallback(async (msgs) => {
    const real = msgs
      .filter((m) => m.id !== "welcome")
      .filter((m) => m.content.trim() !== ""); // strip empty assistant placeholders
    if (real.length < 2) return; // need at least one full exchange
    const title = real.find((m) => m.role === "user")?.content?.slice(0, 60) ?? "שיחה";
    const payload = JSON.stringify({
      ...(conversationIdRef.current ? { conversationId: conversationIdRef.current } : {}),
      title,
      messages: real.map(({ role, content }) => ({ role, content })),
    });
    try {
      const res = await fetch(`${BASE_URL}/api/ai/conversations`, {
        method: "POST",
        headers: getHeaders(),
        body: payload,
      });
      if (res.ok) {
        const data = await res.json();
        conversationIdRef.current = data.id;
      }
    } catch {}
  }, []);

  // Save on browser/tab close via sendBeacon (sync, survives page unload)
  useEffect(() => {
    const handleUnload = () => {
      const real = messages
        .filter((m) => m.id !== "welcome")
        .filter((m) => m.content.trim() !== "");
      if (real.length < 2) return;
      const title = real.find((m) => m.role === "user")?.content?.slice(0, 60) ?? "שיחה";
      const token = localStorage.getItem("helpin_token");
      const payload = JSON.stringify({
        ...(conversationIdRef.current ? { conversationId: conversationIdRef.current } : {}),
        title,
        messages: real.map(({ role, content }) => ({ role, content })),
      });
      // sendBeacon doesn't support custom headers — pass token as query param
      const url = `${BASE_URL}/api/ai/conversations${token ? `?token=${token}` : ""}`;
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [messages]);

  const loadConversation = useCallback(async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/conversations/${id}`, { headers: getHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      conversationIdRef.current = data.id;
      setMessages([
        WELCOME,
        ...data.messages.map((m) => ({ ...m, id: crypto.randomUUID() })),
      ]);
      setShowHistory(false);
    } catch {}
  }, []);

  const deleteConversation = useCallback(async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${BASE_URL}/api/ai/conversations/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationIdRef.current === id) {
        conversationIdRef.current = null;
        setMessages([WELCOME]);
      }
    } catch {}
  }, []);

  const startNewChat = useCallback(() => {
    conversationIdRef.current = null;
    setMessages([WELCOME]);
    setError(null);
    setShowHistory(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming || remaining <= 0) return;

    setInputValue("");
    setError(null);

    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-18)
      .map(({ role, content }) => ({ role, content }));

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    let assistantContent = ""; // track streamed content locally — avoid setMessages-as-reader

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: getHeaders(),
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
        }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw Object.assign(new Error(body.error || `שגיאה ${resp.status}`), {
          status: resp.status,
        });
      }

      const rem = resp.headers.get("x-rate-limit-remaining");
      if (rem !== null && !Number.isNaN(Number(rem))) {
        setRemaining(Number(rem));
      }

      if (!resp.body) {
        throw new Error("No response stream from server");
      }

      // Server uses pipeTextStreamToResponse — plain text chunks, no protocol framing
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        assistantContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "שגיאה בחיבור לשרת");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      // Call directly — NOT inside setMessages to avoid React Strict Mode double-invoke
      if (assistantContent.trim()) {
        const history = messages
          .filter((m) => m.id !== "welcome")
          .map(({ role, content }) => ({ role, content }));
        saveConversation([
          ...history,
          { id: userMsg.id, role: "user", content: userMsg.content },
          { id: assistantId, role: "assistant", content: assistantContent },
        ]);
      }
    }
  }, [inputValue, isStreaming, remaining, messages, saveConversation]);

  const isBlocked = remaining <= 0;
  const remainingColor =
    remaining > 10
      ? "text-green-600"
      : remaining > 5
        ? "text-yellow-600"
        : "text-red-500";

  return (
    <div className="relative flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="px-4 pt-14 pb-3 border-b border-indigo-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <IconButton
          onClick={() => onBack("dashboard")}
          icon={ArrowLeft}
          className="-ml-2"
        />
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
          <Bot size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1">
            המורה בכיס
            <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-indigo-200">
              BETA
            </span>
          </h3>
          <p className={`text-[10px] font-semibold ${remainingColor}`}>
            {remaining}/{MAX_MESSAGES} הודעות נותרו השעה
          </p>
        </div>
        <button
          onClick={() => { setShowHistory(true); fetchConversations(); }}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
          title="שיחות שמורות"
        >
          <History size={18} />
        </button>
        <SafetyHeaderButton onClick={onReport} />
      </div>

      {/* ── History drawer ── */}
      {showHistory && (
        <div className="absolute inset-0 z-20 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowHistory(false)} />
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col">
            <div className="px-4 pt-14 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">שיחות שמורות</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-all"
                >
                  <Plus size={13} /> חדש
                </button>
                <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {historyLoading ? (
                <p className="text-xs text-slate-400 text-center pt-6">טוען...</p>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center pt-6">אין שיחות שמורות עדיין</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`w-full text-right px-3 py-2.5 rounded-xl border text-sm transition-all hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-between gap-2 group ${
                      conversationIdRef.current === c.id
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <span className="flex-1 truncate text-slate-700">{c.title}</span>
                    <button
                      onClick={(e) => deleteConversation(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition-all shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-sm mr-2 mt-1 shrink-0">
                <Bot size={13} />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
              }`}
            >
              {msg.content ? (
                msg.role === "user" ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[[rehypeKatex, { strict: false, output: "html" }]]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      // v10: split pre+code — pre handles block, code handles inline
                      pre: ({ children }) => (
                        <pre className="bg-slate-100 text-slate-800 rounded-lg p-2.5 my-2 overflow-x-auto text-[12px] font-mono">
                          {children}
                        </pre>
                      ),
                      code: ({ children, className }) =>
                        className ? (
                          // inside a <pre> block — just pass through, pre handles style
                          <code className={className}>{children}</code>
                        ) : (
                          // inline code
                          <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[12px] font-mono">{children}</code>
                        ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-r-4 border-indigo-300 pr-3 my-2 text-slate-600 italic">{children}</blockquote>
                      ),
                      h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mt-1 mb-1">{children}</h3>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={isBlocked ? "הגעת למגבלה השעתית" : "שאל אותי כל דבר..."}
            disabled={isBlocked}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
            <Brain size={16} />
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isStreaming || isBlocked}
          className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
} 