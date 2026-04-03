
import React from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, MapIcon, Navigation, ClipboardCheck, Plus } from 'lucide-react';

const DashboardView = ({ chemicals, onNavigate }) => {
  const today = new Date();

  // Đếm hóa chất đã hết hạn (< 0 ngày)
  const expiredCount = (chemicals || []).filter(chem => {
    if (!chem.msds_expiry) return false;
    const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  }).length;

  // Đếm hóa chất sắp hết hạn (0 - 30 ngày)
  const expiringSoonCount = (chemicals || []).filter(chem => {
    if (!chem.msds_expiry) return false;
    const diffDays = Math.ceil((new Date(chem.msds_expiry) - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const MOCK_AUDITS = [
    { id: 1, title: 'Kiểm tra 5S Định kỳ', status: 'Hoàn thành', progress: 100, date: '20/04/2026' },
    { id: 2, title: 'Checklist MSDS Toàn xưởng', status: 'Đang chạy', progress: 45, date: '22/04/2026' },
  ];

  // LOGIC ĐIỀU KIỆN: Kiểm tra xem có cảnh báo nào không
  const hasWarnings = expiredCount > 0 || expiringSoonCount > 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full">
      
      {/* NẾU CÓ CẢNH BÁO: Hiện thẻ Đỏ/Cam */}
      {hasWarnings ? (
        <div 
          onClick={() => onNavigate('chemicals')} 
          className="bg-gradient-to-br from-red-500 to-orange-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.01] hover:shadow-2xl transition-all group"
        >
          <AlertTriangle size={160} className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <AlertTriangle size={28} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black mb-1 md:mb-2">Chú ý Hóa chất!</h2>
              <p className="text-orange-50 text-xs md:text-sm font-medium max-w-xl">
                Hệ thống phát hiện có <strong className="text-white text-lg bg-red-600/50 px-2 py-0.5 rounded-lg mx-1">{expiredCount}</strong> hóa chất đã hết hạn và <strong className="text-white text-lg bg-orange-500/50 px-2 py-0.5 rounded-lg mx-1">{expiringSoonCount}</strong> hóa chất sắp đến hạn. Nhấn để kiểm tra ngay.
              </p>
            </div>
            <button className="w-full md:w-auto bg-white text-orange-600 px-6 py-3 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 mt-2 md:mt-0">
              XEM DANH SÁCH <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )
       : (
        /* NẾU AN TOÀN: Hiện thẻ Xanh lá (Có thể bỏ hẳn khối này nếu bạn muốn trống trơn) */
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden flex items-center gap-5">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black mb-0.5">Kho hóa chất an toàn</h2>
            <p className="text-emerald-50 text-xs md:text-sm font-medium">Hiện tại không có hóa chất nào hết hạn hoặc sắp đến hạn cần xử lý.</p>
          </div>
        </div>
      )}

      {/* Các khối tính năng khác */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onNavigate('workshop')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><MapIcon className="text-indigo-600" size={20} /> Bản đồ số Xưởng</h3>
            <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live</div>
          </div>
          <div className="h-40 md:h-48 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
            <Navigation size={48} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-indigo-600 font-black text-sm">
              NHẤN ĐỂ MỞ SƠ ĐỒ
            </div>
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
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold text-slate-900">{audit.title}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">{audit.status}</p>
                </div>
                <p className="text-xs md:text-sm font-black text-slate-900">{audit.progress}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;