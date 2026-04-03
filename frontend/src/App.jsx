import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardCheck, Bell, Factory, Calendar, Box, 
  ShieldAlert, Flame, Search, Map as MapIcon, Plus, Filter, 
  Clock, Settings, Printer, FileDown, X, Upload, AlertTriangle, 
  CheckCircle2, Menu, Navigation , ChevronLeft, ChevronRight,
  Form
} from 'lucide-react';

import { WORKSHOP_DATA, MOCK_AUDITS } from './constants';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

import AddChemicalModal from './components/modals/AddChemicalModal';
import AddPlanModal from './components/modals/AddPlanModal';

import DashboardView from './pages/Dashboard';
import WorkshopView from './pages/WorkshopView';
import ChemicalsView from './pages/ChemicalView';
import PlansView from './pages/PlanView';
import AuditView from './pages/Audit.jsx';


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

const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView chemicals={realChemicals} onNavigate={setActiveTab} />;
      case 'workshop':
        return <WorkshopView activeWorkshop={activeWorkshop} setActiveWorkshop={setActiveWorkshop} chemicals={realChemicals} />;
      case 'chemicals':
        return <ChemicalsView chemicals={realChemicals} isLoading={isLoading} onAddClick={() => setIsAddModalOpen(true)} />;
      case 'audit':
        return <AuditView />;
      case 'plans':
        return <PlansView />;
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
            {renderView()}
          </div>
        </div>
      </main>
      <AddChemicalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchChemicals} />
    </div>
  );
};

export default App;