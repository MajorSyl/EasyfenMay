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
  avatar_url: string | null;
  bio: string;
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

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  agent_id: string;
  last_message_at: string;
  created_at: string;
  // Joins
  listing?: Pick<Listing, 'id' | 'title' | 'images' | 'price' | 'location_name'>;
  buyer?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  agent?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  last_message?: string;
}

export interface Rating {
  id: string;
  listing_id: string;
  rater_id: string;
  rated_user_id: string;
  stars: number;
  comment: string;
  created_at: string;
  rater?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

// Global state context for our simple router
export type ViewState = 'home' | 'search' | 'add' | 'saved' | 'profile' | 'messages';

interface AppState {
  currentView: ViewState;
  selectedListing: Listing | null;
  savedListingIds: Set<string>;
}
