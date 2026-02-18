import { Mail, Calendar, Settings, Map, Users, CheckCircle, MessageSquare, Music, Gamepad2, Phone, Globe, Camera } from "lucide-react";

const COLORS = { green: "#7AC143" };

function AppIcon({ color, icon: Icon, label, onClick, isTarget }) {
  return (
    <div className="flex flex-col items-center gap-1.5" onClick={onClick}>
      <div
        className={`w-[58px] h-[58px] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-90 cursor-pointer ${color} ${
          isTarget ? "ring-2 ring-white/50 animate-[pulse_3s_infinite]" : ""
        }`}
      >
        <Icon size={26} />
      </div>
      <span className="text-[11px] text-white font-medium drop-shadow-md tracking-wide">{label}</span>
    </div>
  );
}

export function PhoneHomeScreen({ onLaunchApp, onOpenMessages }) {
  return (
    <div className="flex flex-col h-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="grid grid-cols-4 gap-y-6 gap-x-4 px-5 pt-16 z-10">
        <AppIcon color="bg-blue-500" icon={Mail} label="Mail" />
        <AppIcon color="bg-red-500" icon={Calendar} label="Calendar" />
        <AppIcon color="bg-gray-400" icon={Settings} label="Settings" />
        <AppIcon color="bg-green-500" icon={Map} label="Maps" />
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onLaunchApp}>
          <div className="w-[58px] h-[58px] bg-white rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden transition-all duration-200 group-active:scale-90 group-hover:shadow-2xl ring-2 ring-white/30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>
            <Users size={30} className="text-slate-700 relative z-10" />
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle size={10} color={COLORS.green} fill="#ecfdf5" />
            </div>
          </div>
          <span className="text-[11px] text-white font-bold drop-shadow-md tracking-wide">HelpIN</span>
        </div>
        <AppIcon color="bg-orange-500" icon={Music} label="Music" />
        <AppIcon color="bg-indigo-500" icon={Gamepad2} label="Games" />
      </div>
      <div className="mt-auto flex justify-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
      </div>
      <div className="mx-4 mb-4 bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-4 flex justify-between px-6 z-10 border border-white/10">
        <AppIcon color="bg-green-400" icon={Phone} label="" />
        <AppIcon color="bg-blue-400" icon={Globe} label="" />
        <div className="flex flex-col items-center gap-1.5" onClick={onOpenMessages}>
          <div className="w-[58px] h-[58px] rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg cursor-pointer active:scale-90">
            <MessageSquare size={26} />
          </div>
        </div>
        <AppIcon color="bg-gray-300" icon={Camera} label="" />
      </div>
    </div>
  );
}
