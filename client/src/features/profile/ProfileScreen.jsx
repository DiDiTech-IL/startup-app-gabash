import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth.jsx";
import { usersApi } from "../../lib/api";
import { IconButton } from "../../components/Buttons.jsx";
import { X, Award, Shield, Zap, Heart, Star, Trophy, LogOut } from "lucide-react";
import { useState } from "react";

export function ProfileScreen({ onClose, onSignout }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: freshUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: usersApi.me,
    enabled: activeTab === "profile",
    staleTime: 10_000,
  });

  const profileUser = freshUser || user;

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: usersApi.leaderboard,
    enabled: activeTab === "leaderboard",
  });

  const maxHours = 60;
  const progress = profileUser ? Math.min(100, (profileUser.volunteerHours / maxHours) * 100) : 0;

  const topSubject = profileUser?.strongSubjects?.[0] || null;
  const volunteerHours = profileUser?.volunteerHours ?? 0;
  const points = profileUser?.points ?? 0;

  const badges = [
    {
      id: 1,
      icon: <Shield size={20} />,
      label: "חונך/ת מאומת/ת",
      color: "bg-blue-100 text-blue-600",
      unlocked: volunteerHours >= 1,
      criteria: volunteerHours >= 1 ? "נפתח" : "שעה ראשונה לפתיחה",
    },
    {
      id: 2,
      icon: <Heart size={20} />,
      label: "לב זהב",
      color: "bg-red-100 text-red-600",
      unlocked: volunteerHours >= 10,
      criteria: volunteerHours >= 10 ? "נפתח" : `נותרו ${10 - volunteerHours} שעות`,
    },
    {
      id: 3,
      icon: <Zap size={20} />,
      label: "צובר/ת נקודות",
      color: "bg-yellow-100 text-yellow-600",
      unlocked: points >= 50,
      criteria: points >= 50 ? "נפתח" : `נותרו ${50 - points} נק׳`,
    },
    {
      id: 4,
      icon: <Award size={20} />,
      label: topSubject ? `תותח/ית ${topSubject}` : "מומחה/ית מקצוע",
      color: "bg-purple-100 text-purple-600",
      unlocked: !!topSubject && points >= 20,
      criteria: !topSubject ? "בחר/י מקצוע חוזק" : points >= 20 ? "נפתח" : `נותרו ${20 - points} נק׳`,
    },
    {
      id: 5,
      icon: <Star size={20} />,
      label: "חונך/ת מצטיין/ת",
      color: "bg-emerald-100 text-emerald-600",
      unlocked: volunteerHours >= 30 && points >= 150,
      criteria:
        volunteerHours >= 30 && points >= 150
          ? "נפתח"
          : `צריך/ה 30 שעות ו-150 נק׳`,
    },
  ];

  return (
    <div className="absolute inset-0 bg-slate-50 z-40 flex flex-col animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white px-6 pb-2 pt-14 shadow-sm relative z-10">
        <IconButton onClick={onClose} icon={X} className="absolute top-14 left-6" />
        <div className="flex flex-col items-center mt-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-green-200 rounded-full flex items-center justify-center text-3xl mb-3 border-4 border-white shadow-lg">
            🧑‍🎓
          </div>
          <h2 className="text-xl font-bold text-slate-800">{profileUser?.name || ""}</h2>
          <p className="text-sm text-slate-500">{profileUser?.school} • {profileUser?.grade}</p>

          <div className="flex gap-2 mt-6 bg-slate-100 p-1 rounded-xl w-full max-w-[240px]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "profile" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            >
              הפרופיל שלי
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === "leaderboard" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
            >
              טבלת מובילים 🏆
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "profile" ? (
          <div className="p-6 space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-700 text-sm">שעות התנדבות</h3>
                <span className="text-blue-600 font-bold text-lg">{profileUser?.volunteerHours ?? 0}/{maxHours}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">
                עוד {Math.max(0, maxHours - (profileUser?.volunteerHours ?? 0))} שעות לקבלת תעודת הצטיינות!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-700 text-sm mb-3">הנקודות שלי</h3>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-slate-800">{profileUser?.points ?? 0}</p>
                  <p className="text-xs text-slate-500">נקודות צבורות</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">⭐</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-700 text-sm mb-3">התגים שלי (Badges)</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 shadow-sm ${
                      badge.unlocked
                        ? "bg-white border-slate-100"
                        : "bg-slate-50 border-dashed border-slate-200 opacity-70"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${badge.unlocked ? badge.color : "bg-slate-200 text-slate-400"}`}>
                      {badge.icon}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${badge.unlocked ? "text-slate-700" : "text-slate-400"}`}>{badge.label}</p>
                      <p className="text-[10px] text-slate-400">{badge.criteria}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onSignout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 text-red-500 text-sm font-bold hover:bg-red-50 active:scale-95 transition-all"
            >
              <LogOut size={16} />
              יציאה מהחשבון
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-4 flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Trophy size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-yellow-800">התחרות השנתית</h3>
                <p className="text-xs text-yellow-700">הכיתה המובילה תזכה ביום כיף!</p>
              </div>
            </div>
            {leaderboard.map((u, idx) => {
              const isMe = u.id === user?.id;
              const rank = idx + 1;
              return (
                <div
                  key={u.id}
                  className={`flex items-center p-3 rounded-xl border ${isMe ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100" : "bg-white border-slate-100"}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg mr-3 ${
                    rank === 1 ? "bg-yellow-100 text-yellow-700" : rank === 2 ? "bg-slate-200 text-slate-600" : rank === 3 ? "bg-orange-100 text-orange-700" : "text-slate-400"
                  }`}>{rank}</div>
                  <div className={`w-10 h-10 ${u.avatarColor || "bg-slate-200"} rounded-full flex items-center justify-center text-sm mr-3`}>
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-bold ${isMe ? "text-blue-700" : "text-slate-800"}`}>
                      {u.name} {isMe ? "(אני)" : ""}
                    </h3>
                    <p className="text-xs text-slate-500">{u.volunteerHours} שעות התנדבות</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-slate-700">{u.points}</span>
                    <span className="text-[10px] text-slate-400">נק'</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
