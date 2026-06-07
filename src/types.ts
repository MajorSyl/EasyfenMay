import React from 'react';

// Types for our app
export type UserRole = 'buyer' | 'agent' | 'service_provider';
export type ListingType = 'property' | 'service' | 'hotel';
export type ListingStatus = 'active' | 'sold' | 'rented' | 'inactive';
export type PaymentMethod = 'orange_money' | 'afrimoney' | 'card';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  listing_type: ListingType;
  title: string;
  description: string;
  price: number;
  location_name: string;
  images: string[];
  is_premium: boolean;
  views_count: number;
  inquiries_count: number;
  status: ListingStatus;
  created_at: string;
  // Property specific
  category?: string;
  bedrooms?: number;
  bathrooms?: number;
  land_size?: string;
  // Service specific
  service_type?: string;
  rate_type?: string;
  years_experience?: number;
  license_number?: string;
  // Hotel specific
  amenities?: string[];
  room_type?: string;
  hotel_rating?: number;
  // Included relations for UI
  profiles?: Profile;
}

// Global state context for our simple router
export type ViewState = 'home' | 'search' | 'add' | 'saved' | 'profile' | 'messages' | 'dashboard' | 'admin';

interface AppState {
  currentView: ViewState;
  selectedListing: Listing | null;
  savedListingIds: Set<string>;
}
