import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, SlidersHorizontal, MapPin, X, ChevronDown, Loader as Loader2 } from 'lucide-react';
import { Listing } from '../types';
import { ListingCard } from './FeedView';
import { useAppContext } from '../App';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '../lib/supabase';

const LOCATIONS = [
  'Freetown', 'Goderich', 'Murray Town', 'Aberdeen', 'Lumley',
  'Wilberforce', 'Tengbeh Town', 'Hill Station', 'Brookfields', 'Congo Town',
  'Wellington', 'Kissy', 'Allen Town', 'Waterloo', 'Kenema', 'Bo', 'Makeni',
];

interface Filters {
  query: string;
  type: 'all' | 'property' | 'service';
  category: 'all' | 'rent' | 'buy' | 'land';
  location: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
}

const DEFAULT_FILTERS: Filters = {
  query: '',
  type: 'all',
  category: 'all',
  location: '',
  minPrice: '',
  maxPrice: '',
  minBedrooms: '',
};

export default function SearchView() {
  const { setSelectedListing, savedListingIds, toggleSaved } = useAppContext();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isQueryFocused, setIsQueryFocused] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles!listings_user_id_fkey(full_name, is_verified, phone_number, avatar_url)`)
      .eq('status', 'active')
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error && data) setAllListings(data as any as Listing[]);
    setIsLoading(false);
  };

  const saveSearch = (q: string) => {
    if (!q.trim()) return;
    const next = [q.trim(), ...recentSearches.filter(s => s !== q.trim())].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem('recentSearches', JSON.stringify(next));
  };

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters(f => ({ ...f, [key]: val }));

  const results = allListings.filter(l => {
    const q = filters.query.toLowerCase();
    if (q && !l.title.toLowerCase().includes(q) && !l.location_name.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false;
    if (filters.type !== 'all' && l.listing_type !== filters.type) return false;
    if (filters.category !== 'all' && l.category !== filters.category) return false;
    if (filters.location && !l.location_name.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && l.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && l.price > parseFloat(filters.maxPrice)) return false;
    if (filters.minBedrooms && (l.bedrooms ?? 0) < parseInt(filters.minBedrooms)) return false;
    return true;
  });

  const activeFilterCount = [
    filters.type !== 'all',
    filters.category !== 'all',
    !!filters.location,
    !!filters.minPrice,
    !!filters.maxPrice,
    !!filters.minBedrooms,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white px-4 pt-12 md:pt-6 pb-4 shadow-sm sticky top-0 z-20">
        <h1 className="md:hidden text-2xl font-bold tracking-tight text-slate-800 mb-4">Discover</h1>

        {/* Search Input */}
        <div className="relative mb-3">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search area, property type, service..."
            value={filters.query}
            onChange={e => setFilter('query', e.target.value)}
            onFocus={() => setIsQueryFocused(true)}
            onBlur={() => setTimeout(() => setIsQueryFocused(false), 150)}
            onKeyDown={e => { if (e.key === 'Enter') { saveSearch(filters.query); e.currentTarget.blur(); } }}
            className="w-full bg-slate-100 rounded-2xl py-3.5 pl-11 pr-10 text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-shadow text-sm"
          />
          {filters.query && (
            <button onClick={() => setFilter('query', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
          <AnimatePresence>
            {isQueryFocused && recentSearches.length > 0 && !filters.query && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(s => (
                    <button key={s} onClick={() => { setFilter('query', s); saveSearch(s); }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Row */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Type Chips */}
          {(['all', 'property', 'service'] as const).map(t => (
            <FilterChip key={t} label={t === 'all' ? 'All' : t === 'property' ? 'Property' : 'Services'}
              active={filters.type === t} onClick={() => setFilter('type', t)} />
          ))}
          <div className="w-px bg-slate-200 shrink-0" />
          {/* Category Chips (property only) */}
          {(filters.type !== 'service') && (['all', 'rent', 'buy', 'land'] as const).map(c => (
            <FilterChip key={c} label={c === 'all' ? 'Any' : c === 'rent' ? 'Rent' : c === 'buy' ? 'Sale' : 'Land'}
              active={filters.category === c} onClick={() => setFilter('category', c)} />
          ))}
          <div className="w-px bg-slate-200 shrink-0" />
          {/* Advanced Filters Button */}
          <button onClick={() => setShowFilters(true)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeFilterCount > 0 ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={22} /> Loading...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {results.length} {results.length === 1 ? 'Result' : 'Results'}
              </p>
              {(filters.query || activeFilterCount > 0) && (
                <button onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <SearchIcon size={40} className="mb-3 opacity-20" />
                <p className="font-semibold text-sm">No listings match your filters</p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-3 text-sky-500 text-sm font-bold">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                <AnimatePresence>
                  {results.map(listing => (
                    <ListingCard key={listing.id} listing={listing}
                      onClick={() => setSelectedListing(listing)}
                      isSaved={savedListingIds.has(listing.id)}
                      onSave={e => { e.stopPropagation(); toggleSaved(listing.id); }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Advanced Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <FiltersDrawer
            filters={filters}
            onChange={setFilter}
            onClear={() => setFilters(DEFAULT_FILTERS)}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${active ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
      {label}
    </button>
  );
}

function FiltersDrawer({ filters, onChange, onClear, onClose }: {
  filters: Filters;
  onChange: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white rounded-t-3xl w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-900">Advanced Filters</h2>
          <div className="flex items-center gap-3">
            <button onClick={onClear} className="text-sm font-bold text-rose-400 hover:text-rose-500">Clear all</button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Location */}
          <FilterSection label="Location">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={filters.location} onChange={e => onChange('location', e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white appearance-none">
                <option value="">Any location</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection label="Price Range (NLE)">
            <div className="flex gap-3">
              <input type="number" placeholder="Min" value={filters.minPrice}
                onChange={e => onChange('minPrice', e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30" />
              <span className="self-center text-slate-400 font-bold">–</span>
              <input type="number" placeholder="Max" value={filters.maxPrice}
                onChange={e => onChange('maxPrice', e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30" />
            </div>
          </FilterSection>

          {/* Bedrooms (property only) */}
          {filters.type !== 'service' && (
            <FilterSection label="Minimum Bedrooms">
              <div className="flex gap-2">
                {['', '1', '2', '3', '4', '5'].map(n => (
                  <button key={n} onClick={() => onChange('minBedrooms', n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${filters.minBedrooms === n ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-200 text-slate-600 hover:border-sky-300'}`}>
                    {n === '' ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}
        </div>

        <div className="px-6 pb-8">
          <button onClick={onClose}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-sky-500/20">
            Show Results
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      {children}
    </div>
  );
}
