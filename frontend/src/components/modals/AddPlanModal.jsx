
import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

const AddPlanModal = ({ isOpen, onClose, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: '', type: 'Kiểm tra PCCC', time: '08:00', description: ''
  });

  if (!isOpen) return null;

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Chuyển đổi ngày đang chọn thành chuẩn YYYY-MM-DD của Database
    const d = new Date(selectedDate);
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    try {
      // 2. Gửi dữ liệu lên API Backend
      const res = await axios.post('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/plans/add', {
        title: formData.title,
        plan_type: formData.type, // Chú ý: trong state của bạn đang tên là 'type'
        plan_date: formattedDate,
        plan_time: formData.time,
        description: formData.description
      });

      if (res.data.status === 'success') {
        onSuccess(); // Hàm này sẽ trigger việc lấy lại danh sách kế hoạch mới
        onClose();   // Đóng Modal
        // Reset form
        setFormData({ title: '', type: 'Kiểm tra PCCC', time: '08:00', description: '' });
      }
    } catch (error) {
      console.error("Lỗi thêm kế hoạch:", error);
      alert("Không thể lưu kế hoạch. Vui lòng kiểm tra lại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
            <Calendar className="text-indigo-600" /> Thêm Lịch trình mới
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày thực hiện</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-600">
              {selectedDate ? selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tên kế hoạch *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: Kiểm tra toàn xưởng..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phân loại</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500">
                <option>Kiểm tra PCCC</option>
                <option>Đánh giá 5S</option>
                <option>Bảo trì Thiết bị</option>
                <option>Cập nhật MSDS</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Thời gian</label>
              <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ghi chú</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors">HỦY</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors">
              LƯU KẾ HOẠCH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddPlanModal;  