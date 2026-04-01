import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'
import './index.css'
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardCheck, Bell, Factory, FileText, Calendar, 
  AlertTriangle, Box, ShieldAlert, Flame, ChevronRight, Search, User, 
  Eye, EyeOff, Map as MapIcon, Navigation, Plus, Filter, Download, 
  MoreVertical, CheckCircle2, Clock, Settings, Printer, FileDown,
  X, Upload 
} from 'lucide-react';

// =============================================================================
// 1. MOCK DATA (Dữ liệu tĩnh cho các trang chưa kết nối Backend)
// =============================================================================
const WORKSHOP_DATA = {
  'Xưởng Cũ': {
    layout: 'M 50 50 L 450 50 L 450 350 L 50 350 Z',
    zones: [
      { id: 'z1', name: 'Khu vực Máy tiện', x: 100, y: 100, w: 120, h: 80 },
      { id: 'z2', name: 'Kho vật tư', x: 300, y: 100, w: 100, h: 150 },
      { id: 'z3', name: 'Đóng gói', x: 100, y: 250, w: 150, h: 70 },
    ],
    markers: {
      msds: [{ x: 110, y: 110 }, { x: 310, y: 120 }],
      pccc: [{ x: 50, y: 200 }, { x: 450, y: 200 }, { x: 250, y: 50 }],
      emergency: [{ x: 60, y: 60 }]
    }
  },
  'Xưởng Mới': {
    layout: 'M 20 20 L 480 20 L 480 380 L 250 380 L 250 300 L 20 300 Z',
    zones: [
      { id: 'z1', name: 'Dây chuyền SMT', x: 50, y: 50, w: 300, h: 100 },
      { id: 'z2', name: 'Khu kiểm thử', x: 380, y: 50, w: 80, h: 200 },
      { id: 'z3', name: 'Logistics', x: 50, y: 180, w: 150, h: 100 },
    ],
    markers: {
      msds: [{ x: 60, y: 60 }, { x: 390, y: 100 }, { x: 60, y: 190 }],
      pccc: [{ x: 20, y: 150 }, { x: 480, y: 150 }, { x: 250, y: 20 }, { x: 250, y: 380 }],
      emergency: [{ x: 450, y: 30 }, { x: 30, y: 270 }]
    }
  },
  'Xưởng Ruột': {
    layout: 'M 100 20 L 400 20 L 480 150 L 480 250 L 400 380 L 100 380 L 20 250 L 20 150 Z',
    zones: [
      { id: 'z1', name: 'Lõi điều hành', x: 150, y: 120, w: 200, h: 160 },
      { id: 'z2', name: 'Trạm cấp phôi', x: 50, y: 180, w: 80, h: 40 },
      { id: 'z3', name: 'Trạm ra hàng', x: 370, y: 180, w: 80, h: 40 },
    ],
    markers: {
      msds: [{ x: 250, y: 200 }],
      pccc: [{ x: 100, y: 40 }, { x: 400, y: 40 }, { x: 100, y: 360 }, { x: 400, y: 360 }],
      emergency: [{ x: 250, y: 30 }, { x: 250, y: 370 }]
    }
  }
};

const MOCK_CHEMICALS_SUMMARY = [
  { id: 1, name: 'Acetone Công nghiệp', expiry: '5 ngày', location: 'Xưởng Cũ', status: 'critical' },
  { id: 2, name: 'Dung môi Cleaning A1', expiry: '7 ngày', location: 'Xưởng Ruột', status: 'warning' },
  { id: 3, name: 'Axit Nitric loãng', expiry: '2 ngày', location: 'Xưởng Mới', status: 'critical' },
];

const MOCK_AUDITS = [
  { id: 1, title: 'Kiểm tra 5S Định kỳ', status: 'Hoàn thành', progress: 100, date: '20/03/2024' },
  { id: 2, title: 'Checklist MSDS Toàn xưởng', status: 'Đang chạy', progress: 45, date: '22/03/2024' },
  { id: 3, title: 'Kiểm tra thiết bị PCCC', status: 'Chưa bắt đầu', progress: 0, date: '28/03/2024' },
];

// =============================================================================
// 2. MODAL THÊM HÓA CHẤT (Đã kết nối Backend thật)
// =============================================================================
const AddChemicalModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msdsFile, setMsdsFile] = useState(null);
  const [csdsFile, setCsdsFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    other_name: '',
    cas_number: '',
    workshop_id: 'e4843734-f2bb-4295-a849-a64bc8b6c2da', 
    published_date: '',
    newest_published_date: '',
    x: '', 
    y: '', 
    hazard_logo: []
  });

  const GHS_LOGOS = [
    { id: 'flammable', label: 'Dễ cháy' },
    { id: 'toxic', label: 'Độc hại' },
    { id: 'corrosive', label: 'Ăn mòn' },
    { id: 'explosive', label: 'Nổ' },
    { id: 'oxidizing', label: 'Oxy hóa' },
    { id: 'health_hazard', label: 'Nguy hại sức khỏe' }
  ];

  if (!isOpen) return null;

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
    if (!msdsFile || !csdsFile) {
      alert("Vui lòng đính kèm đủ file MSDS và CSDS!");
      return;
    }
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
      
      if (formData.other_name && formData.other_name.trim() !== '') {
        submitData.append('other_name', formData.other_name);
      }
      
      submitData.append('hazard_logo_json', JSON.stringify(formData.hazard_logo));
      submitData.append('msds_file', msdsFile instanceof FileList ? msdsFile : msdsFile);
      submitData.append('csds_file', csdsFile instanceof FileList ? csdsFile : csdsFile);

      const API_URL = 'https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/add-chemical'; 
      await axios.post(API_URL, submitData);

      alert("Thêm hóa chất thành công!");
      onSuccess(); 
      onClose();   
    } catch (error) {
      console.error("Lỗi khi thêm hóa chất:", error);
      alert("Đã xảy ra lỗi khi kết nối với máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Box className="text-indigo-600" /> Thêm Hóa Chất Mới
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <form id="add-chemical-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Tên hóa chất *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Tên khác (Không bắt buộc)</label>
                  <input type="text" value={formData.other_name} onChange={e => setFormData({...formData, other_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Số CAS *</label>
                  <input required type="text" value={formData.cas_number} onChange={e => setFormData({...formData, cas_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Ngày xuất bản MSDS treo *</label>
                  <input required type="date" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Ngày xuất bản mới nhất từ NCC *</label>
                  <input required type="date" value={formData.newest_published_date} onChange={e => setFormData({...formData, newest_published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Tọa độ X *</label>
                    <input required type="number" step="0.1" value={formData.x} onChange={e => setFormData({...formData, x: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Tọa độ Y *</label>
                    <input required type="number" step="0.1" value={formData.y} onChange={e => setFormData({...formData, y: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-3">Logo Cảnh báo GHS (Tick chọn)</label>
              <div className="flex flex-wrap gap-3">
                {GHS_LOGOS.map(logo => (
                  <label key={logo.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer border transition-all text-xs font-bold uppercase tracking-wide ${formData.hazard_logo.includes(logo.id) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                    <input type="checkbox" className="hidden" checked={formData.hazard_logo.includes(logo.id)} onChange={() => handleCheckboxChange(logo.id)} />
                    {logo.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input required type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setMsdsFile(e.target.files)}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <Upload size={24} className={msdsFile ? "text-emerald-500 mb-2" : "text-slate-400 mb-2"} />
                  <p className="text-sm font-bold text-slate-700">{msdsFile ? msdsFile.name : "Tải lên bản MSDS (PDF)"}</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input required type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setCsdsFile(e.target.files)}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <Upload size={24} className={csdsFile ? "text-emerald-500 mb-2" : "text-slate-400 mb-2"} />
                  <p className="text-sm font-bold text-slate-700">{csdsFile ? csdsFile.name : "Tải lên bản CSDS (PDF)"}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-black text-sm text-slate-500 hover:bg-slate-200 transition-all">
            HỦY
          </button>
          <button form="add-chemical-form" type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50">
            {isSubmitting ? 'ĐANG LƯU...' : 'LƯU HÓA CHẤT'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 3. UI COMPONENTS CHUNG (Sidebar & Header gốc)
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
    <aside className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isOpen ? 'w-72' : 'w-24'} hidden md:flex`}>
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <Factory size={26} />
        </div>
        {isOpen && <span className="font-black text-2xl tracking-tight text-slate-900 uppercase">Factory<span className="text-indigo-600">Pro</span></span>}
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative group ${
              activeTab === item.id 
              ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 font-black' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            {isOpen && <span className="text-sm">{item.label}</span>}
            {activeTab === item.id && (
              <div className="absolute left-[-4px] top-1/4 bottom-1/4 w-2 bg-indigo-300 rounded-full" />
            )}
          </button>
        ))}
      </nav>
      <div className="p-8 border-t border-slate-50">
        <div className="bg-slate-950 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Settings size={80} strokeWidth={1} />
          </div>
          <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Version</p>
          <p className="text-sm font-bold">Safe-Core 3.0</p>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ activeTab }) => (
  <header className="h-24 bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 flex items-center justify-between px-12">
    <div className="flex flex-col">
      <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
        {activeTab === 'chemicals' ? 'Hóa chất' : activeTab}
      </h1>
      <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
        Hệ thống quản lý thời gian thực
      </p>
    </div>
    <div className="flex items-center gap-8">
      <div className="hidden lg:flex items-center bg-slate-100 px-6 py-3 rounded-2xl w-96 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
        <Search size={18} className="text-slate-400" />
        <input type="text" placeholder="Tìm nhanh thiết bị, hóa chất..." className="bg-transparent border-none outline-none ml-4 w-full text-xs font-bold" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl relative cursor-pointer border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
          <Bell size={22} className="text-slate-600" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">Admin User</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Giám sát An toàn</p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-inner overflow-hidden border border-slate-100">
            <img src="" alt="avatar" />
          </div>
        </div>
      </div>
    </div>
  </header>
);

// =============================================================================
// 4. CÁC TRANG HIỂN THỊ (VIEWS)
// =============================================================================

const DashboardView = ({ setActiveTab }) => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-orange-100 relative overflow-hidden">
      <AlertTriangle size={160} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
          <AlertTriangle size={40} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black mb-2 leading-none">Hóa chất đến hạn!</h2>
          <p className="text-orange-50 font-medium max-w-xl">Hệ thống phát hiện {MOCK_CHEMICALS_SUMMARY.length} loại hóa chất cần được thay mới trong tuần tới để đảm bảo an toàn vận hành.</p>
        </div>
        <button onClick={() => setActiveTab('chemicals')} className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform active:scale-95">
          KIỂM TRA CHI TIẾT
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer" onClick={() => setActiveTab('workshop')}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><MapIcon className="text-indigo-600" /> Bản đồ số</h3>
          <div className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Live</div>
        </div>
        <div className="h-48 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
            <Navigation size={60} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-indigo-600 font-black">NHẤN ĐỂ MỞ SƠ ĐỒ</div>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><ClipboardCheck className="text-emerald-500" /> Audit</h3>
          <Plus size={20} className="text-slate-400" />
        </div>
        <div className="space-y-4 flex-1">
          {MOCK_AUDITS.map(audit => (
            <div key={audit.id} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 py-1">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{audit.title}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{audit.status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{audit.progress}%</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setActiveTab('audit')} className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-colors">TẤT CẢ AUDIT</button>
      </div>
    </div>
  </div>
);

const WorkshopView = ({ activeWorkshop, setActiveWorkshop, layers, toggleLayer }) => { 
  const data = WORKSHOP_DATA[activeWorkshop]; 
  return ( 
    <div className="space-y-6 animate-in fade-in duration-500"> 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"> 
        <div> 
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><MapIcon className="text-indigo-600" /> Sơ đồ xưởng trực quan</h2> 
          <p className="text-slate-400 text-sm font-medium">Bản đồ mặt bằng và quản lý an toàn vị trí</p> 
        </div> 
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200"> 
          {['Xưởng Cũ', 'Xưởng Mới', 'Xưởng Ruột'].map(tab => ( 
            <button key={tab} onClick={() => setActiveWorkshop(tab)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeWorkshop === tab ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-900'}`}>{tab}</button> 
          ))} 
        </div> 
      </div>
      <div className="relative w-full h-[600px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center p-8">
        <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-2xl transition-all duration-500">
          <path d={data.layout} fill="white" stroke="#cbd5e1" strokeWidth="4" />
          {data.zones.map(zone => (
            <g key={zone.id}>
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} fill="#f1f5f9" stroke="#e2e8f0" strokeDasharray="4" className="hover:fill-indigo-50 transition-colors" />
              <text x={zone.x + zone.w/2} y={zone.y + zone.h/2} textAnchor="middle" className="text-xs font-bold fill-slate-400 uppercase pointer-events-none">{zone.name}</text>
            </g>
          ))}
          {layers.msds && data.markers.msds.map((m, i) => (
            <g key={`msds-${i}`} className="animate-in zoom-in">
              <circle cx={m.x} cy={m.y} r="8" fill="#3b82f6" className="animate-pulse opacity-20" />
              <circle cx={m.x} cy={m.y} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
            </g>
          ))}
          {layers.pccc && data.markers.pccc.map((m, i) => (
            <g key={`pccc-${i}`} className="animate-in zoom-in">
              <rect x={m.x-6} y={m.y-6} width="12" height="12" rx="2" fill="#ef4444" stroke="white" strokeWidth="2" />
            </g>
          ))}
          {layers.emergency && data.markers.emergency.map((m, i) => (
            <g key={`em-${i}`} className="animate-in zoom-in">
              <path d={`M ${m.x} ${m.y-8} L ${m.x+8} ${m.y} L ${m.x} ${m.y+8} L ${m.x-8} ${m.y} Z`} fill="#f97316" stroke="white" strokeWidth="2" />
            </g>
          ))}
        </svg>
        <div className="absolute top-8 right-8 flex flex-col gap-3">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-xl border border-slate-200 flex flex-col gap-2 min-w-[160px]">
            <p className="text-xs font-black text-slate-400 px-3 uppercase tracking-widest border-b pb-2 mb-1">Tùy chọn hiển thị</p>
            <button onClick={() => toggleLayer('msds')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${layers.msds ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Box size={16} /> <span className="text-xs font-bold">Lớp MSDS</span>
            </button>
            <button onClick={() => toggleLayer('pccc')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${layers.pccc ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Flame size={16} /> <span className="text-xs font-bold">Lớp PCCC</span>
            </button>
            <button onClick={() => toggleLayer('emergency')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${layers.emergency ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-500 hover:bg-slate-50'}`}>
              <ShieldAlert size={16} /> <span className="text-xs font-bold">Trạm Khẩn cấp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ); 
};

// View Hóa Chất lấy Dữ Liệu Thật từ Backend
const ChemicalsView = ({ chemicals, isLoading, onAddClick }) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
      <div>
        <h2 className="text-xl font-black text-slate-900">Danh mục Hóa chất</h2>
        <p className="text-slate-400 text-sm font-medium">Quản lý thời hạn hồ sơ, MSDS và thông tin an toàn</p>
      </div>
      <div className="flex gap-4 w-full md:w-auto">
        <div className="flex items-center bg-slate-100 px-4 rounded-xl border border-slate-200 flex-1 md:flex-initial">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Tìm tên hóa chất..." className="bg-transparent border-none outline-none p-3 text-xs font-bold w-full md:w-48" />
        </div>
        <button className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-colors"><Filter size={18} /></button>
        <button onClick={onAddClick} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus size={18} /> THÊM HÓA CHẤT
        </button>
      </div>
    </div>
    
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Tên hóa chất</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Cảnh báo (GHS)</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Bản treo tại xưởng</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Hạn MSDS (3 năm)</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-bold">Đang tải dữ liệu từ máy chủ...</td></tr>
            ) : chemicals.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-bold">Chưa có hóa chất nào trong kho.</td></tr>
            ) : (
              chemicals.map(chem => {
                const needsUpdate = new Date(chem.newest_published_date) > new Date(chem.published_date);
                const isExpired = new Date(chem.msds_expiry) < new Date();

                return (
                  <tr key={chem.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Box size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{chem.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">CAS: {chem.cas_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-row items-center gap-2 flex-wrap">
                        {Array.isArray(chem.hazard_logo) && chem.hazard_logo.length > 0 ? (
                          chem.hazard_logo.map((logo_id, idx) => (
                            <img 
                              key={idx} 
                              src={`/assets/logos/${logo_id}.png`} 
                              alt={logo_id} 
                              title={logo_id} 
                              className="object-contain drop-shadow-sm" 
                              style={{ width: '24px', height: '24px' }}
                              onError={(e) => { e.target.style.display = 'none'; }} 
                            />
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">Chưa có nhãn</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">{chem.published_date}</span>
                        </div>
                        {needsUpdate && (
                          <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md w-max animate-pulse">
                            CÓ BẢN MỚI TỪ NSX!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={14} className={isExpired ? "text-red-500" : "text-emerald-500"} />
                        <span className={`text-xs font-bold ${isExpired ? "text-red-600" : "text-emerald-600"}`}>
                          {chem.msds_expiry}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-md">
                          <Printer size={12} /> IN MSDS
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
// 5. MAIN APP CONTAINER
// =============================================================================
const App = () => { 
  const [activeTab, setActiveTab] = useState('chemicals'); 
  const [activeWorkshop, setActiveWorkshop] = useState('Xưởng Cũ'); 
  const [layers, setLayers] = useState({ msds: true, pccc: true, emergency: false }); 
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
      console.error("Lỗi khi tải dữ liệu:", error); 
    } finally { 
      setIsLoading(false); 
    } 
  };

  useEffect(() => { 
    fetchChemicals(); 
  }, []);

  const toggleLayer = (layer) => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));

  const renderView = () => { 
    switch (activeTab) { 
      case 'dashboard': 
        return <DashboardView setActiveTab={setActiveTab} />; 
      case 'workshop':  
        return <WorkshopView activeWorkshop={activeWorkshop} setActiveWorkshop={setActiveWorkshop} layers={layers} toggleLayer={toggleLayer} />; 
      case 'chemicals': 
        return <ChemicalsView chemicals={realChemicals} isLoading={isLoading} onAddClick={() => setIsAddModalOpen(true)} />; 
      case 'audit':     
        return ( 
          <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 shadow-sm text-center"> 
            <ClipboardCheck size={80} className="mx-auto text-slate-100 mb-4" /> 
            <h2 className="text-xl font-black text-slate-900">Module Audit & Kiểm tra</h2> 
            <p className="text-slate-400 mt-2">Dữ liệu đang được đồng bộ hóa từ hệ thống...</p> 
          </div> 
        ); 
      case 'plans':     
        return ( 
          <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 shadow-sm text-center"> 
            <Calendar size={80} className="mx-auto text-slate-100 mb-4" /> 
            <h2 className="text-xl font-black text-slate-900">Module Kế hoạch</h2> 
            <p className="text-slate-400 mt-2">Đang tải lịch trình sản xuất tháng 04...</p> 
          </div> 
        ); 
      default: return null; 
    } 
  };

  return ( 
    <div className="flex h-screen bg-[#fcfcfd] text-slate-800 font-sans overflow-hidden"> 
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> 
      
      <main className="flex-1 flex flex-col min-w-0"> 
        <Header activeTab={activeTab} />
        <div className="p-12 overflow-y-auto flex-1 scroll-smooth"> 
          <div className="max-w-[1500px] mx-auto"> 
            {renderView()} 
          </div> 
        </div> 
      </main>

      <AddChemicalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchChemicals} 
      />
    </div>
  ); 
};

export default App;