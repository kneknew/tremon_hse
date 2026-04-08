import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, CheckCircle2, AlertTriangle, Clock, Box, Printer, Edit2, FileText, Trash2 } from 'lucide-react';
import AddChemicalModal from '../components/modals/AddChemicalModal';

const ChemicalsView = ({ chemicals, isLoading, onAddClick, onSuccess }) => {
  const [editingChemical, setEditingChemical] = useState(null);
  const [printMenuId, setPrintMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setPrintMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const sortedChemicals = [...(chemicals || [])].sort((a, b) => 
    new Date(a.msds_expiry) - new Date(b.msds_expiry)
  );

  const formatSafeDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001') || dateStr.startsWith('0004')) return 'Chưa cập nhật';
    return dateStr;
  };

  const handleOpenPrint = (path) => {
    if (!path) {
      alert("Hóa chất này chưa có tệp tài liệu PDF đính kèm!");
      return;
    }
    const SUPABASE_PROJECT_URL = 'https://zttiuatjkjfsmpbfibpc.supabase.co';
    const cleanPath = path.replace(/^\//, "");
    const publicUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/chemical-docs/${cleanPath}`;
    window.open(publicUrl, '_blank');
  };

  // CHỨC NĂNG MỚI: XỬ LÝ XÓA
  const handleDelete = async (chemical) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hóa chất: ${chemical.name}?`)) {
      try {
        await axios.delete(`https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/delete-chemical/${chemical.id}`);
        alert("Xóa hóa chất thành công!");
        if (onSuccess) onSuccess();
      } catch (error) {
        alert("Lỗi khi xóa hóa chất: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 w-full relative">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 whitespace-nowrap">Quản lý Kho Hóa chất</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Quản lý hồ sơ MSDS, CSDS và cảnh báo an toàn</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 flex-1 min-w-[220px]">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Tìm tên hóa chất..." className="bg-transparent border-none outline-none p-2 text-sm font-semibold w-full" />
          </div>
          <button className="bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
           <Filter size={16} className="text-slate-600" />
          </button>
          <button onClick={onAddClick} className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={16} /> THÊM MỚI
          </button>
        </div>
      </div>
      
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
              {!isLoading && sortedChemicals.map(chem => {
                const today = new Date();
                const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
                
                let StatusIcon = CheckCircle2;
                let statusText = "Còn hạn"; 
                let statusStyle = "bg-emerald-50 text-emerald-700 border-emerald-100"; 
                let dateTextStyle = "text-emerald-700";

                if (diffDays < 0) { 
                  StatusIcon = AlertTriangle;
                  statusText = "Hết hạn"; statusStyle = "bg-red-50 text-red-700 border-red-100"; dateTextStyle = "text-red-700";
                } else if (diffDays <= 30) { 
                  StatusIcon = Clock;
                  statusText = "Sắp hết hạn"; statusStyle = "bg-amber-50 text-amber-700 border-amber-100"; dateTextStyle = "text-amber-700";
                }
                
                const locations = Array.isArray(chem.location_name) ? chem.location_name : [];

                return (
                  <tr key={chem.id} className="hover:bg-slate-50/50 transition-colors group/row relative hover:z-[70]">
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

                    <td className="px-5 py-4">
                      <div className="flex flex-row items-center gap-2 flex-wrap w-28">
                        {Array.isArray(chem.hazard_logo) && chem.hazard_logo.map((logo_id, idx) => (
                          <img key={idx} src={`/assets/logos/${logo_id}.png`} alt={logo_id} className="object-contain drop-shadow-sm flex-shrink-0" style={{ width: '42px', height: '42px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ))}
                      </div>
                    </td>
                    
                    <td className="px-5 py-4">
                      <div className="relative group inline-flex items-center">
                        <span className="cursor-help px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[11px] font-black uppercase shadow-sm flex items-center gap-1.5 hover:bg-indigo-100 transition-colors">
                          {chem.workshops?.name || 'N/A'}
                          {locations.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                        </span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white text-slate-900 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-slate-100 w-max max-w-[250px] flex flex-col items-center justify-center">
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex flex-wrap gap-1.5 justify-center items-center">
                              {locations.length > 0 ? (
                                locations.map((loc, idx) => (
                                  <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap">
                                    {loc}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-medium w-full text-center">N/A</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-5 py-4">
                      <div className="relative group inline-flex items-center">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase border ${statusStyle}`}>
                          <StatusIcon size={16} />{statusText}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white text-slate-900 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] border border-slate-100 min-w-[150px]">
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                          <div className="flex flex-col gap-2 text-xs">
                            <div className="flex justify-between gap-6 whitespace-nowrap"><span className="text-slate-500 font-medium">Ngày treo:</span><span className="font-bold text-slate-900">{formatSafeDate(chem.published_date)}</span></div>
                            <div className="flex justify-between gap-6 whitespace-nowrap"><span className="text-slate-500 font-medium">Hạn MSDS:</span><span className={`font-bold ${dateTextStyle}`}>{formatSafeDate(chem.msds_expiry)}</span></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditingChemical(chem)} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-black flex items-center gap-2 hover:bg-blue-100 transition-colors">
                          <Edit2 size={14} /> SỬA
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPrintMenuId(printMenuId === chem.id ? null : chem.id); }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-sm"
                          >
                            <Printer size={14} /> IN
                          </button>

                          {printMenuId === chem.id && (
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-white rounded-xl shadow-2xl border border-slate-100 p-1.5 z-[110] min-w-[130px] animate-in slide-in-from-right-1 duration-200">
                              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-white"></div>
                              <button onClick={() => handleOpenPrint(chem.msds_path)} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border-b border-slate-50">
                                <FileText size={14} className="text-indigo-500" /> IN MSDS
                              </button>
                              <button onClick={() => handleOpenPrint(chem.csds_path)} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                                <FileText size={14} className="text-indigo-500" /> IN CSDS
                              </button>
                            </div>
                          )}
                        </div>

                        {/* NÚT XÓA NẰM CẠNH NÚT IN */}
                        <button 
                          onClick={() => handleDelete(chem)}
                          className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                          title="Xóa hóa chất"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingChemical && (
        <AddChemicalModal isOpen={!!editingChemical} onClose={() => setEditingChemical(null)} onSuccess={() => { setEditingChemical(null); if (onSuccess) onSuccess(); }} initialData={editingChemical} />
      )}
    </div>
  );
};

export default ChemicalsView;