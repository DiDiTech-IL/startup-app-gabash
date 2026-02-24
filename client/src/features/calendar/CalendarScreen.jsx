import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "../../lib/api";
import { useAuth } from "../../lib/auth.jsx";
import { IconButton, SafetyHeaderButton } from "../../components/Buttons.jsx";
import { CalendarClock, X } from "lucide-react";

function formatSessionDate(iso) {
  return new Date(iso).toLocaleString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  if (status === "SCHEDULED") return "מתוכנן";
  if (status === "PASSED") return "עבר";
  if (status === "COMPLETED") return "הושלם";
  if (status === "CANCELED") return "בוטל";
  return status;
}

function statusClass(status) {
  if (status === "SCHEDULED") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "PASSED") return "bg-amber-50 text-amber-700 border-amber-100";
  if (status === "COMPLETED") return "bg-green-50 text-green-700 border-green-100";
  if (status === "CANCELED") return "bg-red-50 text-red-700 border-red-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
}

export function CalendarScreen({ partner, onBack, onReport }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", "all"],
    queryFn: sessionsApi.list,
    enabled: !!user,
    staleTime: 15_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId) => sessionsApi.cancel(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", "all"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const filteredSessions = useMemo(() => {
    if (filter === "ALL") return sessions;
    return sessions.filter((session) => session.role === filter);
  }, [sessions, filter]);

  const filterTabs = [
    { key: "ALL", label: "הכל" },
    { key: "REQUESTED", label: "ביקשתי" },
    { key: "INVITED", label: "הוזמנתי" },
  ];

  const titleMonth = new Date().toLocaleDateString("he-IL", { month: "long" });

  return (
    <div className="flex flex-col h-full bg-white animate-[fadeIn_0.3s_ease-out]">
      <div className="px-6 pt-14 pb-4 border-b border-slate-100 flex justify-between items-end bg-white z-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{titleMonth}</h2>
          <p className="text-slate-500 font-medium">יומן מפגשים</p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <IconButton onClick={() => onBack("dashboard")} icon={X} />
        </div>
      </div>

      <div className="px-4 pt-3 pb-2 flex gap-2 border-b border-slate-100 bg-white">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === tab.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
        {isLoading ? (
          <div className="text-center text-slate-400 py-10 animate-pulse">טוען מפגשים...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-600">
            <p className="font-bold text-slate-700 mb-1">אין מפגשים להצגה</p>
            <p className="text-xs text-slate-500">מפגשים שביקשת או שהוזמנת אליהם יופיעו כאן.</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const peer = session.mentorId === user?.id ? session.student : session.mentor;
            return (
              <div key={session.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{session.subject}</p>
                    <p className="text-xs text-slate-500 truncate">עם {peer?.name || partner?.name || "משתמש"}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusClass(session.derivedStatus)}`}>
                    {statusLabel(session.derivedStatus)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                  <CalendarClock size={14} className="text-slate-400" />
                  <span>{formatSessionDate(session.startTime)}</span>
                  <span>•</span>
                  <span>{session.durationMinutes} דקות</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">סוג:</span>{" "}
                    {session.role === "REQUESTED" ? "ביקשתי" : "הוזמנתי"}
                    <span className="mx-1">•</span>
                    <span>{session.location}</span>
                  </div>

                  {session.derivedStatus === "SCHEDULED" && (
                    <button
                      onClick={() => cancelMutation.mutate(session.id)}
                      disabled={cancelMutation.isPending}
                      className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1 disabled:opacity-50"
                    >
                      בטל מפגש
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
