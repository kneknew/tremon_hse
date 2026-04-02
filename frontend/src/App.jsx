import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardCheck, Bell, Factory, Calendar, 
  Box, ShieldAlert, Flame, Search, Map as MapIcon, 
  Plus, Filter, Clock, Settings, Printer, FileDown, X, Upload,
  AlertTriangle, CheckCircle2, Menu
} from 'lucide-react';

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


// MODAL THÊM HÓA CHẤT (Đã lấy Xưởng và Phân khu tự động từ DB)
// =============================================================================
// MODAL THÊM HÓA CHẤT (Đã nâng cấp chọn nhiều phân khu)
// =============================================================================
const AddChemicalModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msdsFile, setMsdsFile] = useState(null);
  const [csdsFile, setCsdsFile] = useState(null);
  
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  const [formData, setFormData] = useState({
    name: '', other_name: '', cas_number: '',
    workshop_id: '', 
    location_names: [], // ĐÃ ĐỔI: Chuyển thành mảng để lưu nhiều phân khu
    published_date: '', newest_published_date: '', hazard_logo: []
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
            setFormData(prev => ({
              ...prev,
              workshop_id: data[0].id,
              location_names: [] // Mặc định chưa chọn phân khu nào
            }));
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

  const handleFileChange = (e, setter) => {
    const file = e.target.files; 
    if (file) setter(file);
  };

  const handleWorkshopChange = (e) => {
    setFormData(prev => ({
      ...prev,
      workshop_id: e.target.value,
      location_names: [] // ĐÃ FIX: Khi đổi xưởng, phải reset mảng phân khu về rỗng
    }));
  };

  // Hàm xử lý Tick chọn Phân khu
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
      ...prev, hazard_logo: prev.hazard_logo.includes(logoId)
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
      
      // Chuyển mảng phân khu và logo thành chuỗi JSON để gửi lên Python
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
            
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên hóa chất *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên gọi khác</label>
                <input type="text" placeholder="Không bắt buộc" value={formData.other_name} onChange={e => setFormData({...formData, other_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Số CAS *</label>
                <input required type="text" value={formData.cas_number} onChange={e => setFormData({...formData, cas_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
              </div>
            </div>

            {/* Vị trí Xưởng & Phân khu */}
            <div className="flex flex-col gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 uppercase mb-1">Chọn Xưởng *</label>
                <select required disabled={isLoadingWorkshops} value={formData.workshop_id} onChange={handleWorkshopChange} className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-sm font-bold text-indigo-900 outline-none focus:border-indigo-500 cursor-pointer shadow-sm disabled:opacity-50">
                  {isLoadingWorkshops ? <option>Đang tải dữ liệu...</option> : workshops.map(ws => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </div>
              
              {/* ĐÃ FIX: Biến Dropdown thành các nút Checkbox Phân khu */}
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 uppercase mb-2">Chọn Phân khu (Có thể chọn nhiều) *</label>
                <div className="flex flex-wrap gap-2">
                  {currentWorkshop?.locations?.length > 0 ? (
                    currentWorkshop.locations.map(loc => (
                      <label key={loc} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-xs font-bold transition-colors ${formData.location_names.includes(loc) ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <input type="checkbox" className="hidden" checked={formData.location_names.includes(loc)} onChange={() => handleLocationToggle(loc)} />
                        {loc}
                      </label>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Chưa có phân khu nào trong xưởng này</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ngày tháng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày in bản đang treo *</label>
                <input required type="date" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày in bản mới nhất *</label>
                <input required type="date" value={formData.newest_published_date} onChange={e => setFormData({...formData, newest_published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
              </div>
            </div>

            {/* Logo cảnh báo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Tick chọn Logo Cảnh báo GHS *</label>
              <div className="flex flex-wrap gap-2">
                {GHS_LOGOS.map(logo => (
                  <label key={logo.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border text-xs font-bold transition-colors ${formData.hazard_logo.includes(logo.id) ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <input type="checkbox" className="hidden" checked={formData.hazard_logo.includes(logo.id)} onChange={() => handleCheckboxChange(logo.id)} />
                    {logo.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Upload Files */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50 transition-colors">
                <input required type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setMsdsFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className={`mx-auto mb-1 ${msdsFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className={`text-[11px] font-bold truncate ${msdsFile ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {msdsFile ? msdsFile.name : "Tải lên MSDS (PDF)"}
                </p>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50 transition-colors">
                <input required type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setCsdsFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className={`mx-auto mb-1 ${csdsFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className={`text-[11px] font-bold truncate ${csdsFile ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {csdsFile ? csdsFile.name : "Tải lên CSDS (PDF)"}
                </p>
              </div>
            </div>

          </form>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors">HỦY</button>
          <button form="add-chemical-form" type="submit" disabled={isSubmitting || isLoadingWorkshops} className="px-6 py-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-colors">
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
    { id: 'audit', label: 'Audit / Kiểm tra', icon: ClipboardCheck },
    { id: 'workshop', label: 'Sơ đồ xưởng', icon: Factory },
    { id: 'chemicals', label: 'Hóa chất', icon: Box },
    { id: 'plans', label: 'Kế hoạch', icon: Calendar },
  ];

  return (
    <>
      {/* Lớp nền tối mờ trên điện thoại, bấm vào để đóng menu */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Cấu trúc Sidebar */}
      <aside className={`
        bg-white border-r border-slate-200 flex-shrink-0 flex flex-col transition-all duration-300 z-50
        fixed md:relative inset-y-0 left-0 h-full
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        md:translate-x-0 ${isOpen ? 'md:w-64' : 'md:w-16'}
        overflow-hidden
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-indigo-700 transition-colors" onClick={() => setIsOpen(!isOpen)}>
              <Factory size={18} />
            </div>
            <span className={`font-black text-xl tracking-tight text-slate-900 whitespace-nowrap ${isOpen ? 'md:block' : 'md:hidden'} block`}>
              Factory<span className="text-indigo-600">Pro</span>
            </span>
          </div>
          {/* Nút X để đóng menu trên Mobile */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false); // Tự động đóng menu sau khi chọn tab trên điện thoại
              }}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-600 font-black' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className="flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap ${isOpen ? 'md:block' : 'md:hidden'} block`}>{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

// Đã truyền thêm prop onMenuClick để bắt sự kiện từ nút Hamburger
const Header = ({ activeTab, onMenuClick }) => (
  <header className="h-20 bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
    <div className="flex items-center gap-4">
      {/* Nút Hamburger chỉ hiện trên Mobile */}
      <button onClick={onMenuClick} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
        <Menu size={24} />
      </button>
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 capitalize tracking-tight">{activeTab === 'chemicals' ? 'Hóa chất' : activeTab}</h1>
        <p className="hidden md:block text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">Hệ thống quản lý thời gian thực</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white rounded-xl relative cursor-pointer border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">Admin</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Giám sát</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
        </div>
      </div>
    </div>
  </header>
);

// =============================================================================
// 4. DANH SÁCH HÓA CHẤT
// =============================================================================
const ChemicalsView = ({ chemicals, isLoading, onAddClick }) => {
  
  // LOGIC SẮP XẾP: Các hóa chất có hạn MSDS (msds_expiry) gần nhất hoặc đã qua sẽ được đẩy lên trên cùng
  const sortedChemicals = [...(chemicals || [])].sort((a, b) => {
    return new Date(a.msds_expiry) - new Date(b.msds_expiry);
  });

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
      
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4 w-full">
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
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Tên hóa chất</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Cảnh báo (GHS)</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Vị trí</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Hạn MSDS</th>
                <th className="px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 w-full">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Đang tải dữ liệu từ kho...</td></tr>
              ) : sortedChemicals.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-xs text-slate-500 font-bold">Chưa có hóa chất nào trong kho.</td></tr>
              ) : (
                sortedChemicals.map(chem => {
                  
                  // LOGIC TÍNH TOÁN MÀU SẮC DỰA TRÊN NGÀY
                  const today = new Date();
                  const msdsExpiry = new Date(chem.msds_expiry);
                  const diffDays = Math.ceil((msdsExpiry - today) / (1000 * 60 * 60 * 24));
                  
                  let StatusIcon = CheckCircle2;
                  let statusText = "Còn hạn";
                  let statusStyle = "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100";
                  let dateTextStyle = "text-emerald-400";

                  if (diffDays < 0) {
                    StatusIcon = AlertTriangle;
                    statusText = "Hết hạn";
                    statusStyle = "bg-red-50 text-red-600 border-red-100 hover:bg-red-100";
                    dateTextStyle = "text-red-400";
                  } else if (diffDays <= 30) {
                    StatusIcon = Clock; 
                    statusText = "Sắp hết hạn";
                    statusStyle = "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"; 
                    dateTextStyle = "text-amber-500";
                  }
                  
                  return (
                    <tr key={chem.id} className="hover:bg-slate-50/50 transition-colors group/row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${diffDays < 0 ? 'bg-red-50 text-red-600' : diffDays <= 30 ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Box size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 whitespace-nowrap">{chem.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 whitespace-nowrap">CAS: {chem.cas_number}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex flex-row items-center gap-2 flex-wrap w-24">
                          {Array.isArray(chem.hazard_logo) && chem.hazard_logo.length > 0 ? (
                            chem.hazard_logo.map((logo_id, idx) => (
                              <img 
                                key={idx} 
                                src={`/assets/logos/${logo_id}.png`} 
                                alt={logo_id} title={logo_id} 
                                className="object-contain drop-shadow-sm flex-shrink-0" 
                                style={{ width: '40px', height: '40px' }}
                                onError={(e) => { e.target.style.display = 'none'; }} 
                              />
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Chưa có nhãn</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="px-2.5 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {chem.workshops?.name || 'N/A'} - {chem.location_name || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="relative group inline-flex items-center">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-help transition-colors border ${statusStyle}`}>
                            <StatusIcon size={14} />
                            {statusText}
                          </div>

                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-900 text-white rounded-xl p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="flex flex-col gap-2 text-xs">
                              <div className="flex justify-between gap-6">
                                <span className="text-slate-400 font-medium">Bản in đang treo:</span>
                                <span className="font-bold">{chem.published_date}</span>
                              </div>
                              <div className="flex justify-between gap-6">
                                <span className="text-slate-400 font-medium">Hạn MSDS (3 năm):</span>
                                <span className={`font-bold ${dateTextStyle}`}>{chem.msds_expiry}</span>
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      </td>

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
};
// =============================================================================
// 5. MAIN APP
// =============================================================================
// 5. MAIN APP
// =============================================================================
const App = () => {
  const [activeTab, setActiveTab] = useState('chemicals');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Trạng thái đóng/mở trên PC
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Trạng thái trượt ra/vào trên Mobile
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [realChemicals, setRealChemicals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChemicals = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/chemicals'); // Hoặc link Codespace
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

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden w-full relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      {/* Bỏ class pb-20 ở đây vì đã xóa MobileNav */}
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <Header 
          activeTab={activeTab} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth w-full custom-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto">
            {activeTab === 'chemicals' ? (
              <ChemicalsView chemicals={realChemicals} isLoading={isLoading} onAddClick={() => setIsAddModalOpen(true)} />
            ) : activeTab === 'workshop' ? (
              <WorkshopView activeWorkshop={'Xưởng Cũ'} setActiveWorkshop={() => {}} chemicals={realChemicals} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 w-full">
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