import { useState } from "react";
import { ArrowLeft, Gift, Tag } from "lucide-react";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";

const systemConversations = [
  {
    id: "rewards",
    name: "HelpIN Rewards",
    avatar: "🎁",
    avatarBg: "bg-yellow-100",
    lastMessage: "צבור נקודות ומימוש פרסים!",
    time: "עכשיו",
  },
];

export function MessagesScreen({ onBack, redeemedItem, onReport, onOpenProfile }) {
  const [active, setActive] = useState(redeemedItem ? "rewards" : null);

  if (active === "rewards") {
    return (
      <div className="flex flex-col h-full bg-white animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-white px-4 pb-4 pt-14 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
          <IconButton onClick={() => setActive(null)} icon={ArrowLeft} className="transform rotate-180" />
          <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center text-xl">🎁</div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-800">HelpIN Rewards</h2>
            <p className="text-xs text-slate-500">מערכת מתגמלת</p>
          </div>
          <SafetyHeaderButton onClick={onReport} />
          <ProfileHeaderButton onClick={onOpenProfile} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
              <p className="text-xs text-slate-700">👋 ברוכים הבאים ל-HelpIN Rewards! צבור נקודות על הדרכות ומימוש פרסים מגניבים.</p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
              <p className="text-xs text-slate-700">🌟 כל שעת הדרכה = 1 שעת התנדבות + נקודות!</p>
            </div>
          </div>

          {redeemedItem && (
            <>
              <div className="flex justify-start">
                <div className="bg-green-50 border border-green-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-700">פרס מומש בהצלחה! 🎉</span>
                  </div>
                  <p className="text-xs text-slate-700">מימשת את הפרס <span className="font-bold">{redeemedItem.name}</span></p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border-2 border-dashed border-yellow-400 rounded-2xl px-4 py-4 max-w-xs shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={14} className="text-yellow-600" />
                    <span className="text-xs font-bold text-slate-700">קוד קופון</span>
                  </div>
                  <div className="bg-yellow-50 rounded-lg px-4 py-2 text-center">
                    <p className="text-lg font-mono font-bold tracking-widest text-yellow-700">{redeemedItem.code}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2">הצג בקופה לקבלת ההנחה</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white px-4 pb-4 pt-14 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
        <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="transform rotate-180" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">הודעות</h2>
          <p className="text-xs text-slate-500">עדכונים ומערכת</p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <ProfileHeaderButton onClick={onOpenProfile} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {systemConversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActive(conv.id)}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-100 hover:border-blue-200 transition-colors text-right relative"
          >
            {conv.id === "rewards" && redeemedItem && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
            )}
            <div className={`w-12 h-12 ${conv.avatarBg} rounded-full flex items-center justify-center text-2xl shadow-sm`}>
              {conv.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{conv.time}</span>
                <h3 className="text-sm font-bold text-slate-800">{conv.name}</h3>
              </div>
              <p className="text-xs text-slate-500 truncate text-right">{redeemedItem && conv.id === "rewards" ? `הקופון שלך: ${redeemedItem.code}` : conv.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
