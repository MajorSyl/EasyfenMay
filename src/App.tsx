import React, { useState, createContext, useContext, useEffect } from 'react';
import { Hop as Home, Search, SquarePlus as PlusSquare, Heart, User } from 'lucide-react';
import FeedView from './components/FeedView';
import SearchView from './components/SearchView';
import AddListingForm from './components/AddListingForm';
import SavedView from './components/SavedView';
import ProfileView from './components/ProfileView';
import ListingDetailView from './components/ListingDetailView';
import UpgradeToPremium from './components/UpgradeToPremium';
import AuthView from './components/AuthView';
import { Listing, ViewState } from './types';
import { supabase } from './lib/supabase';

interface AppContextType {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  savedListingIds: Set<string>;
  toggleSaved: (id: string) => void;
  showUpgrade: boolean;
  setShowUpgrade: (show: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  const [showUpgrade, setShowUpgrade] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const loadSavedListings = async (userId: string) => {
    const { data } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId);
    if (data) {
      setSavedListingIds(new Set(data.map((r: any) => r.listing_id)));
    }
  };

  useEffect(() => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setIsInitializing(false);
      }
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        setIsAuthenticated(!!session);
        setIsInitializing(false);
        if (session?.user) loadSavedListings(session.user.id);
      }
    }).catch(() => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        setIsInitializing(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        loadSavedListings(session.user.id);
      } else {
        setSavedListingIds(new Set());
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const toggleSaved = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSaved = new Set(savedListingIds);
    if (newSaved.has(id)) {
      newSaved.delete(id);
      setSavedListingIds(newSaved);
      await supabase.from('saved_listings').delete()
        .eq('user_id', user.id).eq('listing_id', id);
    } else {
      newSaved.add(id);
      setSavedListingIds(newSaved);
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id });
    }
  };

  const contextValue = {
    currentView,
    setCurrentView,
    selectedListing,
    setSelectedListing,
    savedListingIds,
    toggleSaved,
    showUpgrade,
    setShowUpgrade,
    isAuthenticated,
    setIsAuthenticated
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Render main content area
  const renderContent = () => {
    if (!isAuthenticated) return <AuthView onLogin={() => setIsAuthenticated(true)} />;
    if (showUpgrade) return <UpgradeToPremium />;
    if (selectedListing) return <ListingDetailView listing={selectedListing} />;

    switch (currentView) {
      case 'home': return <FeedView />;
      case 'search': return <SearchView />;
      case 'add': return <AddListingForm />;
      case 'saved': return <SavedView />;
      case 'profile': return <ProfileView />;
      default: return <FeedView />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {/* Responsive workspace boundary */}
      <div className="w-full min-h-screen bg-slate-50 md:bg-slate-100 flex justify-center">
        <div className="w-full max-w-7xl mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col md:flex-row">
          
          {/* Side Navigation Panel (Desktop) */}
          {(!selectedListing && !showUpgrade && isAuthenticated) && (
            <aside className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-white z-50 py-8 px-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
              <div className="mb-10 pl-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Easyfen</h1>
              </div>
              <div className="flex flex-col gap-2">
                <DesktopNavItem 
                  icon={<Home size={22} />} 
                  label="Home" 
                  isActive={currentView === 'home'} 
                  onClick={() => setCurrentView('home')} 
                />
                <DesktopNavItem 
                  icon={<Search size={22} />} 
                  label="Search" 
                  isActive={currentView === 'search'} 
                  onClick={() => setCurrentView('search')} 
                />
                <DesktopNavItem 
                  icon={<PlusSquare size={22} />} 
                  label="Add Listing" 
                  isActive={currentView === 'add'} 
                  onClick={() => setCurrentView('add')} 
                />
                <DesktopNavItem 
                  icon={<Heart size={22} />} 
                  label="Saved" 
                  isActive={currentView === 'saved'} 
                  onClick={() => setCurrentView('saved')} 
                />
                <DesktopNavItem 
                  icon={<User size={22} />} 
                  label="Profile" 
                  isActive={currentView === 'profile'} 
                  onClick={() => setCurrentView('profile')} 
                />
              </div>
            </aside>
          )}

          {/* Dynamic App Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-20 md:pb-0 relative">
            {renderContent()}
          </div>

          {/* Bottom Navigation Panel (Mobile) */}
          {(!selectedListing && !showUpgrade && isAuthenticated) && (
            <nav className="md:hidden absolute bottom-0 w-full bg-white border-t border-gray-100 flex items-center justify-center pt-3 pb-safe z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-around w-full max-w-md px-2 pb-3">
                <MobileNavItem 
                  icon={<Home size={24} />} 
                  label="Home" 
                  isActive={currentView === 'home'} 
                  onClick={() => setCurrentView('home')} 
                />
                <MobileNavItem 
                  icon={<Search size={24} />} 
                  label="Search" 
                  isActive={currentView === 'search'} 
                  onClick={() => setCurrentView('search')} 
                />
                <MobileNavItem 
                  icon={<PlusSquare size={24} />} 
                  label="Add" 
                  isActive={currentView === 'add'} 
                  onClick={() => setCurrentView('add')} 
                />
                <MobileNavItem 
                  icon={<Heart size={24} />} 
                  label="Saved" 
                  isActive={currentView === 'saved'} 
                  onClick={() => setCurrentView('saved')} 
                />
                <MobileNavItem 
                  icon={<User size={24} />} 
                  label="Profile" 
                  isActive={currentView === 'profile'} 
                  onClick={() => setCurrentView('profile')} 
                />
              </div>
            </nav>
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}

// Reusable Desktop Navigation Item
function DesktopNavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-sky-50 text-sky-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-semibold'}`}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="text-sm tracking-wide">
        {label}
      </span>
    </button>
  );
}

// Reusable Mobile Navigation Item
function MobileNavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-16 transition-colors duration-200  ${isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium tracking-wide">
        {label}
      </span>
    </button>
  );
}
