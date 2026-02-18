import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth.jsx";
import { rewardsApi } from "../../lib/api";
import { IconButton, SafetyHeaderButton, ProfileHeaderButton } from "../../components/Buttons.jsx";
import { ArrowLeft, Gift, Shield } from "lucide-react";

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
        <h3 className="font-bold text-slate-700 text-sm">הטבות זמינות</h3>
        {isLoading ? (
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
