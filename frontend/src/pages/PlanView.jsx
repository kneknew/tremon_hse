
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock, Calendar } from 'lucide-react';
import AddPlanModal from '../components/modals/AddPlanModal.jsx';

const PlansView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [contextMenu, setContextMenu] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Chuyển Thứ 2 thành ngày đầu tuần

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null); // Ô trống đầu tháng
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i)); // Các ngày trong tháng
  const [plans, setPlans] = useState([]);
  
  const fetchPlans = async () => {
    try {
      const res = await axios.get('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/plans');
      setPlans(res.data.data || []);
    } catch (error) {
      console.error("Lỗi tải lịch trình:", error);
    }
  };

  // Tự động lấy dữ liệu khi vừa mở trang
  useEffect(() => {
    fetchPlans();
  }, []);

  const formatDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const selectedDateString = formatDateString(selectedDate);
  const plansForSelectedDate = plans.filter(p => p.plan_date === selectedDateString);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setContextMenu(null);
  };

  const handleRightClick = (e, date) => {
    e.preventDefault(); // Chặn menu mặc định của trình duyệt
    setSelectedDate(date); // Cập nhật ngày đang chọn
    setContextMenu({ x: e.clientX, y: e.clientY, date }); // Hiển thị menu custom
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 md:gap-8 animate-in fade-in duration-500 w-full h-[calc(100vh-140px)] min-h-[600px]">
      
      <div className="xl:w-2/3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col h-full relative">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 capitalize">
              Tháng {month + 1}, {year}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Lịch trình sản xuất & Audit</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 transition-all"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-xl text-xs font-black text-slate-700 transition-all">HÔM NAY</button>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-600 transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* Lưới Lịch */}
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
              <div key={day} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2 auto-rows-fr">
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="bg-slate-50/50 rounded-2xl border border-slate-100/50"></div>;
              
              const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
              const isToday = formatDateString(date) === formatDateString(new Date());
              const hasPlans = MOCK_PLANS.some(p => p.date === formatDateString(date));

              return (
                <div 
                  key={index} 
                  onClick={() => handleDayClick(date)}
                  onContextMenu={(e) => handleRightClick(e, date)}
                  className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col hover:border-indigo-300 relative
                    ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-700 hover:bg-indigo-50'}
                  `}
                >
                  <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-full ${isToday && !isSelected ? 'bg-amber-100 text-amber-600' : ''}`}>
                    {date.getDate()}
                  </span>
                  
                  {hasPlans && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MENU CHUỘT PHẢI (CONTEXT MENU) */}
        {contextMenu && (
          <div 
            style={{ top: contextMenu.y, left: contextMenu.x }} 
            className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-100 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase">
              Ngày {contextMenu.date.getDate()}/{contextMenu.date.getMonth() + 1}
            </div>
            <button 
              onClick={() => { setIsAddModalOpen(true); setContextMenu(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <Plus size={16} /> Thêm kế hoạch mới
            </button>
          </div>
        )}
      </div>

      <div className="xl:w-1/3 bg-slate-900 rounded-[2.5rem] shadow-xl p-6 md:p-8 flex flex-col text-white h-full overflow-hidden relative">
        {/* Nền trang trí */}
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
          <Calendar size={120} />
        </div>

        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chi tiết ngày</h3>
          <p className="text-3xl font-black text-white mb-8">
            {selectedDate.getDate()} Tháng {selectedDate.getMonth() + 1}
          </p>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {plansForSelectedDate.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-500" />
                <p className="text-sm font-bold text-slate-400">Không có lịch trình nào</p>
                <p className="text-[10px] mt-1">Chuột phải vào lịch để thêm mới</p>
              </div>
            ) : (
              plansForSelectedDate.map(plan => (
                <div key={plan.id} className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl hover:bg-slate-800 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                      {plan.type}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                      <Clock size={12} /> {plan.time}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-100 mb-2">{plan.title}</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${plan.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {plan.status === 'completed' ? 'Đã hoàn thành' : 'Chưa thực hiện'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg transition-colors flex items-center justify-center gap-2 z-10 relative">
          <Plus size={18} /> THÊM KẾ HOẠCH
        </button>
      </div>

      {/* Gọi Modal Thêm Kế hoạch */}
      <AddPlanModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        selectedDate={selectedDate} 
      />
    </div>
  );
};
export default PlansView;