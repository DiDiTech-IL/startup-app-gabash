import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "../../lib/api";
import { useAuth } from "../../lib/auth.jsx";
import { IconButton, SafetyHeaderButton } from "../../components/Buttons.jsx";
import { X } from "lucide-react";

export function CalendarScreen({ partner, onBack, onReport }) {
  const { user } = useAuth();

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsApi.upcoming,
  });

  const partnerName = partner?.name || sessions[0]?.mentor?.name || sessions[0]?.student?.name || "רועי";

  const sessionToShow = sessions[0] || null;

  return (
    <div className="flex flex-col h-full bg-white animate-[fadeIn_0.3s_ease-out]">
      <div className="px-6 pt-14 pb-4 border-b border-slate-100 flex justify-between items-end bg-white z-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">פברואר</h2>
          <p className="text-slate-500 font-medium">יום שלישי, 18</p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <IconButton onClick={() => onBack("dashboard")} icon={X} />
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-white">
        {[13, 14, 15].map((h) => (
          <div key={h} className="flex gap-4 mb-8 h-10 group">
            <span className="text-xs text-slate-400 font-mono w-10 text-right pt-2">{h}:00</span>
            <div className="flex-1 border-t border-slate-100 mt-4 group-hover:border-slate-200"></div>
          </div>
        ))}

        <div className="flex gap-4 mb-8 relative h-24">
          <span className="text-xs text-slate-900 font-bold font-mono w-10 text-right pt-2">16:00</span>
          <div className="flex-1 relative">
            <div className="border-t border-slate-200 mt-4 absolute w-full"></div>
            {sessionToShow ? (
              <div className="absolute top-4 left-0 right-2 bg-blue-50/80 border-l-[6px] border-blue-500 p-3 rounded-r-xl shadow-sm backdrop-blur-sm animate-[scaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-blue-900 text-sm">
                      שיעור פרטני: {partnerName}
                    </h3>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">
                      📍 {sessionToShow.location}
                    </p>
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold">
                    {sessionToShow.durationMinutes}m
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-200 border border-white flex items-center justify-center text-[8px]">🧑‍🎓</div>
                    <div className="w-5 h-5 rounded-full bg-green-200 border border-white flex items-center justify-center text-[8px]">🙋‍♂️</div>
                  </div>
                  <span className="text-[10px] text-blue-500 font-medium">מסונכרן עם HelpIN</span>
                </div>
              </div>
            ) : (
              <div className="absolute top-4 left-0 right-2 bg-blue-50/80 border-l-[6px] border-blue-500 p-3 rounded-r-xl shadow-sm">
                <h3 className="font-bold text-blue-900 text-sm">שיעור פרטני: {partnerName}</h3>
                <p className="text-xs text-blue-700 font-medium mt-0.5">📍 ספריית בית הספר</p>
              </div>
            )}
          </div>
        </div>

        {[17, 18, 19, 20].map((h) => (
          <div key={h} className="flex gap-4 mb-8 h-10">
            <span className="text-xs text-slate-400 font-mono w-10 text-right pt-2">{h}:00</span>
            <div className="flex-1 border-t border-slate-100 mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
