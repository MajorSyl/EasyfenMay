import React, { useState, useEffect } from 'react';
import { HeartCrack, User } from 'lucide-react';
import { Listing } from '../types';
import { ListingCard } from './FeedView';
import { useAppContext } from '../App';
import { AnimatePresence, motion } from 'motion/react';
import { mockListings } from '../lib/dataStore';

export default function SavedView() {
  const { setSelectedListing, savedListingIds, toggleSaved, setCurrentView } = useAppContext();
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSavedListings = async () => {
      setIsLoading(true);
      if (savedListingIds.size === 0) {
        setSavedListings([]);
        setIsLoading(false);
        return;
      }
      
      const ids = Array.from(savedListingIds);
      // Mock network delay and filtering
      await new Promise(r => setTimeout(r, 200));
      const mySaved = mockListings.filter(l => ids.includes(l.id));
      
      setSavedListings(mySaved);
      setIsLoading(false);
    };
    
    fetchSavedListings();
  }, [savedListingIds]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 pt-12 md:pt-6 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <h1 className="md:hidden text-2xl font-bold tracking-tight text-slate-800">Saved Items</h1>
          <div 
             className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center cursor-pointer border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:opacity-80 transition-opacity ml-auto active:scale-95"
             onClick={() => setCurrentView('profile')}
             title="View Profile"
          >
             <User size={20} className="text-sky-600" />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
         {savedListings.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-60">
              <HeartCrack size={64} className="text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">No saved listings yet</h2>
              <p className="text-slate-500 text-sm">When you find something you like, tap the heart icon to save it here.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
              <AnimatePresence>
                {savedListings.map(listing => (
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
         )}
      </div>
    </div>
  );
}
