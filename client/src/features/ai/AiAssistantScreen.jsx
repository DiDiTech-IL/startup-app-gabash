import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { IconButton, SafetyHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Brain, Send, Bot, AlertCircle } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";
const MAX_MESSAGES = 20;

const WELCOME = {
  id: "welcome",
  role: "assistant",
  content: "היי! אני המורה בכיס שלך 🤖\nנתקעת בשיעורי בית? צריך הסבר על נושא? כתוב לי ואני אעזור!",
};

export function AiAssistantScreen({ onBack, onReport }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [remaining, setRemaining] = useState(MAX_MESSAGES);
  const [rateLimitMsg, setRateLimitMsg] = useState(null);

  // Fetch the user's current rate-limit status on mount
  useEffect(() => {
    const token = localStorage.getItem("helpin_token");
    fetch(`${BASE_URL}/api/ai/status`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(API_KEY ? { "x-api-key": API_KEY } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      })
      .catch(() => {});
  }, []);

  const { messages, input, setInput, append, isLoading, error } = useChat({
    api: `${BASE_URL}/api/ai/chat`,
    initialMessages: [WELCOME],

    // Attach JWT + API-key to every streaming request
    fetch: async (url, options) => {
      const token = localStorage.getItem("helpin_token");
      const resp = await window.fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        },
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: resp.statusText }));
        const msg = typeof body.error === "string" ? body.error : `שגיאה ${resp.status}`;
        if (resp.status === 429) setRateLimitMsg(msg);
        throw new Error(msg);
      }
      return resp;
    },

    // Read remaining-messages count from response headers
    onResponse(response) {
      const rem = response.headers.get("x-rate-limit-remaining");
      if (rem !== null) setRemaining(Number(rem));
      setRateLimitMsg(null);
    },
  });

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading || remaining <= 0) return;
    setInput("");
    setRateLimitMsg(null);
    append({ role: "user", content: text });
  };

  const isBlocked = remaining <= 0;
  const remainingColor =
    remaining > 10 ? "text-green-600" : remaining > 5 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="px-4 pt-14 pb-3 border-b border-indigo-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="-ml-2" />
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
        <SafetyHeaderButton onClick={onReport} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-sm mr-2 mt-1 shrink-0">
                <Bot size={13} />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming indicator (shown while waiting for first token) */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot size={13} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {/* Rate-limit / network error */}
        {(rateLimitMsg || (error && !rateLimitMsg)) && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{rateLimitMsg || error?.message || "אירעה שגיאה, נסה שוב."}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={isBlocked ? "הגעת למגבלה השעתית" : "שאל אותי כל דבר..."}
            disabled={isBlocked}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
            <Brain size={16} />
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || isBlocked}
          className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
