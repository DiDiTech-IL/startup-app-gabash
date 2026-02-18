import { Signal, Wifi } from "lucide-react";

export function StatusBar({ isDarkText }) {
  const time = new Date().toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`absolute top-0 left-0 right-0 px-6 pt-4 pb-2 flex justify-between items-center text-xs font-semibold z-50 transition-colors duration-300 ${
        isDarkText ? "text-slate-900" : "text-white"
      }`}
    >
      <span>{time}</span>
      <div className="flex gap-1.5 items-center">
        <Signal size={14} />
        <Wifi size={14} />
        <div className="flex items-center opacity-90">
          <div className="w-[20px] h-[10px] rounded-[3px] border-[1px] border-current flex items-center p-[1px]">
            <div className="h-full w-[50%] bg-orange-500 rounded-[1px]"></div>
          </div>
          <div className="w-[1.5px] h-[4px] bg-current rounded-r-[1px] ml-[0.5px]"></div>
        </div>
      </div>
    </div>
  );
}
