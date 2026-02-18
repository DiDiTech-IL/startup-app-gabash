import { useState, useEffect, useRef } from "react";
import { IconButton, SafetyHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Camera, Brain, Send, Bot } from "lucide-react";

export function AiAssistantScreen({ onBack, onReport }) {
  const [messages, setMessages] = useState([
    { type: "ai", text: "היי! אני ה-AI שלך. \nנתקעת בתרגיל? צריך הסבר? צלם לי או כתוב לי כאן! 🤖" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let response = "מעניין! תן לי רגע לחשוב על זה...";
      const text = inputValue.toLowerCase();
      if (text.includes("נגזרת") || text.includes("פונקציה") || text.includes("מתמטיקה")) {
        response = "אין בעיה! כדי לגזור את הפונקציה הזו, נשתמש בכלל המנה:\n\n(u/v)' = (u'v - uv') / v²\n\n1. נגזור את המונה.\n2. נגזור את המכנה.\n3. נציב בנוסחה.\n\nרוצה שאפתור דוגמה מלאה?";
      } else if (text.includes("היסטוריה") || text.includes("מלחמה")) {
        response = "בטח. הסיבה העיקרית לפרוץ המלחמה הייתה מערכת הבריתות המסובכת באירופה, יחד עם רצח יורש העצר האוסטרו-הונגרי בסרייבו.";
      } else {
        response = "אני מבין. בוא נפרק את זה לשלבים קטנים יותר כדי שזה יהיה ברור. תרצה שאחפש לך סיכום בספרייה שלנו?";
      }
      setIsTyping(false);
      setMessages((prev) => [...prev, { type: "ai", text: response }]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="px-4 pt-14 pb-3 border-b border-indigo-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="-ml-2" />
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
          <Bot size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1">
            המורה בכיס
            <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-indigo-200">BETA</span>
          </h3>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> מחובר
          </p>
        </div>
        <SafetyHeaderButton onClick={onReport} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
              msg.type === "user"
                ? "bg-indigo-600 text-white rounded-tr-none"
                : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <button className="p-2.5 text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
          <Camera size={20} />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="שאל אותי כל דבר..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all pr-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <div className="absolute left-3 top-3.5 text-slate-400"><Brain size={16} /></div>
        </div>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          <Send size={18} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
