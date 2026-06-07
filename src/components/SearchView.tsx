import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, MapPin, User, MessageSquare } from 'lucide-react';
import { Listing } from '../types';
import { ListingCard, ServiceCard } from './FeedView';
import { useAppContext } from '../App';
import { AnimatePresence, motion } from 'motion/react';
import { mockListings } from '../lib/dataStore';

export default function SearchView() {
  const { setSelectedListing, savedListingIds, toggleSaved, setCurrentView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  useEffect(() => {
    const fetchListings = async () => {
      // Stream local data
      await new Promise(r => setTimeout(r, 400));
      setAllListings(mockListings);
    };
    fetchListings();

    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Could not parse recent searches", e);
      }
    }
  }, []);

  const saveSearch = (query: string) => {
    if (query.trim() === '') return;
    const newSearches = [query.trim(), ...recentSearches.filter(s => s !== query.trim())].slice(0, 3);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  const handleChipClick = (query: string) => {
    setSearchQuery(query);
    saveSearch(query);
  };

  // Simple client-side search matching
  const results = allListings.filter(item => 
    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.location_name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (budget === '' || item.price <= parseInt(budget))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 pt-12 md:pt-6 pb-6 shadow-sm z-20 sticky top-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="md:hidden text-2xl font-bold tracking-tight text-slate-800">Discover</h1>
          <div className="flex items-center gap-3 ml-auto">
             <div 
                className="relative w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-slate-200 transition-colors active:scale-95"
                onClick={() => setCurrentView('messages')}
                title="Messages"
             >
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white z-10"></div>
                <MessageSquare size={18} className="text-slate-600" />
             </div>
             <div 
                className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center cursor-pointer border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:opacity-80 transition-opacity active:scale-95"
                onClick={() => setCurrentView('profile')}
                title="View Profile"
             >
                <User size={20} className="text-sky-600" />
             </div>
          </div>
        </div>
        
        {/* Deep Search Input Block */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <SearchIcon size={20} />
            </div>
            <input
              type="text"
              placeholder="Search Goderich, Plumbers, Hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveSearch(searchQuery);
                  e.currentTarget.blur();
                }
              }}
              className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-shadow"
            />
            
            <AnimatePresence>
              {isSearchFocused && recentSearches.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-wrap gap-2 z-50"
                >
                  <p className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recent Searches</p>
                  {recentSearches.map(query => (
                    <button
                      key={query}
                      onClick={() => handleChipClick(query)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-3 relative z-10">
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
              {results.map(listing => 
                listing.listing_type === 'service' ? (
                  <ServiceCard 
                    key={listing.id} 
                    listing={listing}
                    onClick={() => setSelectedListing(listing)}
                    isSaved={savedListingIds.has(listing.id)}
                    onSave={(e) => {
                      e.stopPropagation();
                      toggleSaved(listing.id);
                    }}
                  />
                ) : (
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
                )
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
