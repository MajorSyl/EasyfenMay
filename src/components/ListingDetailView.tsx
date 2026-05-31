import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, MapPin, BadgeCheck, Phone, MessageCircle, Ruler, Bed, Bath, Clock, FileText, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../App';
import { Listing } from '../types';

export default function ListingDetailView({ listing }: { listing: Listing }) {
  const { setSelectedListing } = useAppContext();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Simulate view count mutation on mount
  useEffect(() => {
    console.log(`[Mutation Simulate] Incrementing view count for ${listing.id}`);
    // In production: supabase.rpc('increment_views', { item_id: listing.id })
  }, [listing.id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('Listing link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const price = typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price;
  const phone = listing.profiles?.phone_number?.replace(/^232-?/, '') ?? '';
  const currentUrl = `https://wa.me/232${phone}?text=${encodeURIComponent(`Hi, I am interested in your Easyfen listing: ${listing.title} (NLE ${price.toLocaleString()}). Is it still available?`)}`;

  return (
    <div className="flex flex-col h-[100dvh] bg-white absolute inset-0 z-[100]">
      {/* Top Fixed Header */}
      <div className="absolute top-0 w-full z-20 flex justify-between p-4 pt-12 md:pt-6">
        <button 
          onClick={() => setSelectedListing(null)}
          className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={handleShare}
          className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-slate-800 active:scale-95 transition-transform"
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
        {/* Hero Carousel Area */}
        <div className="relative w-full max-h-[60vh] max-w-2xl mx-auto aspect-square md:aspect-[4/3] bg-slate-200 snap-x snap-mandatory overflow-x-auto flex no-scrollbar md:rounded-b-3xl md:mt-4 shadow-sm">
          {listing.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${listing.title} - ${idx + 1}`}
              className="w-full h-full object-cover shrink-0 snap-center"
            />
          ))}
          {/* Pagination dots overlay */}
          {listing.images.length > 1 && (
             <div className="absolute bottom-4 w-full flex justify-center gap-1.5 z-10">
                {listing.images.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all bg-white shadow-sm ${idx === activeImageIndex ? 'w-4 opacity-100' : 'w-1.5 opacity-50'}`} />
                ))}
             </div>
          )}
        </div>

        {/* Content Body */}
        <div className="px-5 py-6 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase tracking-wider">
              {listing.listing_type}
            </span>
            {listing.category && (
               <span className="text-xs font-medium px-2 py-1 bg-sky-50 text-sky-700 rounded capitalize">
                 {listing.category === 'rent' ? 'For Rent' : listing.category === 'buy' ? 'For Sale' : listing.category}
               </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
            {listing.title}
          </h1>
          
          <div className="flex items-center text-slate-500 mb-6">
            <MapPin size={16} className="mr-1.5 text-sky-500" />
            <span className="text-sm font-medium">{listing.location_name}</span>
          </div>
          
          <div className="bg-sky-50 rounded-2xl p-5 mb-8 flex items-end justify-between border border-sky-100/50">
            <div>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                 {listing.listing_type === 'property' ? 'Asking Price' : 'Service Rate'}
              </p>
              <p className="text-3xl font-black text-sky-600 tracking-tight">
                NLE {price.toLocaleString()}
                {listing.rate_type === 'hourly' && <span className="text-lg font-bold text-sky-400"> / hr</span>}
              </p>
            </div>
            {listing.is_premium && (
               <div className="bg-amber-400 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                 Premium
               </div>
            )}
          </div>

          {/* Dynamic Attributes Grid */}
          <h3 className="text-lg font-bold text-slate-900 mb-4">Details</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {listing.listing_type === 'property' ? (
              <>
                {listing.bedrooms && (
                  <AttributeCard icon={<Bed size={18} />} label="Bedrooms" value={listing.bedrooms} />
                )}
                {listing.bathrooms && (
                  <AttributeCard icon={<Bath size={18} />} label="Bathrooms" value={listing.bathrooms} />
                )}
                {listing.land_size && (
                  <AttributeCard icon={<Ruler size={18} />} label="Land Size" value={listing.land_size} />
                )}
              </>
            ) : (
              <>
                <AttributeCard icon={<Clock size={18} />} label="Experience" value={`${listing.years_experience} Years`} />
                {listing.license_number && (
                  <AttributeCard icon={<FileText size={18} />} label="License" value={listing.license_number} />
                )}
              </>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-8 whitespace-pre-wrap">
            {listing.description}
          </p>
          
          <h3 className="text-lg font-bold text-slate-900 mb-4">Listed By</h3>
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden mb-8">
            <div className="p-5 flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-sky-100 border-2 border-white shadow-sm flex items-center justify-center text-2xl font-black text-sky-600">
                  {listing.profiles?.full_name?.charAt(0) ?? '?'}
                </div>
                {listing.profiles?.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <BadgeCheck size={20} className="text-sky-500 fill-sky-100" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1">
                  {listing.profiles?.full_name ?? 'Unknown'}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                    {listing.profiles?.role?.replace('_', ' ') ?? 'Agent'}
                  </span>
                  <span>Joined 2026</span>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listings</p>
                    <p className="font-black text-slate-800">4 Active</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Response</p>
                    <p className="font-black text-slate-800">Fast</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" /> Identity Verified
              </p>
              <button className="text-sm font-bold text-sky-600 hover:text-sky-700">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 pb-8 flex justify-center">
        <div className="flex gap-3 w-full max-w-2xl">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xl shadow-sky-500/30 rounded-xl h-14 flex items-center justify-center font-bold text-lg transition-colors gap-2"
          >
            <MessageCircle size={22} className="fill-current text-white" />
            WhatsApp
          </a>
          <button 
            className="w-14 h-14 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold active:bg-slate-200 transition-colors"
          >
            <Phone size={22} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AttributeCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{label}</p>
        <p className="font-semibold text-slate-800 text-sm">{value}</p>
      </div>
    </div>
  );
}
