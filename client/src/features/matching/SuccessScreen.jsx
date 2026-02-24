import { CheckCircle, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { sessionsApi } from "../../lib/api";

const COLORS = { green: "#7AC143" };

export function SuccessScreen({ partner, onHome }) {
  const scheduleMutation = useMutation({
    mutationFn: () =>
      sessionsApi.create({
        partnerId: partner?.id,
        subject: partner?.strongSubjects?.[0] || "לימודים",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 60,
        location: "ספריית בית הספר",
        isMentor: false,
      }),
    onSuccess: () => onHome("dashboard"),
  });

  // Auto-schedule on mount if partner is available
  // (session was already triggered via the flow, this screen just confirms)

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
          נקבע שיעור עם {partner?.name || "רועי"} • יום ג', 16:00
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
