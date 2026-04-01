import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardCheck, Bell, Factory, Calendar, 
  AlertTriangle, Box, ShieldAlert, Flame, Search, Map as MapIcon, 
  Navigation, Plus, Filter, MoreVertical, CheckCircle2, Clock, 
  Settings, Printer, FileDown, X, Upload 
} from 'lucide-react';

// =============================================================================
// =============================================================================
// 1. MOCK DATA
// =============================================================================
const WORKSHOP_DATA = {
  'Xưởng Cũ': {
    layout: 'M 50 50 L 450 50 L 450 350 L 50 350 Z',
    zones: [
      { id: 'z1', name: 'Khu vực Máy tiện', x: 100, y: 100, w: 120, h: 80 },
      { id: 'z2', name: 'Kho vật tư', x: 300, y: 100, w: 100, h: 150 },
    ],
    markers: { msds: [{ x: 110, y: 110 }], pccc: [{ x: 50, y: 200 }], emergency: [{ x: 60, y: 60 }] }
  }
};

// =============================================================================
// 2. MODAL THÊM HÓA CHẤT
// =============================================================================
const AddChemicalModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msdsFile, setMsdsFile] = useState(null);
  const [csdsFile, setCsdsFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', other_name: '', cas_number: '',
    workshop_id: 'e4843734-f2bb-4295-a849-a64bc8b6c2da', 
    published_date: '', newest_published_date: '', x: '', y: '', hazard_logo: []
  });

  const GHS_LOGOS = [
    { id: 'flammable', label: 'Dễ cháy' }, { id: 'toxic', label: 'Độc hại' },
    { id: 'corrosive', label: 'Ăn mòn' }, { id: 'explosive', label: 'Nổ' },
    { id: 'oxidizing', label: 'Oxy hóa' }, { id: 'health_hazard', label: 'Nguy hại sức khỏe' },
    { id: 'environmental', label: 'Nguy hại MT' }
  ];

  if (!isOpen) return null;

  const handleCheckboxChange = (logoId) => {
    setFormData(prev => ({
      ...prev, hazard_logo: prev.hazard_logo.includes(logoId)
        ? prev.hazard_logo.filter(id => id !== logoId)
        : [...prev.hazard_logo, logoId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!msdsFile || !csdsFile) { alert("Vui lòng đính kèm đủ file!"); return; }
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('cas_number', formData.cas_number);
      submitData.append('workshop_id', formData.workshop_id);
      submitData.append('published_date', formData.published_date);
      submitData.append('newest_published_date', formData.newest_published_date);
      submitData.append('x', parseFloat(formData.x) || 0);
      submitData.append('y', parseFloat(formData.y) || 0);
      if (formData.other_name) submitData.append('other_name', formData.other_name);
      submitData.append('hazard_logo_json', JSON.stringify(formData.hazard_logo));
      submitData.append('msds_file', msdsFile);
      submitData.append('csds_file', csdsFile);

      await axios.post('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/add-chemical', submitData);
      alert("Thêm hóa chất thành công!");
      onSuccess(); onClose();   
    } catch (error) {
      alert("Lỗi máy chủ!");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
            <Box className="text-indigo-600" /> Thêm Hóa Chất Mới
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="add-chemical-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên hóa chất *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Số CAS *</label>
                  <input required type="text" value={formData.cas_number} onChange={e => setFormData({...formData, cas_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tọa độ X</label>
                    <input required type="number" step="0.1" value={formData.x} onChange={e => setFormData({...formData, x: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tọa độ Y</label>
                    <input required type="number" step="0.1" value={formData.y} onChange={e => setFormData({...formData, y: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày in bản đang treo *</label>
                  <input required type="date" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày in bản mới nhất *</label>
                  <input required type="date" value={formData.newest_published_date} onChange={e => setFormData({...formData, newest_published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Logo Cảnh báo GHS</label>
              <div className="flex flex-wrap gap-2">
                {GHS_LOGOS.map(logo => (
                  <label key={logo.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-xs font-bold transition-colors ${formData.hazard_logo.includes(logo.id) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <input type="checkbox" className="hidden" checked={formData.hazard_logo.includes(logo.id)} onChange={() => handleCheckboxChange(logo.id)} />
                    {logo.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50">
                <input required type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setMsdsFile(e.target.files)}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                <p className="text-[11px] font-bold text-slate-600 truncate">{msdsFile ? msdsFile.name : "Upload MSDS (PDF)"}</p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50">
                <input required type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setCsdsFile(e.target.files)}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                <p className="text-[11px] font-bold text-slate-600 truncate">{csdsFile ? csdsFile.name : "Upload CSDS (PDF)"}</p>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100">HỦY</button>
          <button form="add-chemical-form" type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md">
            {isSubmitting ? 'ĐANG LƯU...' : 'LƯU HÓA CHẤT'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 3. UI COMPONENTS CHUNG 
// =============================================================================
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'audit', label: 'Audit / Kiểm tra', icon: ClipboardCheck },
    { id: 'workshop', label: 'Sơ đồ xưởng', icon: Factory },
    { id: 'chemicals', label: 'Hóa chất', icon: Box },
    { id: 'plans', label: 'Kế hoạch', icon: Calendar },
  ];

  return (
    <aside className={`bg-white border-r border-slate-200 flex-shrink-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} hidden md:flex overflow-hidden`}>
      <div className="p-4 flex items-center gap-3 border-b border-slate-50">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-indigo-700 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <Factory size={18} />
        </div>
        {isOpen && <span className="font-black text-xl tracking-tight text-slate-900 whitespace-nowrap">Factory<span className="text-indigo-600">Pro</span></span>}
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold whitespace-nowrap ${
              activeTab === item.id 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="bg-slate-900 rounded-xl p-3 text-white shadow-lg relative overflow-hidden group">
            <Settings size={30} className="absolute -right-2 -top-2 opacity-10 group-hover:rotate-12 transition-transform" />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Version</p>
            <p className="text-xs font-black whitespace-nowrap">Safe-Core 3.0</p>
          </div>
        </div>
      )}
    </aside>
  );
};

const Header = ({ activeTab }) => (
  <header className="h-16 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
    <div className="flex flex-col min-w-max whitespace-nowrap">
      <h1 className="text-lg font-black text-slate-900 capitalize tracking-tight">
        {activeTab === 'chemicals' ? 'Danh mục Hóa chất' : activeTab}
      </h1>
    </div>
    
    <div className="flex items-center gap-3 md:gap-6">
      <div className="hidden lg:flex items-center bg-slate-50 px-3 py-2 rounded-lg w-64 xl:w-80 border border-slate-200">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <input type="text" placeholder="Tìm nhanh thiết bị..." className="bg-transparent border-none outline-none ml-2 w-full text-xs font-medium text-slate-700" />
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 bg-white rounded-lg relative border border-slate-200 shadow-sm hover:bg-slate-50">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="text-right hidden sm:block whitespace-nowrap">
            <p className="text-xs font-black text-slate-900 leading-none mb-0.5">Admin User</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Giám sát An toàn</p>
          </div>
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-black shadow-inner border border-slate-200 overflow-hidden flex-shrink-0">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </header>
);

// =============================================================================
// 4. DANH SÁCH HÓA CHẤT
// =============================================================================
const ChemicalsView = ({ chemicals, isLoading, onAddClick }) => (
  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
      <div className="flex-shrink-0">
        <h2 className="text-lg font-black text-slate-900 whitespace-nowrap">Quản lý Kho Hóa chất</h2>
        <p className="text-slate-500 text-xs font-medium mt-1 whitespace-nowrap">Quản lý hồ sơ MSDS, CSDS và thông tin cảnh báo an toàn</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
        <div className="flex items-center bg-slate-50 px-3 rounded-xl border border-slate-200 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Tìm tên hóa chất..." className="bg-transparent border-none outline-none p-2 text-xs font-semibold w-full" />
        </div>
        <button className="bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 flex-shrink-0">
          <Filter size={16} className="text-slate-600" />
        </button>
        <button onClick={onAddClick} className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-indigo-700 transition-all whitespace-nowrap flex-shrink-0">
          <Plus size={16} /> THÊM
        </button>
      </div>
    </div>
    
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Tên hóa chất</th>
              <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Cảnh báo (GHS)</th>
              <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Bản in đang treo</th>
              <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Hạn MSDS (3 năm)</th>
              <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải dữ liệu từ kho...</td></tr>
            ) : chemicals.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Chưa có hóa chất nào trong kho.</td></tr>
            ) : (
              chemicals.map(chem => {
                const isExpired = new Date(chem.msds_expiry) < new Date();
                return (
                  <tr key={chem.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Box size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 whitespace-nowrap">{chem.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 whitespace-nowrap">CAS: {chem.cas_number}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex flex-row items-center gap-1 flex-wrap w-15">
                        {Array.isArray(chem.hazard_logo) && chem.hazard_logo.length > 0 ? (
                          chem.hazard_logo.map((logo_id, idx) => (
                            <img 
                              key={idx} 
                              src={`/assets/logos/${logo_id}.png`} 
                              alt={logo_id} title={logo_id} 
                              className="object-contain drop-shadow-sm" 
                              style={{ width: '20px', height: '20px' }}
                              onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">Chưa có nhãn</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap" >
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-bold">{chem.published_date}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`flex items-center gap-1.5 ${isExpired ? "text-red-600" : "text-emerald-600"}`}>
                        <ShieldAlert size={14} />
                        <span className="text-xs font-black">{chem.msds_expiry}</span>
                      </div>
                    </td>

                    {/* ĐÃ FIX: Thêm cả IN MSDS và IN CSDS, xếp nằm ngang cạnh nhau */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-black transition-all shadow-sm whitespace-nowrap">
                          <Printer size={12} /> IN MSDS
                        </button>
                        <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                          <FileDown size={12} /> IN CSDS
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
  </div>
);

// =============================================================================
// 5. MAIN APP
// =============================================================================
const App = () => { 
  const [activeTab, setActiveTab] = useState('chemicals'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [realChemicals, setRealChemicals] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const fetchChemicals = async () => { 
    setIsLoading(true); 
    try { 
      const response = await axios.get('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/chemicals'); 
      setRealChemicals(response.data.data || []); 
    } catch (error) { 
      console.error("Lỗi tải dữ liệu:", error); 
    } finally { 
      setIsLoading(false); 
    } 
  };

  useEffect(() => { fetchChemicals(); }, []);

  return ( 
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden"> 
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> 
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden"> 
        <Header activeTab={activeTab} />
        
        {/* 1. XÓA BỎ class p-10 hoặc p-12 (viền quá to), đổi thành p-4 hoặc p-2 cho mỏng lại */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth"> 
          
          {/* 2. XÓA BỎ class "max-w-7xl mx-auto" hoặc "max-w-[1500px] mx-auto", thay bằng "w-full" */}
          <div className="w-full"> 
            
            {activeTab === 'chemicals' ? (
              <ChemicalsView chemicals={realChemicals} isLoading={isLoading} onAddClick={() => setIsAddModalOpen(true)} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Factory size={48} className="mb-4 opacity-20" />
                <h2 className="text-lg font-bold text-slate-500">Khu vực đang phát triển</h2>
              </div>
            )}
            
          </div> 
        </div> 
      </main>

      <AddChemicalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchChemicals} />
    </div>
  ); 
};

export default App;