import { Flag, User } from "lucide-react";

export function IconButton({ onClick, icon: Icon, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors active:scale-95 shadow-sm ${className}`}
    >
      <Icon size={20} />
    </button>
  );
}

export function SafetyHeaderButton({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center border border-red-100 text-red-500 hover:bg-red-100 transition-colors active:scale-95 shadow-sm"
    >
      <Flag size={18} fill="currentColor" className="opacity-90" />
    </button>
  );
}

export function ProfileHeaderButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm"
    >
      <User size={20} />
    </button>
  );
}
