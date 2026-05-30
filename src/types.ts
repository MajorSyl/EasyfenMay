import React from 'react';

// Types for our app
export type UserRole = 'buyer' | 'agent' | 'service_provider';
export type ListingType = 'property' | 'service';
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
  // Included relations for UI
  profiles?: Profile;
}

// Global state context for our simple router
export type ViewState = 'home' | 'search' | 'add' | 'saved' | 'profile';

interface AppState {
  currentView: ViewState;
  selectedListing: Listing | null;
  savedListingIds: Set<string>;
}

// Our mock data for the UI if Supabase is not connected
export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    user_id: 'u1',
    listing_type: 'property',
    title: 'Modern 3-Bedroom House in Freetown',
    description: 'Beautifully designed modern home with ocean view. Features spacious living areas, modern kitchen, and secure compound.',
    price: 450000,
    location_name: 'Lumley, Freetown',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
    is_premium: true,
    views_count: 142,
    inquiries_count: 5,
    status: 'active',
    created_at: new Date().toISOString(),
    category: 'buy',
    bedrooms: 3,
    bathrooms: 2,
    profiles: {
      id: 'u1',
      full_name: 'Freetown Real Estate Experts',
      phone_number: '23277123456',
      role: 'agent',
      is_verified: true,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    user_id: 'u2',
    listing_type: 'service',
    title: 'Professional Plumbing Services',
    description: 'Expert plumber available for residential and commercial repairs. Fast response and quality work guaranteed.',
    price: 150,
    location_name: 'Central Freetown',
    images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80'],
    is_premium: false,
    views_count: 56,
    inquiries_count: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    service_type: 'Plumbing',
    rate_type: 'hourly',
    years_experience: 8,
    profiles: {
      id: 'u2',
      full_name: 'John Kamara',
      phone_number: '23276987654',
      role: 'service_provider',
      is_verified: true,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    user_id: 'u3',
    listing_type: 'property',
    title: 'Prime Land for Sale',
    description: '2 town lots of flat land, ready for development. Good access road and utilities nearby.',
    price: 120000,
    location_name: 'Goderich',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
    is_premium: false,
    views_count: 89,
    inquiries_count: 12,
    status: 'active',
    created_at: new Date().toISOString(),
    category: 'land',
    land_size: '2 town lots',
    profiles: {
      id: 'u3',
      full_name: 'Sarah Bangura',
      phone_number: '23279112233',
      role: 'agent',
      is_verified: false,
      created_at: new Date().toISOString()
    }
  },
  {
    id: '4',
    user_id: 'u4',
    listing_type: 'property',
    title: 'Luxury Apartment for Rent',
    description: 'Fully furnished 2-bedroom apartment in a secure compound with backup generator and water tank.',
    price: 15000,
    location_name: 'Aberdeen',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    is_premium: true,
    views_count: 210,
    inquiries_count: 15,
    status: 'active',
    created_at: new Date().toISOString(),
    category: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    profiles: {
      id: 'u4',
      full_name: 'Aberdeen Rentals',
      phone_number: '23277000111',
      role: 'agent',
      is_verified: true,
      created_at: new Date().toISOString()
    }
  }
];

export const MOCK_USER: Profile = {
  id: 'current_user',
  full_name: 'Guest User',
  phone_number: '23276000000',
  role: 'buyer',
  is_verified: false,
  created_at: new Date().toISOString()
};
