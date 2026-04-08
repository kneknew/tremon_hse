import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, X, Upload, Edit2 } from 'lucide-react';

const AddChemicalModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msdsFile, setMsdsFile] = useState(null);
  const [csdsFile, setCsdsFile] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);
  const isEditMode = !!initialData;
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
          
          if (!isEditMode && data.length > 0) {
            setFormData(prev => ({ ...prev, workshop_id: data[0].id }));
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách xưởng:", error);
        } finally {
          setIsLoadingWorkshops(false);
        }
      };
      fetchWorkshops();
    }
  }, [isOpen, isEditMode]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        other_name: initialData.other_name || '',
        cas_number: initialData.cas_number || '',
        workshop_id: initialData.workshop_id || '',
        location_names: initialData.location_name || [],
        published_date: initialData.published_date || '',
        newest_published_date: initialData.newest_published_date || '',
        hazard_logo: initialData.hazard_logo || []
      });
      setMsdsFile(null);
      setCsdsFile(null);
    } else if (isOpen && !initialData) {
      setFormData({
        name: '', other_name: '', cas_number: '', workshop_id: workshops.length > 0 ? 
        workshops[0].id : '', 
        location_names: [], published_date: '', newest_published_date: '', hazard_logo: []
      });
      setMsdsFile(null);
      setCsdsFile(null);
    }
  }, [isOpen, initialData, workshops]);

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
    if (!isEditMode && (!msdsFile || !csdsFile)) { 
        alert("Vui lòng đính kèm đủ file!");
        return; 
    }
    if (formData.location_names.length === 0) { alert("Vui lòng chọn ít nhất 1 phân khu!"); return; }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('cas_number', formData.cas_number);
      submitData.append('workshop_id', formData.workshop_id);
      if (formData.published_date) submitData.append('published_date', formData.published_date);
      submitData.append('newest_published_date', formData.newest_published_date);
      if (formData.other_name) submitData.append('other_name', formData.other_name);
      
      submitData.append('hazard_logo_json', JSON.stringify(formData.hazard_logo));
      submitData.append('location_names_json', JSON.stringify(formData.location_names));
      if (msdsFile) submitData.append('msds_file', msdsFile);
      if (csdsFile) submitData.append('csds_file', csdsFile);

      if (isEditMode) {
        await axios.put(`https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/update-chemical/${initialData.id}`, submitData);
        alert("Cập nhật hóa chất thành công!");
      } else {
        await axios.post('https://musical-memory-94xwjp76j573xq4g-8000.app.github.dev/add-chemical', submitData);
        alert("Thêm hóa chất thành công!");
      }
      
      onSuccess(); 
      onClose();
    } catch (error) {
      alert("Lỗi Server: " + (error.response?.data?.detail || error.message));
      console.error(error);
    } finally { setIsSubmitting(false); }
  };

  const currentWorkshop = workshops.find(ws => ws.id === formData.workshop_id);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-y-auto flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
            {isEditMode ? <><Edit2 className="text-blue-600" /> Sửa thông tin Hóa chất</> : <><Box className="text-indigo-600" /> Thêm Hóa Chất Mới</>}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="chemical-form" onSubmit={handleSubmit} className="space-y-5">
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
              {/* Loại bỏ dấu * và thuộc tính required  */}
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ngày bản đang treo</label><input type="date" value={formData.published_date} onChange={e => setFormData({...formData, published_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" /></div>
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
                <input required={!isEditMode} type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setMsdsFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className={`mx-auto mb-1 ${msdsFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className={`text-[11px] font-bold truncate ${msdsFile ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {msdsFile ? msdsFile.name : (isEditMode ? "Tải lên MSDS mới (Tuỳ chọn)" : "Tải lên MSDS")}
                </p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative hover:bg-slate-50">
                <input required={!isEditMode} type="file" accept=".pdf" onChange={e => {if(e.target.files.length > 0) setCsdsFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={18} className={`mx-auto mb-1 ${csdsFile ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className={`text-[11px] font-bold truncate ${csdsFile ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {csdsFile ? csdsFile.name : (isEditMode ? "Tải lên CSDS mới (Tuỳ chọn)" : "Tải lên CSDS")}
                </p>
              </div>
            </div>
          </form>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100">HỦY</button>
          <button form="chemical-form" type="submit" disabled={isSubmitting || isLoadingWorkshops} className={`px-6 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-50 ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {isSubmitting ? 'ĐANG LƯU...' : (isEditMode ? 'CẬP NHẬT' : 'LƯU HÓA CHẤT')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChemicalModal;