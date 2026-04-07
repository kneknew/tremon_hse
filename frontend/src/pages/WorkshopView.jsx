
import { MapIcon } from 'lucide-react';
import { WORKSHOP_DATA } from '../constants/index.js';

const WorkshopView = ({ activeWorkshop, setActiveWorkshop, chemicals }) => {
  const data = WORKSHOP_DATA[activeWorkshop];
  const chemicalsInWorkshop = (chemicals || []).filter(c => c.workshops?.name === activeWorkshop);
  const clusters = {};

  chemicalsInWorkshop.forEach(chem => {
    if (chem.x !== undefined && chem.y !== undefined) {
      const key = `${chem.x}_${chem.y}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(chem);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><MapIcon className="text-indigo-600" /> Sơ đồ xưởng trực quan</h2>
          <p className="text-slate-400 text-sm font-medium">Bản đồ mặt bằng và quản lý an toàn vị trí</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {Object.keys(WORKSHOP_DATA).map(tab => (
            <button key={tab} onClick={() => setActiveWorkshop(tab)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeWorkshop === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[600px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 flex items-center justify-center p-8">
        <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-2xl transition-all duration-500">
          <path d={data?.layout} fill="white" stroke="#cbd5e1" strokeWidth="4" />
          {data?.zones?.map(zone => (
            <g key={zone.id}>
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} fill="#f1f5f9" stroke="#e2e8f0" strokeDasharray="4" className="hover:fill-indigo-50 transition-colors" />
              <text x={zone.x + zone.w/2} y={zone.y + zone.h/2} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase pointer-events-none">{zone.name}</text>
            </g>
          ))}
          {Object.values(clusters).map((group, idx) => {
            // ĐÃ FIX: Destructuring an toàn từ phần tử đầu tiên trong mảng
            const { x, y } = group[0]; 
            const hasExpired = group.some(c => {
               if (!c.msds_expiry) return false;
               const diff = Math.ceil((new Date(c.msds_expiry) - new Date()) / (1000 * 60 * 60 * 24));
               return diff < 0;
            });

            if (group.length > 3) {
              return (
                <g key={`cluster-${idx}`} className="cursor-pointer hover:scale-110 transition-transform group/folder">
                  <rect x={x - 15} y={y - 12} width="30" height="24" rx="4" fill={hasExpired ? "#fef2f2" : "#eef2ff"} stroke={hasExpired ? "#ef4444" : "#4f46e5"} strokeWidth="2" />
                  <path d={`M ${x-15} ${y-6} L ${x+15} ${y-6}`} stroke={hasExpired ? "#ef4444" : "#4f46e5"} strokeWidth="2" />
                  <text x={x} y={y + 4} textAnchor="middle" className={`text-[10px] font-black ${hasExpired ? "fill-red-600" : "fill-indigo-600"}`}>{group.length}</text>
                  {hasExpired && <circle cx={x+15} cy={y-12} r="4" fill="#ef4444" className="animate-pulse" />}
                </g>
              );
            } 
            return group.map((chem, i) => {
              const diff = chem.msds_expiry ? Math.ceil((new Date(chem.msds_expiry) - new Date()) / (1000 * 60 * 60 * 24)) : 999;
              const isExpired = diff < 0;
              const offsetX = x + (i * 12) - ((group.length - 1) * 6); 
              return (
                <g key={chem.id} className="cursor-pointer hover:scale-110 transition-transform">
                  <circle cx={offsetX} cy={y} r="8" fill={isExpired ? "#ef4444" : "#4f46e5"} className="opacity-20" />
                  <circle cx={offsetX} cy={y} r="5" fill={isExpired ? "#ef4444" : "#4f46e5"} stroke="white" strokeWidth="2" />
                  {isExpired && <circle cx={offsetX} cy={y} r="8" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />}
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
};
export default WorkshopView;