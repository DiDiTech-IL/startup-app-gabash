import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "../../lib/api";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Star, MessageCircle, Filter } from "lucide-react";

export function MatchingScreen({
  selectedWeak,
  selectedStrong,
  selectedInterests,
  onBack,
  onChat,
  onSuccess,
  onOpenProfile,
  onReport,
}) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: matchesApi.list,
  });

  const getHeaderText = () => {
    if (selectedWeak.length > 0) return `מורים ל${selectedWeak[0]}`;
    if (selectedStrong.length > 0) return `תלמידים ל${selectedStrong[0]}`;
    return "חיפוש כללי";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 pb-4 pt-14 shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
        <IconButton onClick={() => onBack("onboarding")} icon={ArrowLeft} className="transform rotate-180" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 leading-tight">נמצאו התאמות</h2>
          <p className="text-xs text-slate-500">
            {getHeaderText()}
            {selectedInterests.length > 0 ? ` • ${selectedInterests.length} תחומי עניין` : " • מבוסס פרופיל"}
          </p>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <ProfileHeaderButton onClick={onOpenProfile} />
          <IconButton onClick={() => {}} icon={Filter} />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-4">
        {isLoading ? (
          <div className="text-center text-slate-400 py-10 animate-pulse">מחפש התאמות...</div>
        ) : (
          matches.map((match, index) => (
            <div
              key={match.user.id}
              className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all relative ${
                index === 0 ? "ring-2 ring-green-400 ring-offset-2" : ""
              }`}
            >
              {index === 0 && (
                <div className="absolute top-0 left-6 -mt-3 bg-green-500 text-white text-[10px] px-3 py-0.5 rounded-full font-bold shadow-sm z-10 animate-pulse">
                  התאמה מושלמת!
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className={`w-12 h-12 ${match.user.avatarColor || "bg-slate-200"} rounded-full flex items-center justify-center text-lg font-bold text-slate-600`}>
                    {match.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800">{match.user.name}</h3>
                    <p className="text-xs text-slate-500 mb-0.5">שכבה {match.user.grade} • {match.user.school}</p>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400" fill="currentColor" />
                      <span className="text-xs font-bold text-slate-700">
                        {((match.user.points / 100) + 4).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  match.matchPercent > 80 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {match.matchPercent}%
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl mb-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                "{match.dynamicAbout}"
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSuccess("success", match.user)}
                  className={`flex-1 py-2 rounded-lg text-white font-bold text-xs shadow-sm active:scale-95 transition-all ${
                    index === 0 ? "bg-green-500 hover:bg-green-600" : "bg-slate-800 hover:bg-slate-900"
                  }`}
                >
                  קבע שיעור
                </button>
                <button
                  onClick={() => onChat(match.user)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-200 active:scale-95 transition-all"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
