export function Notification({ onClick, show, data }) {
  if (!show || !data) return null;
  const { title, message, icon: Icon, color } = data;

  return (
    <div
      onClick={onClick}
      className="absolute top-12 left-3 right-3 bg-white/95 backdrop-blur-2xl rounded-[22px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-3.5 z-[50] cursor-pointer border border-white/40 flex items-center gap-3.5 select-none active:scale-95 transition-transform"
      style={{ animation: "iosSlideIn 0.6s cubic-bezier(0.2,0.8,0.2,1) forwards" }}
    >
      <div className={`w-[38px] h-[38px] ${color} rounded-[10px] flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon size={20} color="white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="font-semibold text-slate-900 text-[13px]">{title}</span>
          <span className="text-[10px] text-slate-400">עכשיו</span>
        </div>
        <p className="text-[13px] text-slate-700 leading-snug truncate">{message}</p>
      </div>
    </div>
  );
}
