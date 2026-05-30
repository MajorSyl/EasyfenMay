import React from 'react';
import { HeartCrack } from 'lucide-react';
import { MOCK_LISTINGS } from '../types';
import { ListingCard } from './FeedView';
import { useAppContext } from '../App';
import { AnimatePresence, motion } from 'motion/react';

export default function SavedView() {
  const { setSelectedListing, savedListingIds, toggleSaved } = useAppContext();
  
  // Filter for saved items
  const savedListings = MOCK_LISTINGS.filter(item => savedListingIds.has(item.id));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Saved Items</h1>
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
