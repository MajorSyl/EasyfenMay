import React, { useState } from 'react';
import { Settings, ShieldCheck, Crown, ExternalLink, Activity, LogOut, FileText, Eye, CheckCircle2, TrendingUp } from 'lucide-react';
import { MOCK_USER, MOCK_LISTINGS } from '../types';
import { useAppContext } from '../App';
import { ListingCard } from './FeedView';

export default function ProfileView() {
  const { setShowUpgrade, setSelectedListing, savedListingIds, toggleSaved, setIsAuthenticated } = useAppContext();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

  // Filter listings as if they belong to this user
  const userListings = MOCK_LISTINGS.filter(l => l.user_id === 'u1' || l.user_id === 'u3');
  const displayListings = userListings; // In a real app we filter by active/sold state on the db

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full">
        {/* Profile Header Area */}
        <div className="bg-white pt-10 pb-6 px-4 shadow-sm z-10 w-full">
          
          {/* Profile Card Main */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative shadow-xl shadow-slate-900/20 mb-6 overflow-hidden">
           {/* Decorative background shapes */}
           <div className="absolute -top-16 -right-16 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl" />
           <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl" />
           
           <div className="relative z-10 flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                  <div className="relative">
                     <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                        {MOCK_USER.full_name.charAt(0)}
                     </div>
                     <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                       <CheckCircle2 size={18} className="text-sky-500 fill-current text-white" />
                     </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold leading-tight mb-1">{MOCK_USER.full_name}</h1>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                         {MOCK_USER.role.replace('_', ' ')}
                       </span>
                       <span className="text-slate-400 font-medium text-sm">+{MOCK_USER.phone_number}</span>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={() => setIsAuthenticated(false)}
                 className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                 title="Log Out"
               >
                 <LogOut size={20} />
               </button>
           </div>
           
           {/* Stats Ribbon */}
           <div className="relative z-10 flex gap-4 pt-5 border-t border-slate-700/50">
              <div className="flex-1">
                 <p className="text-2xl font-black">{userListings.length}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Listings</p>
              </div>
              <div className="w-px bg-slate-700/50" />
              <div className="flex-1">
                 <p className="text-2xl font-black flex items-center gap-1">
                   1.2k <TrendingUp size={16} className="text-emerald-400" />
                 </p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
              </div>
              <div className="w-px bg-slate-700/50" />
              <div className="flex-1">
                 <p className="text-2xl font-black">95%</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response Rate</p>
              </div>
           </div>
        </div>

        {/* Premium Banner CTA */}
        <div 
          onClick={() => setShowUpgrade(true)}
          className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-amber-500/20 cursor-pointer active:scale-[0.98] transition-transform"
        >
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                <Crown size={24} className="fill-current" />
              </div>
              <div>
                <p className="text-amber-50 font-bold text-xs uppercase tracking-wider mb-0.5">Agent Pro</p>
                <p className="text-white font-bold leading-tight">Upgrade your account</p>
              </div>
           </div>
           <ExternalLink size={20} className="text-amber-100" />
        </div>
      </div>

      {/* Workspace Area - My Listings */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-slate-400" />
          My Operations
        </h2>
        
        {/* Toggle Switch */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6 shadow-inner w-full max-w-[240px]">
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'sold' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
            onClick={() => setActiveTab('sold')}
          >
            Sold/Closed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
           {displayListings.map(listing => (
             <ListingCard 
                key={listing.id} 
                listing={listing} 
                onClick={() => setSelectedListing(listing)}
                isSaved={savedListingIds.has(listing.id)}
                onSave={(e) => {
                  e.stopPropagation();
                  toggleSaved(listing.id);
                }}
             />
           ))}
        </div>
      </div>
      </div>
    </div>
  );
}
