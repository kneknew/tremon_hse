
import React from 'react';
import { Search, Filter, Plus, CheckCircle2, AlertTriangle, Clock, Box, Printer } from 'lucide-react';

const ChemicalsView = ({ chemicals, isLoading, onAddClick }) => {
  const sortedChemicals = [...(chemicals || [])].sort((a, b) => new Date(a.msds_expiry) - new Date(b.msds_expiry));
  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 whitespace-nowrap">Quản lý Kho Hóa chất</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Quản lý hồ sơ MSDS, CSDS và cảnh báo an toàn</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center bg-slate-50 px-3 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
            <Search size={14} className="text-slate-400" />
            <input type="text" placeholder="Tìm tên hóa chất..." className="bg-transparent border-none outline-none p-2 text-xs font-semibold w-full" />
          </div>
          <button className="bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50"><Filter size={16} className="text-slate-600" /></button>
          <button onClick={onAddClick} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 whitespace-nowrap"><Plus size={16} /> THÊM</button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Tên hóa chất</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Cảnh báo (GHS)</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Vị trí</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase">Hạn MSDS</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải dữ liệu...</td></tr> : 
               sortedChemicals.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Chưa có hóa chất nào.</td></tr> :
               sortedChemicals.map(chem => {
                  const today = new Date();
                  const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
                  let StatusIcon = CheckCircle2; let statusText = "Còn hạn"; let statusStyle = "bg-emerald-50 text-emerald-600 border-emerald-100"; let dateTextStyle = "text-emerald-400";
                  if (diffDays < 0) { StatusIcon = AlertTriangle; statusText = "Hết hạn"; statusStyle = "bg-red-50 text-red-600 border-red-100"; dateTextStyle = "text-red-400"; } 
                  else if (diffDays <= 30) { StatusIcon = Clock; statusText = "Sắp hết hạn"; statusStyle = "bg-amber-50 text-amber-600 border-amber-100"; dateTextStyle = "text-amber-500"; }
                  
                  return (
                    <tr key={chem.id} className="hover:bg-slate-50/50 transition-colors group/row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${diffDays < 0 ? 'bg-red-50 text-red-600' : diffDays <= 30 ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-600'}`}><Box size={16} /></div>
                          <div className="flex flex-col"><span className="text-sm font-black text-slate-900">{chem.name}</span><span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">CAS: {chem.cas_number}</span></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-row items-center gap-2 flex-wrap w-24">
                          {Array.isArray(chem.hazard_logo) && chem.hazard_logo.length > 0 ? chem.hazard_logo.map((logo_id, idx) => (
                            <img key={idx} src={`/assets/logos/${logo_id}.png`} alt={logo_id} className="object-contain drop-shadow-sm flex-shrink-0" style={{ width: '40px', height: '40px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          )) : <span className="text-[10px] text-slate-400 font-bold">Chưa có nhãn</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="px-2.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black uppercase shadow-sm">{chem.workshops?.name || 'N/A'}</span></td>
                      <td className="px-4 py-3">
                        <div className="relative group inline-flex items-center">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase border ${statusStyle}`}><StatusIcon size={14} />{statusText}</div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="flex flex-col gap-2 text-xs">
                              <div className="flex justify-between gap-6"><span className="text-slate-400 font-medium">Đang treo:</span><span className="font-bold">{chem.published_date}</span></div>
                              <div className="flex justify-between gap-6"><span className="text-slate-400 font-medium">Hạn MSDS:</span><span className={`font-bold ${dateTextStyle}`}>{chem.msds_expiry}</span></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex gap-1.5 hover:bg-black whitespace-nowrap"><Printer size={12} /> IN MSDS</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ChemicalsView;