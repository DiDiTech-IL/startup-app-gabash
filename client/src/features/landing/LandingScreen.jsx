import { Users, CheckCircle, ArrowLeft } from "lucide-react";

const COLORS = { blue: "#2079C6", green: "#7AC143" };

export function LandingScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white relative overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[bounce_3s_infinite]"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[bounce_4s_infinite]"></div>
      <div className="absolute -bottom-8 left-20 w-48 h-48 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[pulse_5s_infinite]"></div>

      <div className="mb-8 relative z-10 animate-[bounce_3s_infinite] mt-8">
        <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-green-50 rounded-[2rem] flex items-center justify-center shadow-xl transform rotate-3 border border-white">
          <Users size={48} className="text-slate-700 drop-shadow-sm" />
        </div>
        <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-lg animate-pulse">
          <CheckCircle size={28} color={COLORS.green} fill="#ecfdf5" />
        </div>
      </div>

      <h1 className="text-6xl font-black mb-3 tracking-tighter text-slate-800 relative z-10 drop-shadow-sm">
        <span style={{ color: COLORS.blue }}>Help</span>
        <span style={{ color: COLORS.green }}>IN</span>
      </h1>

      <p className="text-slate-500 mb-12 text-lg font-medium max-w-xs leading-relaxed relative z-10">
        לומדים יחד. מתנדבים יחד.
        <br />
        <span className="text-sm text-slate-400 mt-3 block bg-white/50 py-1 px-3 rounded-full mx-auto w-fit backdrop-blur-sm border border-slate-100">
          ✨ הדרך שלך לבגרות חברתית
        </span>
      </p>

      <button
        onClick={() => onStart("dashboard")}
        className="relative z-10 w-full max-w-xs py-4 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden group"
        style={{ background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.green})` }}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <span>מתחילים</span>
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
