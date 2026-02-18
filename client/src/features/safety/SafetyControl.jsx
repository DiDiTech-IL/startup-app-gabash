import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { safetyApi } from "../../lib/api";
import { Shield, AlertTriangle, EyeOff, Ban, Siren, Check, X } from "lucide-react";

export function SafetyControl({ isOpen, onClose }) {
  const [reportSent, setReportSent] = useState(false);

  const reportMutation = useMutation({
    mutationFn: (type) => safetyApi.report({ type }),
    onSuccess: () => {
      onClose();
      setReportSent(true);
      setTimeout(() => setReportSent(false), 3000);
    },
  });

  if (!isOpen && !reportSent) return null;

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end animate-[fadeIn_0.2s]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
          <div className="bg-white rounded-t-[2.5rem] p-6 relative z-10 animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">מרכז הבטיחות</h3>
                <p className="text-sm text-slate-500">דיווח אנונימי ומאובטח</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => reportMutation.mutate("bullying")}
                disabled={reportMutation.isPending}
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all active:scale-95"
              >
                <AlertTriangle size={24} className="text-orange-500" />
                <span className="text-xs font-bold text-slate-700">בריונות/הטרדה</span>
              </button>
              <button
                onClick={() => reportMutation.mutate("unsafe")}
                disabled={reportMutation.isPending}
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all active:scale-95"
              >
                <EyeOff size={24} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700">תוכן לא הולם</span>
              </button>
              <button
                onClick={() => reportMutation.mutate("block")}
                disabled={reportMutation.isPending}
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all active:scale-95"
              >
                <Ban size={24} className="text-red-500" />
                <span className="text-xs font-bold text-slate-700">חסימת משתמש</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all">
                <Siren size={24} className="animate-pulse" />
                <span className="text-xs font-bold">מוקד 105</span>
              </button>
            </div>
            <button onClick={onClose} className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600">
              ביטול
            </button>
          </div>
        </div>
      )}

      {reportSent && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 bg-slate-800/95 backdrop-blur-md text-white p-6 rounded-3xl shadow-2xl z-[70] flex flex-col items-center text-center animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <Check size={32} strokeWidth={3} />
          </div>
          <h3 className="text-lg font-bold mb-1">הדיווח התקבל</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            תודה ששמרת על הקהילה שלנו בטוחה. צוות הבטיחות בודק את הפנייה כעת.
          </p>
        </div>
      )}
    </>
  );
}
