import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { threadsApi } from "../../lib/api";
import { useAuth } from "../../lib/auth.jsx";
import { IconButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Send, Flag, Phone, MoreVertical } from "lucide-react";

export function ChatScreen({ partner, onBack, subject, isTeaching, onReport }) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(null);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const partnerName = partner?.name || "רועי";

  // Create / get thread
  const createThread = useMutation({
    mutationFn: () => threadsApi.create({ partnerId: partner?.id }),
    onSuccess: (data) => setThreadId(data.id),
  });

  useEffect(() => {
    if (partner?.id) createThread.mutate();
  }, [partner?.id]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => threadsApi.messages(threadId),
    enabled: !!threadId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (text) => threadsApi.sendMessage(threadId, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", threadId] }),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !threadId) return;
    sendMutation.mutate(input.trim());
    setInput("");
  };

  const quickStarters = isTeaching
    ? [
        `היי ${partnerName}, אני יכול/ה לעזור ב${subject}. מתי נוח לך?`,
        `רוצה שנתאם תרגול קצר ב${subject} היום?`,
        `בכיף אעזור לך ב${subject}. מתאים ב-${new Date().toLocaleTimeString("he-IL", {
          hour: "2-digit",
          minute: "2-digit",
        })}?`,
      ]
    : [
        `היי ${partnerName}, ראיתי שאת/ה יכול/ה לעזור ב${subject}. אפשר לקבוע?`,
        `אשמח לעזרה ב${subject}. מתי נוח לך?`,
        `אפשר שיעור קצר ב${subject} השבוע?`,
      ];

  const sendStarter = (text) => {
    if (!threadId || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  const displayMessages = messages.length > 0 ? messages : null;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-3 pb-3 pt-14 shadow-sm sticky top-0 z-20 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => onBack("matching")} icon={ArrowLeft} className="transform rotate-180" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${partner?.avatarColor || "bg-blue-100"} rounded-full flex items-center justify-center text-xs font-bold text-slate-600`}>
              {partnerName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{partnerName}</h2>
              <p className="text-[10px] text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span> מחובר
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 text-slate-400">
          <button onClick={onReport} className="text-red-400 hover:text-red-500 bg-red-50 p-2.5 rounded-full">
            <Flag size={18} />
          </button>
          <Phone size={18} className="cursor-pointer hover:text-blue-500 p-2" />
          <MoreVertical size={18} className="cursor-pointer hover:text-slate-600 p-2" />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#e5ddd5] bg-opacity-30">
        <div className="flex justify-center mb-4">
          <span className="bg-slate-200 text-slate-500 text-[10px] px-2 py-1 rounded-full">היום</span>
        </div>

        {createThread.isPending && (
          <div className="flex justify-center">
            <span className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1.5 rounded-full">
              פותח צ׳אט...
            </span>
          </div>
        )}

        {createThread.isError && (
          <div className="flex justify-center">
            <span className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-full">
              {createThread.error?.message || "לא הצלחנו לפתוח צ׳אט, נסה/י שוב"}
            </span>
          </div>
        )}

        {!displayMessages ? (
          <>
            <div className="flex justify-center px-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center max-w-[95%] shadow-sm">
                <p className="text-sm font-semibold text-slate-700 mb-1">עדיין אין הודעות בצ׳אט הזה</p>
                <p className="text-xs text-slate-500">בחר/י אפשרות לפתיחת שיחה או כתוב/כתבי הודעה משלך.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickStarters.map((starter) => (
                <button
                  key={starter}
                  onClick={() => sendStarter(starter)}
                  disabled={!threadId || sendMutation.isPending}
                  className="bg-white text-slate-700 border border-slate-200 rounded-full px-3 py-2 text-xs shadow-sm hover:border-green-300 hover:text-green-700 disabled:opacity-50"
                >
                  {starter}
                </button>
              ))}
            </div>
          </>
        ) : (
          displayMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-2xl shadow-sm max-w-[80%] text-sm ${
                  isMe ? "bg-[#dcf8c6] rounded-tl-none text-slate-800" : "bg-white rounded-tr-none text-slate-800"
                }`}>
                  {msg.text}
                  <span className="text-[9px] text-slate-400 block text-left mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">+</button>
        <input
          type="text"
          placeholder="הקלד הודעה..."
          className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-shadow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !threadId}
          className="p-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Send size={18} className="transform rotate-180" />
        </button>
      </div>
    </div>
  );
}
