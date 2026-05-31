import { Listing, Profile } from '../types';

export const mockProfile: Profile = {
  id: '123-abc',
  full_name: 'Test Agent',
  phone_number: '23277000000',
  role: 'agent',
  is_verified: true,
  created_at: new Date().toISOString()
};

export const mockListings: Listing[] = [
  {
    id: '1',
    user_id: '123-abc',
    listing_type: 'property',
    title: 'Modern 3 Bedroom Apartment',
    description: 'Beautiful modern apartment in the heart of Freetown.',
    price: 5000,
    location_name: 'Lumley, Freetown',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=800'],
    is_premium: true,
    views_count: 142,
    inquiries_count: 5,
    status: 'active',
    created_at: new Date().toISOString(),
    category: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    profiles: mockProfile
  },
  {
    id: '2',
    user_id: '123-abc',
    listing_type: 'service',
    title: 'Professional Plumbing Services',
    description: 'Expert plumbing across Western Area.',
    price: 150,
    location_name: 'Freetown',
    images: ['https://images.unsplash.com/photo-1607472586893-edb57cbce4ea?fit=crop&w=800'],
    is_premium: false,
    views_count: 85,
    inquiries_count: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    service_type: 'home_maintenance',
    rate_type: 'hourly',
    profiles: { ...mockProfile, full_name: 'John Doe Plumbing' }
  },
  {
    id: '3',
    user_id: '999-xyz',
    listing_type: 'service',
    title: 'Acme Cleaning LLC',
    description: 'Corporate and residential cleaning services.',
    price: 500,
    location_name: 'Western Area',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?fit=crop&w=800'],
    is_premium: true,
    views_count: 231,
    inquiries_count: 12,
    status: 'active',
    created_at: new Date().toISOString(),
    service_type: 'cleaning',
    rate_type: 'fixed',
    profiles: { ...mockProfile, full_name: 'Acme Cleaning LLC', is_verified: true }
  },
  {
    id: '4',
    user_id: '123-abc',
    listing_type: 'property',
    title: 'Cozy Beachfront Studio (Hourly/Daily)',
    description: 'Perfect for quick getaways or hourly photoshoots.',
    price: 15,
    location_name: 'Aberdeen Beach',
    images: ['https://images.unsplash.com/photo-1499955085172-a104c9463ece?fit=crop&w=800'],
    is_premium: true,
    views_count: 532,
    inquiries_count: 12,
    status: 'active',
    created_at: new Date().toISOString(),
    category: 'short_term',
    bedrooms: 1,
    bathrooms: 1,
    rate_type: 'hourly',
    profiles: mockProfile
  }
];

export const mockUser = { id: '123-abc', email: 'user@example.com' };
