import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth.jsx";
import { rewardsApi } from "../../lib/api";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Gift, Shield, Star, Clock, Users, Trophy } from "lucide-react";

export function RewardsScreen({ onBack, onPurchase, onOpenProfile, onReport }) {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: rewardsApi.list,
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId) => rewardsApi.redeem({ rewardId }),
    onSuccess: (data) => {
      updateUser({ ...user, points: data.points });
      onPurchase(data.redemption.reward, data.redemption.code);
    },
  });

  const userPoints = user?.points ?? 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white px-4 pb-6 pt-14 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
          <IconButton onClick={() => onBack("dashboard")} icon={ArrowLeft} className="transform rotate-180" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">הטבות ופרסים</h2>
            <p className="text-xs text-slate-500">תגמול על ההתנדבות שלך</p>
          </div>
          <div className="flex gap-2">
            <SafetyHeaderButton onClick={onReport} />
            <ProfileHeaderButton onClick={onOpenProfile} />
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl text-white flex justify-between items-center shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">היתרה שלי</p>
            <h3 className="text-3xl font-black text-white flex items-baseline gap-1">
              {userPoints} <span className="text-sm font-normal text-slate-400">נק׳</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
            <Gift size={24} className="text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {userPoints === 0 ? (
          /* ── Zero-points onboarding infographic ── */
          <div className="flex flex-col items-center text-center pt-4 space-y-5 animate-[fadeIn_0.4s_ease-out]">
            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center border-4 border-yellow-200">
              <Trophy size={36} className="text-yellow-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-1">כיצד מרוויחים נקודות?</h3>
              <p className="text-slate-500 text-sm">תתחיל לעזור ומיד תתחיל לצבור!</p>
            </div>

            <div className="w-full space-y-3 text-right">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">כל שעת התנדבות</p>
                  <p className="text-xs text-slate-500">שיעור פרטי שנתת לחבר</p>
                </div>
                <div className="mr-auto flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  <span className="font-black text-blue-700">5 נק׳</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Users size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">דוגמה: 2 שעות לימוד</p>
                  <p className="text-xs text-slate-500">שניים מפגשים של שעה כל אחד</p>
                </div>
                <div className="mr-auto flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-green-200 shadow-sm">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  <span className="font-black text-green-700">10 נק׳</span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Gift size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">פרס ראשון</p>
                  <p className="text-xs text-slate-500">זמין כבר מ‑50 נקודות</p>
                </div>
                <div className="mr-auto flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-sm">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  <span className="font-black text-purple-700">50 נק׳</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 w-full text-white text-sm font-medium leading-relaxed">
              🔥 <span className="font-black">כל שעת התנדבות = 5 נקודות.</span>
              <br />
              תתחיל לעזור היום ותצבור מהר!
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center text-slate-400 animate-pulse py-6">טוען...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((item, idx) => {
              const canBuy = userPoints >= item.cost;
              const isLocked = idx > 0 && !canBuy; // first item is always buyable if enough pts
              return (
                <div
                  key={item.id}
                  className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden ${!canBuy ? "opacity-60 grayscale-[0.5]" : ""}`}
                >
                  {isLocked && (
                    <div className="absolute top-2 left-2 bg-slate-100 p-1 rounded-full text-slate-400">
                      <Shield size={12} fill="currentColor" />
                    </div>
                  )}
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h4>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.cost} נק׳</span>
                  </div>
                  <button
                    onClick={() => canBuy && redeemMutation.mutate(item.id)}
                    disabled={!canBuy || redeemMutation.isPending}
                    className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      canBuy ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {!canBuy ? "חסר נק׳" : "לרכישה"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
