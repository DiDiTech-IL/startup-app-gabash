import { useAuth } from "../../lib/auth.jsx";
import { SafetyHeaderButton } from "../../components/Buttons.jsx";
import {
  Clock, Star, Users, ArrowLeft, MessageSquare, BookOpen, ShoppingBag,
  Bot, Sparkles, ChevronRight
} from "lucide-react";

export function DashboardScreen({ onNavigate, onOpenProfile, onReport }) {
  const { user } = useAuth();
  const greeting = user ? `בוקר טוב, ${user.name.split(" ")[0]} ☀️` : "בוקר טוב ☀️";

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.5s_ease-out]">
      <div className="pt-16 px-6 pb-6 bg-white rounded-b-[2.5rem] shadow-sm z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              <span className="text-blue-600">Help</span>
              <span className="text-green-600">IN</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">{greeting}</p>
          </div>
          <div className="flex gap-2">
            <SafetyHeaderButton onClick={onReport} />
            <button
              onClick={onOpenProfile}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:bg-blue-50 transition-colors active:scale-95"
            >
              <span className="text-xl">🧑‍🎓</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 flex items-center gap-2 whitespace-nowrap">
            <Clock size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-800">
              {user?.volunteerHours ?? 0} שעות
            </span>
          </div>
          <div className="bg-yellow-50 px-4 py-2.5 rounded-xl border border-yellow-100 flex items-center gap-2 whitespace-nowrap">
            <Star size={16} className="text-yellow-600" />
            <span className="text-xs font-bold text-yellow-800">
              {user?.points ?? 0} נק׳
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <h2 className="text-slate-800 font-bold text-lg mb-2">מה עושים היום?</h2>

        <div
          onClick={() => onNavigate("onboarding")}
          className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-blue-600">
                <Users size={22} />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-1">חונכות ולמידה</h3>
              <p className="text-xs text-slate-500 max-w-[140px]">מצא מורה פרטי או תלמיד שצריך עזרה</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ArrowLeft size={24} />
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate("ai_assistant")}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 rounded-3xl shadow-lg shadow-indigo-200 relative overflow-hidden group cursor-pointer active:scale-95 transition-all text-white"
        >
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-[10px] font-bold tracking-wider flex items-center gap-1">
            <Sparkles size={10} /> PREMIUM
          </div>
          <div className="flex justify-between items-end relative z-10 mt-2">
            <div>
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white backdrop-blur-sm border border-white/10">
                <Bot size={22} />
              </div>
              <h3 className="font-bold text-lg mb-0.5">המורה בכיס AI</h3>
              <p className="text-xs text-indigo-100">עזרה בשיעורי בית 24/7</p>
            </div>
            <div className="bg-white text-indigo-600 p-2.5 rounded-xl shadow-md">
              <ChevronRight size={20} className="rotate-180" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => onNavigate("feed")}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-all"
          >
            <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-purple-600">
              <MessageSquare size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900">הקהילה</h3>
            <p className="text-[10px] text-slate-500 mt-1">שאלות ותשובות</p>
          </div>

          <div
            onClick={() => onNavigate("library")}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-all"
          >
            <div className="bg-orange-100 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-orange-600">
              <BookOpen size={22} />
            </div>
            <h3 className="font-bold text-base text-slate-900">הספרייה</h3>
            <p className="text-[10px] text-slate-500 mt-1">סיכומים ומבחנים</p>
          </div>

          <div
            onClick={() => onNavigate("rewards")}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 cursor-pointer active:scale-95 transition-all col-span-2 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-green-50 to-transparent opacity-50"></div>
            <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center text-green-600 relative z-10">
              <ShoppingBag size={22} />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="font-bold text-base text-slate-900">חנות הטבות</h3>
              <p className="text-[10px] text-slate-500">ממש את הנקודות שלך 🍕</p>
            </div>
            <div className="bg-green-50 px-2 py-1 rounded-lg border border-green-100 text-xs font-bold text-green-700 relative z-10">
              חדש!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
