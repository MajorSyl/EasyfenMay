import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, MapPin } from 'lucide-react';
import { Listing } from '../types';
import { ListingCard } from './FeedView';
import { useAppContext } from '../App';
import { AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function SearchView() {
  const { setSelectedListing, savedListingIds, toggleSaved } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [allListings, setAllListings] = useState<Listing[]>([]);
  
  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles ( full_name, is_verified, phone_number )
        `);
      if (!error && data) {
        setAllListings(data as any as Listing[]);
      }
    };
    fetchListings();
  }, []);

  // Simple client-side search matching
  const results = allListings.filter(item => 
    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.location_name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (budget === '' || item.price <= parseInt(budget))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 pt-12 pb-6 shadow-sm z-10 sticky top-0 relative">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-6">Discover</h1>
        
        {/* Deep Search Input Block */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <SearchIcon size={20} />
            </div>
            <input
              type="text"
              placeholder="Search Goderich, Plumbers, Lands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-shadow"
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-3">
             <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="font-bold text-xs p-1">NLE</span>
                </div>
                <input
                  type="number"
                  placeholder="Max Budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-shadow"
                />
             </div>
             <button className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:bg-slate-200 transition-colors">
               <SlidersHorizontal size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
         <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
           {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
         </p>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
            <AnimatePresence>
              {results.map(listing => (
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
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
