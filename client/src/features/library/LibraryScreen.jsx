import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { libraryApi } from "../../lib/api";
import { useAuth } from "../../lib/auth.jsx";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Search, Link2, ExternalLink, Plus, X } from "lucide-react";

const ALL_SUBJECTS = [
  { name: 'מתמטיקה 5 יח"ל', icon: "📐", color: "bg-blue-50 border-blue-100" },
  { name: 'מתמטיקה 3 יח"ל', icon: "🔢", color: "bg-blue-50 border-blue-100" },
  { name: "אנגלית", icon: "🇬🇧", color: "bg-red-50 border-red-100" },
  { name: "פיזיקה", icon: "⚛️", color: "bg-indigo-50 border-indigo-100" },
  { name: "מדעי המחשב", icon: "💻", color: "bg-cyan-50 border-cyan-100" },
  { name: "כימיה", icon: "🧪", color: "bg-emerald-50 border-emerald-100" },
  { name: "ביולוגיה", icon: "🧬", color: "bg-green-50 border-green-100" },
  { name: "ערבית", icon: "🌙", color: "bg-yellow-50 border-yellow-100" },
  { name: "היסטוריה", icon: "🏛️", color: "bg-orange-50 border-orange-100" },
  { name: "לשון", icon: "📚", color: "bg-lime-50 border-lime-100" },
  { name: 'תנ"ך', icon: "📜", color: "bg-amber-50 border-amber-100" },
  { name: "אזרחות", icon: "🏛", color: "bg-slate-50 border-slate-200" },
  { name: "ספרות", icon: "✍️", color: "bg-pink-50 border-pink-100" },
  { name: "גיאוגרפיה", icon: "🌍", color: "bg-teal-50 border-teal-100" },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

function AddResourceModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !url.trim() || !subject) return;
    onSubmit({ title: title.trim(), url: url.trim(), subject });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[90%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-800 text-lg">הוספת קישור לימודי</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">כותרת</label>
            <input
              type="text"
              placeholder='סיכום פיזיקה לבגרות, מאמר על מלחמת יום כיפור...'
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">קישור (URL)</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">מקצוע</label>
            <select
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400 bg-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">בחר מקצוע...</option>
              {ALL_SUBJECTS.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm">
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !url.trim() || !subject}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
          >
            הוסף קישור
          </button>
        </div>
      </div>
    </div>
  );
}

export function LibraryScreen({ onBack, onOpenProfile, onReport }) {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [filterSubject, setFilterSubject] = useState(null);
  const queryClient = useQueryClient();

  const { data: subjectCounts = [] } = useQuery({
    queryKey: ["library", "subjects"],
    queryFn: libraryApi.subjects,
  });

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["library", "resources", filterSubject || "all"],
    queryFn: () => libraryApi.resources(filterSubject || undefined, "all"),
  });

  const addMutation = useMutation({
    mutationFn: libraryApi.addResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });

  // Build subject grid from static list, enriched with DB counts
  const countMap = Object.fromEntries(subjectCounts.map((c) => [c.subject, c.count]));
  const userSubjects = new Set([...(user?.strongSubjects ?? []), ...(user?.weakSubjects ?? [])]);

  // Sort: user's subjects first, then rest, only show subjects that have resources or user selected
  const subjects = ALL_SUBJECTS.filter(
    (s) => userSubjects.has(s.name) || countMap[s.name] > 0
  ).sort((a, b) => (userSubjects.has(b.name) ? 1 : 0) - (userSubjects.has(a.name) ? 1 : 0));

  // If nothing matches yet, show all subjects
  const displaySubjects = subjects.length > 0 ? subjects : ALL_SUBJECTS;

  const filteredResources = resources;

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out] relative">
      {showAdd && (
        <AddResourceModal
          onClose={() => setShowAdd(false)}
          onSubmit={(data) => addMutation.mutate(data)}
        />
      )}

      <div className="bg-white px-4 pb-4 pt-14 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
        <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="transform rotate-180" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">הספרייה</h2>
          <p className="text-xs text-slate-500">קישורים ומשאבי לימוד</p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            title="הוסף קישור"
          >
            <Plus size={18} />
          </button>
          <ProfileHeaderButton onClick={onOpenProfile} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Subject groups */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">מקצועות לימוד</h3>
          <div className="grid grid-cols-2 gap-3">
            {displaySubjects.map((cat) => {
              const count = countMap[cat.name] ?? 0;
              const isActive = filterSubject === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setFilterSubject(isActive ? null : cat.name)}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all ${
                    isActive
                      ? "ring-2 ring-blue-400 ring-offset-1 " + cat.color
                      : cat.color
                  } ${userSubjects.has(cat.name) ? "border-2" : ""}`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {count > 0 ? `${count} קישורים` : "אין עדיין"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">
              {filterSubject ? `קישורים ל${filterSubject}` : "נוספו לאחרונה (לפי המקצועות שלך)"}
            </h3>
            {!isLoading && (
              <span className="text-[10px] text-slate-400">נטענו {filteredResources.length} קישורים</span>
            )}
            {filterSubject && (
              <button
                onClick={() => setFilterSubject(null)}
                className="text-[10px] text-blue-600 font-medium flex items-center gap-1"
              >
                <X size={12} /> נקה
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center text-slate-400 animate-pulse py-6">טוען...</div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <Link2 size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">אין קישורים עדיין</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-3 text-xs text-blue-600 font-bold"
              >
                הוסף ראשון +
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((res) => (
                <div key={res.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <Link2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{res.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      {res.subject} • {res.author.name} • {timeAgo(res.createdAt)}
                    </p>
                  </div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

