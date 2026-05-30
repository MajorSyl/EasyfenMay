import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Eye, BadgeCheck, CircleCheck as CheckCircle2, Search } from 'lucide-react';
import { useAppContext } from '../App';
import { Listing } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function FeedView() {
  const { setSelectedListing, savedListingIds, toggleSaved, setCurrentView } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<'all' | 'rent' | 'buy' | 'land' | 'service'>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey ( full_name, is_verified, phone_number )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Not enough listings yet
      if (!data || data.length === 0) {
        setListings([]);
      } else {
        setListings(data as any as Listing[]);
      }
    } catch (error) {
      console.error(error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter listings based on the active tab
  const filteredListings = listings.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'service') return item.listing_type === 'service';
    if (activeFilter === 'rent') return item.category === 'rent';
    if (activeFilter === 'buy') return item.category === 'buy';
    if (activeFilter === 'land') return item.category === 'land';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Sticky Area */}
      <div className="bg-white px-4 pt-12 md:pt-6 pb-4 shadow-sm sticky top-0 z-10">
        <h1 className="md:hidden text-2xl font-bold tracking-tight text-slate-800 mb-4">Easyfen</h1>
        
        {/* Search Bar matching the Search view */}
        <div 
          className="relative mb-4 cursor-pointer active:opacity-70 transition-opacity"
          onClick={() => setCurrentView('search')}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <div className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-slate-500 font-medium text-sm flex items-center shadow-inner">
            Search properties, land, services...
          </div>
        </div>

        {/* Interactive Filter Capsules */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <FilterCapsule 
            label="All" 
            isActive={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')} 
          />
          <FilterCapsule 
            label="For Rent" 
            isActive={activeFilter === 'rent'} 
            onClick={() => setActiveFilter('rent')} 
          />
          <FilterCapsule 
            label="For Sale" 
            isActive={activeFilter === 'buy'} 
            onClick={() => setActiveFilter('buy')} 
          />
          <FilterCapsule 
            label="Land" 
            isActive={activeFilter === 'land'} 
            onClick={() => setActiveFilter('land')} 
          />
          <div className="w-px bg-slate-200 mx-1"></div>
          <FilterCapsule 
            label="Services" 
            isActive={activeFilter === 'service'} 
            onClick={() => setActiveFilter('service')} 
          />
        </div>
      </div>

      {/* Card Grid Area */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
        {isLoading ? (
           <div className="col-span-full flex flex-col items-center justify-center py-12 opacity-50">
             <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-slate-500 font-bold text-sm tracking-wide">Loading listings...</p>
           </div>
        ) : (
          <AnimatePresence>
            {filteredListings.map(listing => (
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
        )}
      </div>
    </div>
  );
}

function FilterCapsule({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
        ${isActive 
          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
    >
      {label}
    </button>
  );
}

export function ListingCard({ listing, onClick, isSaved, onSave }: { key?: React.Key, listing: Listing, onClick: () => void, isSaved: boolean, onSave: (e: React.MouseEvent) => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-200">
        <img 
          src={listing.images[0] || 'https://via.placeholder.com/400x300'} 
          alt={listing.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {listing.category ? (listing.category === 'rent' ? 'Rent' : listing.category === 'buy' ? 'Sale' : listing.category) : listing.listing_type}
            </span>
          </div>
          {listing.is_premium && (
            <div className="bg-amber-400 text-white px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
               <span className="text-xs font-bold uppercase tracking-wider">Premium</span>
            </div>
          )}
        </div>
        
        {/* Save Button Overlay */}
        <button 
          onClick={onSave}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <svg className={`w-5 h-5 transition-colors ${isSaved ? 'fill-sky-500 text-sky-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* View Count Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Eye size={12} />
          {listing.views_count}
        </div>
        
        {/* Photo Count Overlay */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Camera size={12} />
          {listing.images.length}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1 flex-1 pr-2">
            {listing.title}
          </h3>
        </div>
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{listing.location_name}</span>
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              {listing.listing_type === 'property' ? 'Price' : 'Rate'}
            </span>
            <span className="text-sky-500 font-bold text-xl leading-none">
              NLE {listing.price.toLocaleString()}
              {listing.rate_type === 'hourly' && <span className="text-sm text-slate-500 font-normal"> / hr</span>}
            </span>
          </div>
          
          {/* Host/Provider Avatar Section */}
          <div className="flex items-center gap-2">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {listing.listing_type === 'property' ? 'Agent' : 'Provider'}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <p className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                    {listing.profiles?.full_name.split(' ')[0]}
                  </p>
                  {listing.profiles?.is_verified && <CheckCircle2 size={12} className="text-sky-500" />}
                </div>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <span className="font-bold text-slate-500 text-xs">
                  {listing.profiles?.full_name.charAt(0)}
                </span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
