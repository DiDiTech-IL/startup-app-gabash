import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../lib/api";
import { useAuth } from "../../lib/auth.jsx";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Award, BookOpen, Trophy, Gamepad2, Music, Plane } from "lucide-react";

const COLORS = { blue: "#2079C6", green: "#7AC143" };

const allSubjects = [
  'מתמטיקה 5 יח"ל',
  'מתמטיקה 3 יח"ל',
  "אנגלית",
  "פיזיקה",
  "מדעי המחשב",
  "כימיה",
  "ביולוגיה",
  "ערבית",
  "היסטוריה",
  "לשון",
  'תנ"ך',
  "אזרחות",
  "ספרות",
  "גיאוגרפיה",
];
const interestsList = [
  { id: "sport", label: "ספורט", icon: <Trophy size={20} /> },
  { id: "gaming", label: "גיימינג", icon: <Gamepad2 size={20} /> },
  { id: "music", label: "מוזיקה", icon: <Music size={20} /> },
  { id: "travel", label: "טיולים", icon: <Plane size={20} /> },
];

export function OnboardingScreen({
  toggleSelection,
  selectedStrong,
  selectedWeak,
  selectedInterests,
  onNext,
  onOpenProfile,
  onReport,
}) {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();

  const prefMutation = useMutation({
    mutationFn: (data) => usersApi.updatePreferences(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      onNext("matching");
    },
  });

  const isValid = selectedStrong.length > 0 || selectedWeak.length > 0;

  const handleNext = () => {
    if (!isValid) return;
    prefMutation.mutate({
      strongSubjects: selectedStrong,
      weakSubjects: selectedWeak,
      interests: selectedInterests,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white px-6 pb-4 pt-14 shadow-sm z-10 sticky top-0 border-b border-slate-50 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => onNext("dashboard")} icon={ArrowLeft} className="transform rotate-180 mr-2" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">הגדרת חיפוש</h2>
            <p className="text-slate-400 text-xs">במה נתמקד היום?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <SafetyHeaderButton onClick={onReport} />
          <ProfileHeaderButton onClick={onOpenProfile} />
        </div>
      </div>

      <div className="flex-1 p-5 space-y-6 overflow-y-auto pb-24">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3">
            <span className="p-1.5 bg-green-100 rounded-lg"><Award size={18} color={COLORS.green} /></span>
            במה אני חזק/ה?
          </h3>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((item) => {
              const isSelected = selectedStrong.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleSelection(item, "strong")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    isSelected
                      ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200 scale-105"
                      : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                  }`}
                >
                  {item} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3">
            <span className="p-1.5 bg-blue-100 rounded-lg"><BookOpen size={18} color={COLORS.blue} /></span>
            אני צריך/ה עזרה ב...
          </h3>
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((item) => {
              const isSelected = selectedWeak.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleSelection(item, "weak")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105"
                      : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {item} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
            תחומי עניין (לשידוך מדויק יותר)
            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full">חדש!</span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {interestsList.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleSelection(interest.id, "interest")}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? "bg-blue-50 border-blue-400 text-blue-600 shadow-sm"
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span className={`text-xl mb-1 ${isSelected ? "scale-110" : "grayscale"}`}>{interest.icon}</span>
                  <span className="text-[10px] font-medium">{interest.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-slate-100 absolute bottom-0 w-full z-20">
        <button
          onClick={handleNext}
          disabled={!isValid || prefMutation.isPending}
          className={`w-full py-3.5 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 ${
            !isValid ? "bg-slate-300 shadow-none cursor-not-allowed" : ""
          }`}
          style={isValid ? { backgroundColor: COLORS.blue } : {}}
        >
          {prefMutation.isPending ? "מחפש..." : !isValid ? "בחר מקצוע כדי להמשיך" : "מצא לי התאמות"}
        </button>
        {prefMutation.isError && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {prefMutation.error?.message || "שמירת ההעדפות נכשלה, נסה/י שוב"}
          </p>
        )}
      </div>
    </div>
  );
}
