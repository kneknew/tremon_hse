import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardCheck, Bell, Factory, FileText, Calendar, 
  AlertTriangle, Box, ShieldAlert, Flame, ChevronRight, Search, User, 
  Eye, EyeOff, Map as MapIcon, Navigation, Plus, Filter, Download, 
  MoreVertical, CheckCircle2, Clock, Settings, Printer, FileDown,
  X, Upload 
} from 'lucide-react';

// ==========================================
// 1. MOCK DATA (Dữ liệu tĩnh gốc)
// ==========================================
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

// ==========================================
// 2. MODAL THÊM HÓA CHẤT (Bọc thép hoàn toàn)
// ==========================================
const AddChemicalModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msdsFile, setMsdsFile] = useState(null);
  const [csdsFile, setCsdsFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    other_name: '',
    cas_number: '',
    workshop_id: 'e4843734-f2bb-4295-a849-a64bc8b6c2da', // Cẩn thận: Workshop_id này phải có thật trong Database của bạn
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
      
      // FIX LỖI TỌA ĐỘ: Ép kiểu thành số thực (float). Nếu rỗng thì truyền 0 để tránh lỗi 422
      submitData.append('x', parseFloat(formData.x) || 0);
      submitData.append('y', parseFloat(formData.y) || 0);
      
      if (formData.other_name && formData.other_name.trim() !== '') {
        submitData.append('other_name', formData.other_name);
      }
      
      submitData.append('hazard_logo_json', JSON.stringify(formData.hazard_logo));
      
      // FIX BẢO VỆ 2 LỚP: Chắc chắn truyền đúng object File thay vì FileList
      submitData.append('msds_file', msdsFile instanceof FileList ? msdsFile : msdsFile);
      submitData.append('csds_file', csdsFile instanceof FileList ? csdsFile : csdsFile);

      const API_URL = 'https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/add-chemical'; 
      
      // Axios sẽ tự sinh ra Boundary hợp lệ
      await axios.post(API_URL, submitData);

      alert("Thêm hóa chất thành công!");
      onSuccess(); 
      onClose();   
    } catch (error) {
      console.error("Lỗi khi thêm hóa chất:", error);
      
      // BẮT LỖI TỪ BACKEND: Hiển thị ngay lên màn hình xem sai ở cột nào
      if (error.response && error.response.data && error.response.data.detail) {
        alert("BỊ LỖI DỮ LIỆU GỬI ĐI (422):\n\n" + JSON.stringify(error.response.data.detail, null, 2));
      } else {
        alert("Đã xảy ra lỗi kết nối với máy chủ!");
      }
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
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Ngày in trên MSDS treo *</label>
                  <input required type="date" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Ngày bản mới nhất từ NSX *</label>
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
              <label className="block text-xs font-black text-slate-500 uppercase mb-3">Logo Cảnh báo GHS (Tick chọn để áp dụng)</label>
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
  {/* Khu vực Tải lên MSDS */}
  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
    <input 
      required 
      type="file" 
      accept=".pdf" 
      onChange={e => {
        if(e.target.files.length > 0) setMsdsFile(e.target.files[0]) // Lấy file đầu tiên
      }} 
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
    />
    <div className="flex flex-col items-center justify-center pointer-events-none">
      <Upload size={24} className={msdsFile ? "text-emerald-500 mb-2" : "text-slate-400 mb-2"} />
      <p className="text-sm font-bold text-slate-700">
        {msdsFile ? msdsFile.name : "Tải lên bản MSDS (PDF)"}
      </p>
    </div>
  </div>

  {/* Khu vực Tải lên CSDS */}
  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
    <input 
      required 
      type="file" 
      accept=".pdf" 
      onChange={e => {
        if(e.target.files.length > 0) setCsdsFile(e.target.files[0]) // SỬA TỪ [4] THÀNH [0]
      }} 
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
    />
    <div className="flex flex-col items-center justify-center pointer-events-none">
      <Upload size={24} className={csdsFile ? "text-emerald-500 mb-2" : "text-slate-400 mb-2"} />
      <p className="text-sm font-bold text-slate-700">
        {csdsFile ? csdsFile.name : "Tải lên bản CSDS (PDF)"}
      </p>
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

// ==========================================
// 3. UI COMPONENTS (Sidebar)
// ==========================================
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
          </button>
        ))}
      </nav>
    </aside>
  );
};

// ==========================================
// 4. DANH SÁCH HÓA CHẤT (Table)
// ==========================================
const ChemicalsView = ({ chemicals, isLoading, onAddClick }) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Danh mục Hóa chất</h2>
        <p className="text-slate-400 text-sm font-medium">Quản lý thời hạn hồ sơ, MSDS và thông tin an toàn</p>
      </div>
      <div className="flex gap-4 w-full md:w-auto">
        <button 
          onClick={onAddClick} 
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> THÊM HÓA CHẤT
        </button>
      </div>
    </div>
    
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên hóa chất</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cảnh báo (GHS)</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bản treo tại xưởng</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hạn MSDS (3 năm)</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
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
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CAS: {chem.cas_number}</p>
                        </div>
                      </div>
                    </td>
                <td className="p-6 whitespace-nowrap"> {/* Thêm whitespace-nowrap ở đây */}
  <div className="flex flex-row items-center gap-2 flex-nowrap"> {/* Đổi flex-wrap thành flex-nowrap */}
    {Array.isArray(chem.hazard_logo) && chem.hazard_logo.length > 0 ? (
      chem.hazard_logo.map((logo_id, idx) => (
        <img 
          key={idx} 
          src={`/assets/logos/${logo_id}.png`} 
          alt={logo_id} 
          title={logo_id} 
          className="flex-shrink-0 object-contain drop-shadow-sm" // Thêm flex-shrink-0 để ảnh không bị bóp nhỏ
          style={{ width: '24px', height: '24px' }}
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
      ))
    ) : (
      <span className="text-[10px] text-slate-400 font-bold uppercase">Chưa có nhãn</span>
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
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all shadow-md">
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

// ==========================================
// 5. MAIN APP (Bộ điều hướng chính)
// ==========================================
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

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <div className="p-8 text-2xl font-black">Tổng quan</div>; 
      case 'workshop':  return <div className="p-8 text-2xl font-black">Sơ đồ xưởng (Đang phát triển)</div>;
      case 'chemicals': return <ChemicalsView chemicals={realChemicals} isLoading={isLoading} onAddClick={() => setIsAddModalOpen(true)} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfcfd] text-slate-800 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col min-w-0">
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