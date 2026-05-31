import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

interface HeaderProps {
  toggleMenu: () => void;
}

export default function Header({ toggleMenu }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full transition-all">
      <div className="flex items-center flex-1 gap-4">
        <button 
          onClick={toggleMenu}
          className="md:hidden text-slate-500 hover:text-slate-800 transition-colors p-1"
        >
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search properties, reservations..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-transparent focus:bg-white focus:border-sky-500 rounded-lg text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="sm:hidden text-slate-500 hover:text-slate-800 transition-colors">
          <Search size={20} />
        </button>
        <button className="relative text-slate-500 hover:text-slate-800 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-800 border-2 border-slate-200 flex items-center justify-center text-white overflow-hidden cursor-pointer">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
