import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Search, FileText, Download, BookOpen } from "lucide-react";

const categories = [
  { id: 1, name: "מתמטיקה", icon: "📐", count: 124, color: "bg-blue-50 border-blue-100" },
  { id: 2, name: "היסטוריה", icon: "🏛️", count: 85, color: "bg-orange-50 border-orange-100" },
  { id: 3, name: "אנגלית", icon: "🇬🇧", count: 200, color: "bg-red-50 border-red-100" },
  { id: 4, name: "לשון", icon: "📚", count: 56, color: "bg-green-50 border-green-100" },
];

const recentFiles = [
  { id: 1, name: "סיכום לבגרות בהיסטוריה - שואה", type: "PDF", size: "2.4MB" },
  { id: 2, name: 'דף נוסחאות מתמטיקה 5 יח"ל', type: "PDF", size: "1.1MB" },
  { id: 3, name: "מבחן לדוגמה באזרחות", type: "DOCX", size: "500KB" },
];

export function LibraryScreen({ onBack, onOpenProfile, onReport }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white px-4 pb-4 pt-14 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
        <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="transform rotate-180" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">הספרייה</h2>
          <p className="text-xs text-slate-500">סיכומים, מבחנים ועזרים</p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <IconButton onClick={() => {}} icon={Search} />
          <ProfileHeaderButton onClick={onOpenProfile} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">מקצועות לימוד</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border ${cat.color} flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-transform`}
              >
                <span className="text-2xl mb-2">{cat.icon}</span>
                <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                <span className="text-[10px] text-slate-500">{cat.count} קבצים</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">נוספו לאחרונה</h3>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div key={file.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{file.name}</h4>
                  <p className="text-[10px] text-slate-400">{file.type} • {file.size}</p>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
