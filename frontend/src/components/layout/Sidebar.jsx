import { LayoutDashboard, ClipboardCheck, Factory, Box, Calendar, X } from "lucide-react";
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'audit', label: 'Audit', icon: ClipboardCheck },
    { id: 'workshop', label: 'Sơ đồ xưởng', icon: Factory },
    { id: 'chemicals', label: 'Hóa chất', icon: Box },
    { id: 'plans', label: 'Kế hoạch', icon: Calendar },
  ];

  return (
    <>
      {isMobileOpen && <div className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={() => setIsMobileOpen(false)} />}
      <aside className={`bg-white border-r border-slate-200 flex-shrink-0 flex flex-col transition-all duration-300 z-50 fixed md:relative inset-y-0 left-0 h-full ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:translate-x-0 ${isOpen ? 'md:w-64' : 'md:w-16'} overflow-hidden`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}><Factory size={18} /></div>
            <span className={`font-black text-xl tracking-tight text-slate-900 whitespace-nowrap ${isOpen ? 'md:block' : 'md:hidden'} block`}>Factory<span className="text-indigo-600">Pro</span></span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }} className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 font-black' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}>
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap ${isOpen ? 'md:block' : 'md:hidden'} block`}>{item.label}</span>
              {activeTab === item.id && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );

};
export default Sidebar;