import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardCheck, Bell, Factory, Calendar, Box, 
  ShieldAlert, Flame, Search, Map as MapIcon, Plus, Filter, 
  Clock, Settings, Printer, FileDown, X, Upload, AlertTriangle, 
  CheckCircle2, Menu, Navigation, ChevronRight 
} from 'lucide-react';

// =============================================================================
// 1. DỮ LIỆU SƠ ĐỒ (MOCK DATA)
// =============================================================================
const WORKSHOP_DATA = {
  'Xưởng Cũ': {
    layout: 'M 50 50 L 450 50 L 450 350 L 50 350 Z',
    zones: [
      { id: 'z1', name: 'Khu vực Máy tiện', x: 100, y: 100, w: 120, h: 80 },
      { id: 'z2', name: 'Kho vật tư', x: 300, y: 100, w: 100, h: 150 },
      { id: 'z3', name: 'Đóng gói', x: 100, y: 250, w: 150, h: 70 },
    ]
  },
  'Xưởng Mới': {
    layout: 'M 20 20 L 480 20 L 480 380 L 250 380 L 250 300 L 20 300 Z',
    zones: [
      { id: 'z1', name: 'Dây chuyền SMT', x: 50, y: 50, w: 300, h: 100 },
      { id: 'z2', name: 'Khu kiểm thử', x: 380, y: 50, w: 80, h: 200 },
      { id: 'z3', name: 'Logistics', x: 50, y: 180, w: 150, h: 100 },
    ]
  },
  'Xưởng Ruột': {
    layout: 'M 100 20 L 400 20 L 480 150 L 480 250 L 400 380 L 100 380 L 20 250 L 20 150 Z',
    zones: [
      { id: 'z1', name: 'Lõi điều hành', x: 150, y: 120, w: 200, h: 160 },
      { id: 'z2', name: 'Trạm cấp phôi', x: 50, y: 180, w: 80, h: 40 },
      { id: 'z3', name: 'Trạm ra hàng', x: 370, y: 180, w: 80, h: 40 },
    ]
  }
};

const MOCK_AUDITS = [
  { id: 1, title: 'Kiểm tra 5S Định kỳ', status: 'Hoàn thành', progress: 100, date: '20/03/2026' },
  { id: 2, title: 'Checklist MSDS Toàn xưởng', status: 'Đang chạy', progress: 45, date: '22/03/2026' },
];

// =============================================================================
// 2. MODAL THÊM HÓA CHẤT
// =============================================================================
const AddChemicalModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msdsFile, setMsdsFile] = useState(null);
  const [csdsFile, setCsdsFile] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  const [formData, setFormData] = useState({
    name: '', other_name: '', cas_number: '', workshop_id: '', 
    location_names: [], published_date: '', newest_published_date: '', hazard_logo: []
  });

  const GHS_LOGOS = [
    { id: 'flammable', label: 'Dễ cháy' }, { id: 'toxic', label: 'Độc hại' },
    { id: 'corrosive', label: 'Ăn mòn' }, { id: 'explosive', label: 'Nổ' },
    { id: 'oxidizing', label: 'Oxy hóa' }, { id: 'health_hazard', label: 'Nguy hại sức khỏe' },
    { id: 'environmental', label: 'Nguy hại MT' }
  ];

  useEffect(() => {
    if (isOpen) {
      const fetchWorkshops = async () => {
        setIsLoadingWorkshops(true);
        try {
          const res = await axios.get('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/workshops');
          const data = res.data.data || [];
          setWorkshops(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, workshop_id: data.id, location_names: [] }));
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách xưởng:", error);
        } finally {
          setIsLoadingWorkshops(false);
        }
      };
      fetchWorkshops();
    }
  }, [isOpen]);

  const handleWorkshopChange = (e) => {
    setFormData(prev => ({ ...prev, workshop_id: e.target.value, location_names: [] }));
  };

  const handleLocationToggle = (loc) => {
    setFormData(prev => ({
      ...prev, 
      location_names: prev.location_names.includes(loc)
        ? prev.location_names.filter(l => l !== loc)
        : [...prev.location_names, loc]
    }));
  };

  const handleCheckboxChange = (logoId) => {
    setFormData(prev => ({
      ...prev, 
      hazard_logo: prev.hazard_logo.includes(logoId)
        ? prev.hazard_logo.filter(id => id !== logoId)
        : [...prev.hazard_logo, logoId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!msdsFile || !csdsFile) { alert("Vui lòng đính kèm đủ file!"); return; }
    if (formData.location_names.length === 0) { alert("Vui lòng chọn ít nhất 1 phân khu!"); return; }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('cas_number', formData.cas_number);
      submitData.append('workshop_id', formData.workshop_id);
      submitData.append('published_date', formData.published_date);
      submitData.append('newest_published_date', formData.newest_published_date);
      if (formData.other_name) submitData.append('other_name', formData.other_name);
      
      submitData.append('hazard_logo_json', JSON.stringify(formData.hazard_logo));
      submitData.append('location_names_json', JSON.stringify(formData.location_names));
      submitData.append('msds_file', msdsFile);
      submitData.append('csds_file', csdsFile);

      await axios.post('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/add-chemical', submitData);
      alert("Thêm hóa chất thành công!");
      onSuccess(); 
      onClose();   
    } catch (error) {
      alert("Lỗi máy chủ!");
      console.error(error);
    } finally { setIsSubmitting(false); }
  };

  const currentWorkshop = workshops.find(ws => ws.id === formData.workshop_id);
  if (!isOpen) return null;

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên *</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" /></div>
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên khác</label><input type="text" value={formData.other_name} onChange={e => setFormData({...formData, other_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" /></div>
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">CAS *</label><input required type="text" value={formData.cas_number} onChange={e => setFormData({...formData, cas_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" /></div>
            </div>

            <div className="flex flex-col gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 uppercase mb-1">Xưởng *</label>
                <select required disabled={isLoadingWorkshops} value={formData.workshop_id} onChange={handleWorkshopChange} className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm font-bold text-indigo-900 outline-none">
                  {isLoadingWorkshops ? <option>Đang tải...</option> : workshops.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 uppercase mb-2">Phân khu *</label>
                <div className="flex flex-wrap gap-2">
                  {currentWorkshop?.locations?.length > 0 ? currentWorkshop.locations.map(loc => (
                    <label key={loc} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-xs font-bold ${formData.location_names.includes(loc) ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}>
                      <input type="checkbox" className="hidden" checked={formData.location_names.includes(loc)} onChange={() => handleLocationToggle(loc)} /> {loc}
                    </label>
                  )) : <span className="text-xs text-slate-500">Chưa có phân khu</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày bản đang treo *</label><input required type="date" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" /></div>
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày bản NSX *</label><input required type="date" value={formData.newest_published_date} onChange={e => setFormData({...formData, newest_published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" /></div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Logo GHS *</label>
              <div className="flex flex-wrap gap-2">
                {GHS_LOGOS.map(logo => (
                  <label key={logo.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-xs font-bold ${formData.hazard_logo.includes(logo.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600'}`}>
                    <input type="checkbox" className="hidden" checked={formData.hazard_logo.includes(logo.id)} onChange={() => handleCheckboxChange(logo.id)} /> {logo.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50">
                <input required type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setMsdsFile(e.target.files)}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className={`mx-auto mb-1 ${msdsFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className={`text-[11px] font-bold truncate ${msdsFile ? 'text-indigo-600' : 'text-slate-600'}`}>{msdsFile ? msdsFile.name : "Tải lên MSDS"}</p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50">
                <input required type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setCsdsFile(e.target.files)}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className={`mx-auto mb-1 ${csdsFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className={`text-[11px] font-bold truncate ${csdsFile ? 'text-indigo-600' : 'text-slate-600'}`}>{csdsFile ? csdsFile.name : "Tải lên CSDS"}</p>
              </div>
            </div>
          </form>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100">HỦY</button>
          <button form="add-chemical-form" type="submit" disabled={isSubmitting || isLoadingWorkshops} className="px-6 py-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
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

// =============================================================================
// 4. PAGE VIEWS
// =============================================================================
const DashboardView = ({ chemicals, onNavigate }) => {
  const today = new Date();
  const expiredCount = (chemicals || []).filter(chem => {
    if (!chem.msds_expiry) return false;
    const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  }).length;

  const expiringSoonCount = (chemicals || []).filter(chem => {
    if (!chem.msds_expiry) return false;
    const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full">
      <div onClick={() => onNavigate('chemicals')} className="bg-gradient-to-br from-red-500 to-orange-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-all group">
        <AlertTriangle size={160} className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0"><AlertTriangle size={28} /></div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-black mb-1 md:mb-2">Chú ý Hóa chất!</h2>
            <p className="text-orange-50 text-xs md:text-sm font-medium max-w-xl">
              Phát hiện <strong className="text-white text-lg bg-red-600/50 px-2 py-0.5 rounded-lg mx-1">{expiredCount}</strong> hóa chất đã hết hạn và <strong className="text-white text-lg bg-orange-500/50 px-2 py-0.5 rounded-lg mx-1">{expiringSoonCount}</strong> sắp đến hạn. Nhấn để kiểm tra.
            </p>
          </div>
          <button className="w-full md:w-auto bg-white text-orange-600 px-6 py-3 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 mt-2 md:mt-0">XEM DANH SÁCH <ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onNavigate('workshop')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><MapIcon className="text-indigo-600" size={20} /> Bản đồ số Xưởng</h3>
            <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Live</div>
          </div>
          <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
            <Navigation size={48} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-indigo-600 font-black text-sm">NHẤN ĐỂ MỞ SƠ ĐỒ</div>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><ClipboardCheck className="text-emerald-500" size={20} /> Audit</h3>
            <Plus size={18} className="text-slate-400" />
          </div>
          <div className="space-y-4 flex-1">
            {MOCK_AUDITS.map(audit => (
              <div key={audit.id} className="flex gap-3 items-start border-l-2 border-slate-100 pl-3 md:pl-4">
                <div className="flex-1"><p className="text-xs font-bold text-slate-900">{audit.title}</p><p className="text-[9px] text-slate-400 font-bold uppercase">{audit.status}</p></div>
                <p className="text-xs font-black text-slate-900">{audit.progress}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
            const { x, y } = group; 
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

// =============================================================================
// 5. MAIN APP
// =============================================================================
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Mặc định mở Tổng quan
  const [activeWorkshop, setActiveWorkshop] = useState('Xưởng Cũ'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    fetchChemicals();
  }, []);

  // ĐÃ FIX: Hàm renderView được điều hướng chính xác với biến realChemicals
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView chemicals={realChemicals} onNavigate={setActiveTab} />;
      case 'workshop':
        return <WorkshopView activeWorkshop={activeWorkshop} setActiveWorkshop={setActiveWorkshop} chemicals={realChemicals} />;
      case 'chemicals':
        return <ChemicalsView chemicals={realChemicals} isLoading={isLoading} onAddClick={() => setIsAddModalOpen(true)} />;
      case 'audit':
        return (
          <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
            <ClipboardCheck size={80} className="mx-auto text-slate-100 mb-4" />
            <h2 className="text-xl font-black text-slate-900">Module Audit & Kiểm tra</h2>
          </div>
        );
      case 'plans':
        return (
          <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
            <Calendar size={80} className="mx-auto text-slate-100 mb-4" />
            <h2 className="text-xl font-black text-slate-900">Module Kế hoạch</h2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden w-full relative">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <Header activeTab={activeTab} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth w-full custom-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto">
            {/* ĐÃ FIX: Gọi hàm hiển thị giao diện ra đây */}
            {renderView()}
          </div>
        </div>
      </main>
      <AddChemicalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchChemicals} />
    </div>
  );
};

export default App;