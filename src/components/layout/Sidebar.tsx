import React from 'react';
import { Home, List, Calendar, BarChart2, Settings, ArrowLeft, X } from 'lucide-react';
import { useAppContext } from '../../App';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { setCurrentView } = useAppContext();

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-sky-600 tracking-tight">Easyfen Admin</h1>
        <button 
          className="md:hidden text-slate-500 hover:text-slate-800 p-1" 
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sky-50 text-sky-700 font-medium">
          <Home size={20} />
          <span>Dashboard</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
          <List size={20} />
          <span>Properties</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
          <Calendar size={20} />
          <span>Bookings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
          <BarChart2 size={20} />
          <span>Analytics</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => setCurrentView('profile')}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Exit Admin</span>
        </button>
      </div>
    </aside>
  );
}
