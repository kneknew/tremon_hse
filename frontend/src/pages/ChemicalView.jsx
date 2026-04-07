import React, { useState } from 'react';
import { Search, Filter, Plus, CheckCircle2, AlertTriangle, Clock, Box, Printer, Edit2 } from 'lucide-react';
import AddChemicalModal from '../components/modals/AddChemicalModal';

const ChemicalsView = ({ chemicals, isLoading, onAddClick, onSuccess }) => {
  const [editingChemical, setEditingChemical] = useState(null);

  // Sắp xếp hóa chất theo hạn MSDS [cite: 206]
  const sortedChemicals = [...(chemicals || [])].sort((a, b) => 
    new Date(a.msds_expiry) - new Date(b.msds_expiry)
  );

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 w-full relative">
      {/* HEADER [cite: 207, 208, 209] */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 whitespace-nowrap">Quản lý Kho Hóa chất</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Quản lý hồ sơ MSDS, CSDS và cảnh báo an toàn</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center bg-slate-50 px-3 rounded-xl border border-slate-200 flex-1 min-w-[220px]">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Tìm tên hóa chất..." className="bg-transparent border-none outline-none p-2 text-sm font-semibold w-full" />
          </div>
          <button onClick={onAddClick} className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 whitespace-nowrap transition-all active:scale-95">
            <Plus size={16} /> THÊM MỚI
          </button>
        </div>
      </div>
      
      {/* BẢNG DỮ LIỆU: Quan trọng nhất là overflow-visible */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto custom-scrollbar overflow-visible">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Tên hóa chất</th>
                <th className="px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Cảnh báo (GHS)</th>
                <th className="px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Vị trí</th>
                <th className="px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">Hạn MSDS</th>
                <th className="px-5 py-3.5 text-[11px] font-black text-slate-500 uppercase text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải dữ liệu...</td></tr>
              ) : (
                sortedChemicals.map(chem => {
                  const today = new Date();
                  const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
                  
                  let StatusIcon = CheckCircle2; 
                  let statusText = "Còn hạn"; 
                  let statusStyle = "bg-emerald-50 text-emerald-700 border-emerald-100"; 
                  let dateTextStyle = "text-emerald-700";

                  if (diffDays < 0) { 
                    StatusIcon = AlertTriangle; statusText = "Hết hạn"; statusStyle = "bg-red-50 text-red-700 border-red-100"; dateTextStyle = "text-red-700"; 
                  } else if (diffDays <= 30) { 
                    StatusIcon = Clock; statusText = "Sắp hết hạn"; statusStyle = "bg-amber-50 text-amber-700 border-amber-100"; dateTextStyle = "text-amber-700"; 
                  }
                  
                  const locations = Array.isArray(chem.location_name) ? chem.location_name : [];

                  return (
                    /* hover:z-[70] đảm bảo Tooltip không bị hàng dưới hay header che */
                    <tr key={chem.id} className="hover:bg-slate-50/50 transition-colors group/row relative hover:z-[70]">
                      {/* Tên hóa chất */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${diffDays < 0 ? 'bg-red-50 text-red-600' : diffDays <= 30 ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Box size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-black text-slate-900 leading-tight">{chem.name}</span>
                            <span className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">CAS: {chem.cas_number}</span>
                          </div>
                        </div>
                      </td>

                      {/* GHS Logos */}
                      <td className="px-5 py-4">
                        <div className="flex flex-row items-center gap-2 flex-wrap w-28">
                          {Array.isArray(chem.hazard_logo) && chem.hazard_logo.length > 0 ? (
                            chem.hazard_logo.map((logo_id, idx) => (
                              <img key={idx} src={`/assets/logos/${logo_id}.png`} alt={logo_id} className="object-contain drop-shadow-sm flex-shrink-0" style={{ width: '42px', height: '42px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 font-bold">N/A</span>
                          )}
                        </div>
                      </td>
                      
                      {/* Tooltip Vị trí (Hiện ở trên, nền trắng) */}
                      <td className="px-5 py-4">
                        <div className="relative group/tooltip inline-block">
                          <span className="cursor-help px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[11px] font-black uppercase shadow-sm flex items-center gap-1.5 hover:bg-indigo-100 transition-colors">
                            {chem.workshops?.name || 'N/A'}
                            {locations.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            )}
                          </span>

                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-900 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-[100] w-max max-w-[200px] border border-slate-100">
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                            {/* <p className="text-[10px] font-black uppercase text-slate-500 mb-1.5 border-b border-slate-100 pb-1">Phân khu lưu trữ:</p> */}
                            <div className="flex flex-wrap gap-1.5">
                              {locations.length > 0 ? locations.map((loc, idx) => (
                                <span key={idx} className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[13px] font-bold text-indigo-700 whitespace-nowrap">{loc}</span>
                              )) : <span className="text-xs text-slate-400 font-medium italic">Không có dữ liệu</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Tooltip Hạn MSDS (Hiện ở trên, nền trắng) */}
                      <td className="px-5 py-4">
                        <div className="relative group inline-flex items-center">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase border ${statusStyle}`}>
                            <StatusIcon size={16} />{statusText}
                          </div>
                          
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-900 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-slate-100 min-w-[150px]">
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex justify-between gap-5 whitespace-nowrap">
                                <span className="text-slate-500 font-medium">Ngày treo:</span>
                                <span className="font-bold text-slate-900">{chem.published_date}</span>
                              </div>
                              <div className="flex justify-between gap-5 whitespace-nowrap">
                                <span className="text-slate-500 font-medium">Hạn MSDS:</span>
                                <span className={`font-bold ${dateTextStyle}`}>{chem.msds_expiry}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Thao tác */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingChemical(chem)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-black flex items-center gap-2 hover:bg-blue-100 whitespace-nowrap transition-colors"
                          >
                            <Edit2 size={14} /> SỬA
                          </button>
                          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black flex items-center gap-2 hover:bg-black whitespace-nowrap transition-all active:scale-95 shadow-sm">
                            <Printer size={14} /> IN
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingChemical && (
        <AddChemicalModal 
          isOpen={!!editingChemical} 
          onClose={() => setEditingChemical(null)}
          onSuccess={() => {
            setEditingChemical(null);
            if (onSuccess) onSuccess();
          }}
          initialData={editingChemical} 
        />
      )}
    </div>
  );
};

export default ChemicalsView;