import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, MapPin, Building, Wrench, CircleDollarSign } from 'lucide-react';
import { ListingType } from '../types';

export default function AddListingForm() {
  const [listingType, setListingType] = useState<ListingType>('property');
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Conditional fields
  const [bedrooms, setBedrooms] = useState('');
  const [category, setCategory] = useState('rent');
  const [serviceType, setServiceType] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      // Stream local simulated state
      await new Promise(resolve => setTimeout(resolve, 800));

      alert('Listing created successfully! (Simulated local state)');
      
      // Reset form
      setImages([]);
      setTitle('');
      setPrice('');
      setDescription('');
      setLocation('');
      setBedrooms('');
      setServiceType('');
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while creating the listing.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 pt-10 md:pt-6 px-4 pb-24 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Listing</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Get your property or service in front of thousands.</p>
        </div>

      {/* Segmented Controller */}
      <div className="flex p-1.5 bg-slate-200/60 rounded-2xl mb-8 shadow-inner">
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all ${
            listingType === 'property' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'
          }`}
          onClick={() => setListingType('property')}
        >
          <Building size={18} /> Property
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-xl transition-all ${
            listingType === 'service' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'
          }`}
          onClick={() => setListingType('service')}
        >
          <Wrench size={18} /> Service
        </button>
      </div>

      <form onSubmit={handleSimulateSubmit} className="space-y-6">
        
        {/* Step 1: Photos */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 font-black text-sm flex items-center justify-center">1</div>
             <h2 className="font-bold text-slate-800 text-lg">Photos</h2>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-sky-50 hover:border-sky-200 hover:text-sky-500 transition-colors"
          >
            <UploadCloud size={28} className="mb-2" />
            <span className="font-semibold text-sm">Tap to upload photos</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Up to 10 images</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileChange}
          />
          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pt-4 no-scrollbar">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200">
                  <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Basic Info */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 font-black text-sm flex items-center justify-center">2</div>
             <h2 className="font-bold text-slate-800 text-lg">Details</h2>
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Modern Apartment in Lumley"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  required
                />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Price (NLE)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                       <CircleDollarSign size={16} />
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                       <MapPin size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Goderich"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                      required
                    />
                  </div>
                </div>
             </div>
             
             {/* Category specific fields */}
             {listingType === 'property' ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none"
                    >
                      <option value="rent">For Rent</option>
                      <option value="buy">For Sale</option>
                      <option value="land">Land</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Bedrooms</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 3"
                      value={bedrooms}
                      onChange={e => setBedrooms(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-400 placeholder:font-medium"
                    />
                 </div>
              </div>
            ) : (
              <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Specialization</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Plumbing, Electrician"
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-400 placeholder:font-medium"
                  />
              </div>
            )}
            
            <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea 
                  rows={4}
                  placeholder="Describe your property or service in detail..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 resize-none"
                  required
                />
            </div>

          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || images.length === 0}
          className="w-full mt-4 bg-slate-900 disabled:bg-slate-300 text-white font-bold h-14 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center transition-all active:scale-[0.98]"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Publish Listing'
          )}
        </button>
        <p className="text-center text-[10px] font-semibold text-slate-400 mt-2">
          By posting, you agree to our Community Guidelines.
        </p>

      </form>
      </div>
    </div>
  );
}
