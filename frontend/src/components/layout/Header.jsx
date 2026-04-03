import { Menu, Bell, CheckCircle2  } from "lucide-react";
const Header = ({ activeTab, onMenuClick }) => (
  <header className="h-20 bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><Menu size={24} /></button>
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 capitalize tracking-tight">{activeTab === 'chemicals' ? 'Hóa chất' : activeTab}</h1>
        <p className="hidden md:block text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Hệ thống quản lý thời gian thực</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-white rounded-xl relative cursor-pointer border border-slate-200 shadow-sm hover:bg-slate-50">
        <Bell size={20} className="text-slate-600" />
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </div>
      <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black text-slate-900 leading-none mb-1">Admin User</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Giám sát</p>
        </div>
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
      </div>
    </div>
  </header>
);
export default Header;