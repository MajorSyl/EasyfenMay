import React, { useState, createContext, useContext, useEffect } from 'react';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
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
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set(['1'])); // Mock pre-saved
  const [showUpgrade, setShowUpgrade] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsInitializing(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSaved = (id: string) => {
    const newSaved = new Set(savedListingIds);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedListingIds(newSaved);
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
      <div className="w-full max-w-7xl mx-auto min-h-screen bg-white shadow-xl relative pb-20 overflow-hidden flex flex-col">
        
        {/* Dynamic App Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {renderContent()}
        </div>

        {/* Bottom Navigation Panel */}
        {(!selectedListing && !showUpgrade && isAuthenticated) && (
          <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex items-center justify-center pt-3 pb-safe z-50 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-around w-full max-w-md px-2 pb-3">
              <NavItem 
                icon={<Home size={24} />} 
                label="Home" 
                isActive={currentView === 'home'} 
                onClick={() => setCurrentView('home')} 
              />
              <NavItem 
                icon={<Search size={24} />} 
                label="Search" 
                isActive={currentView === 'search'} 
                onClick={() => setCurrentView('search')} 
              />
              <NavItem 
                icon={<PlusSquare size={24} />} 
                label="Add" 
                isActive={currentView === 'add'} 
                onClick={() => setCurrentView('add')} 
              />
              <NavItem 
                icon={<Heart size={24} />} 
                label="Saved" 
                isActive={currentView === 'saved'} 
                onClick={() => setCurrentView('saved')} 
              />
              <NavItem 
                icon={<User size={24} />} 
                label="Profile" 
                isActive={currentView === 'profile'} 
                onClick={() => setCurrentView('profile')} 
              />
            </div>
          </nav>
        )}
      </div>
    </AppContext.Provider>
  );
}

// Reusable Navigation Item
function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
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
