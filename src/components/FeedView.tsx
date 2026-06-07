import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Eye, BadgeCheck, CheckCircle2, Search, User, Star, Briefcase, Handshake, Heart, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../App';
import { Listing } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { mockListings } from '../lib/dataStore';

export default function FeedView() {
  const { setSelectedListing, savedListingIds, toggleSaved, setCurrentView } = useAppContext();
  const [mainTab, setMainTab] = useState<'property' | 'service' | 'hotel'>('property');
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'rent' | 'buy' | 'land' | 'short_term'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'professional' | 'company'>('all');
  const [hotelFilter, setHotelFilter] = useState<'all' | 'rooms' | 'suites'>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      // Stream data from local memory state
      await new Promise(resolve => setTimeout(resolve, 600));
      setListings(mockListings);
    } catch (error) {
      console.error(error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter listings based on the active tabs
  const filteredListings = listings.filter(item => {
    if (mainTab === 'property') {
      if (item.listing_type !== 'property') return false;
      if (propertyFilter === 'all') return true;
      if (propertyFilter === 'rent') return item.category === 'rent';
      if (propertyFilter === 'buy') return item.category === 'buy';
      if (propertyFilter === 'land') return item.category === 'land';
      if (propertyFilter === 'short_term') return item.category === 'short_term';
      return true;
    } else if (mainTab === 'service') {
      if (item.listing_type !== 'service') return false;
      // In a real app we would check if the provider is a professional or company
      // For now, let's just show all or mock it
      if (serviceFilter === 'all') return true;
      // mock filter based on full_name having 'Company' or 'LLC'
      const isCompany = item.profiles?.full_name?.toLowerCase().includes('company') || item.profiles?.full_name?.toLowerCase().includes('llc');
      if (serviceFilter === 'company') return isCompany;
      if (serviceFilter === 'professional') return !isCompany;
      return true;
    } else {
      if (item.listing_type !== 'hotel') return false;
      if (hotelFilter === 'all') return true;
      if (hotelFilter === 'rooms') return !item.room_type?.toLowerCase().includes('suite');
      if (hotelFilter === 'suites') return item.room_type?.toLowerCase().includes('suite');
      return true;
    }
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Sticky Area */}
      <div className="bg-white px-4 pt-12 md:pt-6 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="md:hidden text-2xl font-bold tracking-tight text-slate-800">Easyfen</h1>
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

        {/* Main Tabs: Properties vs Hotels vs Services */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 max-w-sm">
          <button
            onClick={() => setMainTab('property')}
            className={`flex-1 py-1.5 md:py-2 rounded-lg text-sm font-semibold transition-all ${
              mainTab === 'property' ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setMainTab('hotel')}
            className={`flex-1 py-1.5 md:py-2 rounded-lg text-sm font-semibold transition-all ${
              mainTab === 'hotel' ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Hotels
          </button>
          <button
            onClick={() => setMainTab('service')}
            className={`flex-1 py-1.5 md:py-2 rounded-lg text-sm font-semibold transition-all ${
              mainTab === 'service' ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Services
          </button>
        </div>

        {/* Interactive Filter Capsules */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {mainTab === 'property' ? (
            <>
              <FilterCapsule 
                label="All Properties" 
                isActive={propertyFilter === 'all'} 
                onClick={() => setPropertyFilter('all')} 
              />
              <FilterCapsule 
                label="For Rent" 
                isActive={propertyFilter === 'rent'} 
                onClick={() => setPropertyFilter('rent')} 
              />
              <FilterCapsule 
                label="For Sale" 
                isActive={propertyFilter === 'buy'} 
                onClick={() => setPropertyFilter('buy')} 
              />
              <FilterCapsule 
                label="Land" 
                isActive={propertyFilter === 'land'} 
                onClick={() => setPropertyFilter('land')} 
              />
              <FilterCapsule 
                label="Daily/Hourly" 
                isActive={propertyFilter === 'short_term'} 
                onClick={() => setPropertyFilter('short_term')} 
              />
            </>
          ) : mainTab === 'service' ? (
            <>
              <FilterCapsule 
                label="All Services" 
                isActive={serviceFilter === 'all'} 
                onClick={() => setServiceFilter('all')} 
              />
              <FilterCapsule 
                label="Professionals" 
                isActive={serviceFilter === 'professional'} 
                onClick={() => setServiceFilter('professional')} 
              />
              <FilterCapsule 
                label="Companies" 
                isActive={serviceFilter === 'company'} 
                onClick={() => setServiceFilter('company')} 
              />
            </>
          ) : (
            <>
              <FilterCapsule 
                label="All Hotels" 
                isActive={hotelFilter === 'all'} 
                onClick={() => setHotelFilter('all')} 
              />
              <FilterCapsule 
                label="Rooms" 
                isActive={hotelFilter === 'rooms'} 
                onClick={() => setHotelFilter('rooms')} 
              />
              <FilterCapsule 
                label="Suites" 
                isActive={hotelFilter === 'suites'} 
                onClick={() => setHotelFilter('suites')} 
              />
            </>
          )}
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
            {filteredListings.map(listing => 
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

export function ListingCard({ listing, onClick, isSaved, onSave, onEdit, onDelete }: { key?: React.Key, listing: Listing, onClick: () => void, isSaved: boolean, onSave: (e: React.MouseEvent) => void, onEdit?: (e: React.MouseEvent) => void, onDelete?: (e: React.MouseEvent) => void }) {
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
          src={listing.images?.[0] || 'https://via.placeholder.com/400x300'} 
          alt={listing.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {listing.listing_type === 'hotel' ? 'Hotel' : listing.category ? (listing.category === 'rent' ? 'Rent' : listing.category === 'buy' ? 'Sale' : listing.category === 'short_term' ? 'Hourly' : listing.category) : listing.listing_type}
            </span>
          </div>
          {listing.is_premium && (
            <div className="bg-amber-400 text-white px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
               <span className="text-xs font-bold uppercase tracking-wider">Premium</span>
            </div>
          )}
        </div>
        
        {/* Actions Overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform text-slate-700 hover:text-sky-500"
            >
              <Edit2 size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform text-slate-700 hover:text-rose-500"
            >
              <Trash2 size={18} />
            </button>
          )}
          {!onEdit && !onDelete && onSave && (
            <button 
              onClick={onSave}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <svg className={`w-5 h-5 transition-colors ${isSaved ? 'fill-sky-500 text-sky-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* View Count Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Eye size={12} />
          {listing.views_count}
        </div>
        
        {/* Photo Count Overlay */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Camera size={12} />
          {listing.images?.length || 0}
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
              NLE {listing.price?.toLocaleString() || '0'}
              {listing.rate_type === 'hourly' && <span className="text-sm text-slate-500 font-normal"> / hr</span>}
              {listing.rate_type === 'daily' && <span className="text-sm text-slate-500 font-normal"> / day</span>}
            </span>
          </div>
          
          {/* Host/Provider Avatar Section */}
          <div className="flex items-center gap-2">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {listing.listing_type === 'property' ? 'Agent' : listing.listing_type === 'hotel' ? 'Hotel' : 'Provider'}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <p className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                    {listing.profiles?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  {listing.profiles?.is_verified && <CheckCircle2 size={12} className="text-sky-500" />}
                </div>
             </div>
             <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <span className="font-bold text-slate-500 text-xs">
                  {listing.profiles?.full_name?.charAt(0) || '?'}
                </span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ServiceCard({ listing, onClick, isSaved, onSave, onEdit, onDelete }: { key?: React.Key, listing: Listing, onClick: () => void, isSaved: boolean, onSave: (e: React.MouseEvent) => void, onEdit?: (e: React.MouseEvent) => void, onDelete?: (e: React.MouseEvent) => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:shadow-md hover:border-slate-200 transition-all"
    >
      {/* Top Banner & Profile Avatar */}
      <div className="relative pt-8 px-6 pb-2 bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center">
        {/* Banner/Backdrop Color blocks */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-sky-100/50 rounded-t-2xl border-b border-sky-100/50"></div>
        
        {/* Actions Overlay */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform text-slate-700 hover:text-sky-500"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform text-slate-700 hover:text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          )}
          {!onEdit && !onDelete && onSave && (
            <button 
              onClick={onSave}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            >
              <Heart size={16} className={`transition-colors text-slate-400 ${isSaved ? 'fill-rose-500 !text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Profile Image */}
        <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-100 overflow-hidden z-20 flex items-center justify-center mt-2">
          {listing.images && listing.images.length > 0 ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-slate-400" />
          )}
        </div>
        {listing.profiles?.is_verified && (
          <div className="absolute bottom-[0.5rem] translate-x-8 z-30 bg-white rounded-full p-0.5 shadow-sm">
            <BadgeCheck size={20} className="text-sky-500 fill-white" />
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-2 text-center flex-1 flex flex-col">
        {/* Professional Details */}
        <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">
          {listing.profiles?.full_name || 'Professional'}
        </h3>
        <p className="text-sky-600 font-medium text-sm flex items-center justify-center gap-1.5 mb-3">
          <Briefcase size={14} />
          <span className="truncate">{listing.title}</span>
        </p>

        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            <span className="font-bold font-mono">4.9</span>
            <span className="opacity-70">(24)</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md text-slate-600">
            <MapPin size={12} className="text-slate-400" />
            <span className="truncate max-w-[80px]">{listing.location_name?.split(',')[0]}</span>
          </div>
        </div>

        {/* Description line clamp */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-6">
           {listing.description}
        </p>

        {/* Footer Area (Price & Action) */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Rate</span>
            <span className="text-slate-800 font-bold text-lg leading-none">
              NLE {listing.price?.toLocaleString() || '0'}
              {listing.rate_type === 'hourly' && <span className="text-xs text-slate-500 font-medium">/hr</span>}
              {listing.rate_type === 'daily' && <span className="text-xs text-slate-500 font-medium">/day</span>}
            </span>
          </div>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 active:scale-95">
            <Handshake size={16} />
            Hire
          </button>
        </div>
      </div>
    </motion.div>
  );
}

