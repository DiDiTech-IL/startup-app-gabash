import { CheckCircle, Clock, CalendarDays } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { sessionsApi } from "../../lib/api";

const COLORS = { green: "#7AC143" };

// Returns default datetime string 24 hours from now formatted for datetime-local input
function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Format ISO date to Hebrew-friendly display
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SuccessScreen({ partner, onHome }) {
  const [dateTime, setDateTime] = useState(defaultDateTime);
  const [location, setLocation] = useState("ספריית בית הספר");
  const [scheduled, setScheduled] = useState(false);

  const scheduleMutation = useMutation({
    mutationFn: () =>
      sessionsApi.create({
        partnerId: partner?.id,
        subject: partner?.strongSubjects?.[0] || "לימודים",
        startTime: new Date(dateTime).toISOString(),
        durationMinutes: 60,
        location: location || "ספריית בית הספר",
        isMentor: false,
      }),
    onSuccess: () => setScheduled(true),
  });

  if (scheduled) {
    return (
      <div className="flex flex-col items-center h-full p-8 text-center bg-white">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center relative z-10 border-4 border-green-100 animate-[bounce_2s_infinite]">
              <CheckCircle size={40} color={COLORS.green} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-1">השיעור נקבע בהצלחה! 📚</h2>
          <p className="text-slate-500 text-sm mb-6">
            נקבע שיעור עם {partner?.name || "רועי"} ב‑{formatDate(dateTime)}
          </p>

          <div className="w-full bg-white p-5 rounded-2xl border-2 border-blue-100 shadow-lg shadow-blue-50 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-blue-600 tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">AUTOMATIC</span>
                <Clock size={18} className="text-blue-500 animate-pulse" />
              </div>
              <div className="text-right">
                <h3 className="font-bold text-slate-800 text-lg mb-1">דיווח שעות אוטומטי</h3>
                <p className="text-xs text-slate-500 leading-snug">
                  אל דאגה, בסיום המפגש המערכת תדווח אוטומטית על
                  <span className="font-black mx-1 text-blue-600 bg-blue-50 px-1 rounded">שעתיים</span>
                  למאגר משרד החינוך.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => onHome("dashboard")} className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors pb-4">
          חזרה למסך הבית
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full p-8 bg-white overflow-y-auto">
      <div className="w-full flex flex-col items-center">
        <div className="relative mb-5 mt-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
            <CalendarDays size={32} color={COLORS.green} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-1 text-center">
          קביעת שיעור עם {partner?.name || "רועי"} 📚
        </h2>
        <p className="text-slate-500 text-sm mb-6 text-center">בחר תאריך, שעה ומיקום למפגש</p>

        <div className="w-full space-y-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-600 mb-2">📅 תאריך ושעה</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
              dir="ltr"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-600 mb-2">📍 מיקום</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ספריית בית הספר, זום, וכו׳"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>

        <button
          onClick={() => scheduleMutation.mutate()}
          disabled={!dateTime || scheduleMutation.isPending}
          className="w-full py-3.5 bg-green-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {scheduleMutation.isPending ? "קובע שיעור..." : "אשר קביעת שיעור ✓"}
        </button>

        {scheduleMutation.isError && (
          <p className="text-xs text-red-500 mb-3">{scheduleMutation.error?.message || "שגיאה בקביעת השיעור"}</p>
        )}

        <button onClick={() => onHome("dashboard")} className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors pb-4">
          ביטול, חזרה למסך הבית
        </button>
      </div>
    </div>
  );
}
