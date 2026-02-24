import { Users, CheckCircle, ArrowLeft, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useState } from "react";

const COLORS = { blue: "#2079C6", green: "#7AC143" };

export function LandingScreen({ onStart, isStarting = false, authError = null }) {
  const [mode, setMode] = useState("signup"); // "signup" | "signin"

  // signup fields
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  // signin fields
  const [siName, setSiName] = useState("");
  const [siSchool, setSiSchool] = useState("");
  const [siPin, setSiPin] = useState("");

  const pinMismatch = pin.length === 4 && pinConfirm.length === 4 && pin !== pinConfirm;

  const canSignup =
    name.trim() && school.trim() && grade.trim() &&
    /^\d{4}$/.test(pin) && pin === pinConfirm && !isStarting;

  const canSignin =
    siName.trim() && siSchool.trim() && /^\d{4}$/.test(siPin) && !isStarting;

  const handleSubmit = () => {
    if (mode === "signup") {
      if (!canSignup) return;
      onStart({ mode: "signup", name: name.trim(), school: school.trim(), grade: grade.trim(), pin });
    } else {
      if (!canSignin) return;
      onStart({ mode: "signin", name: siName.trim(), school: siSchool.trim(), pin: siPin });
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white";

  return (
    <div className="flex flex-col items-center justify-start h-full pt-10 pb-4 px-6 text-center bg-white relative overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      {/* Background blobs */}
      <div className="absolute top-6 right-6 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-[bounce_3s_infinite]" />
      <div className="absolute top-6 left-6 w-24 h-24 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-[bounce_4s_infinite]" />

      {/* Logo */}
      <div className="mb-4 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-green-50 rounded-[1.5rem] flex items-center justify-center shadow-xl transform rotate-3 border border-white mx-auto">
          <Users size={36} className="text-slate-700" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg">
          <CheckCircle size={22} color={COLORS.green} fill="#ecfdf5" />
        </div>
      </div>

      <h1 className="text-5xl font-black mb-1 tracking-tighter text-slate-800 relative z-10">
        <span style={{ color: COLORS.blue }}>Help</span>
        <span style={{ color: COLORS.green }}>IN</span>
      </h1>
      <p className="text-slate-400 text-xs mb-5 relative z-10">לומדים יחד. מתנדבים יחד.</p>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-xs mb-4 relative z-10">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === "signup" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
          }`}
        >
          <UserPlus size={13} /> הרשמה
        </button>
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === "signin" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
          }`}
        >
          <LogIn size={13} /> כניסה
        </button>
      </div>

      {/* Error banner */}
      {authError && (
        <div className="w-full max-w-xs mb-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 relative z-10 text-right">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <div className="w-full max-w-xs space-y-2 relative z-10">
        {mode === "signup" ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" className={inputClass} />
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="בית ספר" className={inputClass} />
            <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="כיתה (למשל י&apos;א)" className={inputClass} />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="קוד PIN — 4 ספרות"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={inputClass}
            />
            <input
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="אימות קוד PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={`${inputClass} ${pinMismatch ? "border-red-300 ring-2 ring-red-100" : ""}`}
            />
            {pinMismatch && <p className="text-xs text-red-500 text-right">הקודים אינם תואמים</p>}
          </>
        ) : (
          <>
            <input value={siName} onChange={(e) => setSiName(e.target.value)} placeholder="שם מלא" className={inputClass} />
            <input value={siSchool} onChange={(e) => setSiSchool(e.target.value)} placeholder="בית ספר" className={inputClass} />
            <input
              value={siPin}
              onChange={(e) => setSiPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="קוד PIN — 4 ספרות"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={inputClass}
            />
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={mode === "signup" ? !canSignup : !canSignin}
        className={`relative z-10 w-full max-w-xs py-3.5 text-white rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden group mt-4 ${
          (mode === "signup" ? canSignup : canSignin)
            ? "shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:-translate-y-0.5"
            : "bg-slate-300 shadow-none cursor-not-allowed"
        }`}
        style={
          (mode === "signup" ? canSignup : canSignin)
            ? { background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.green})` }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        {isStarting ? (
          <span>{mode === "signin" ? "נכנסים..." : "נרשמים..."}</span>
        ) : mode === "signin" ? (
          <>
            <LogIn size={18} />
            <span>כניסה</span>
          </>
        ) : (
          <>
            <span>מתחילים</span>
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
}
