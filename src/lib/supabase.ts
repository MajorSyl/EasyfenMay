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
    profiles: mockProfile
  }
];

const mockUser = { id: '123-abc', email: 'user@example.com' };

const createQueryBuilder = (table: string, baseData: any[]) => {
  let isSingle = false;

  const builder = {
    select: (columns?: string) => builder,
    eq: (column: string, value: any) => {
       isSingle = true;
       return builder;
    },
    in: (column: string, values: any[]) => builder,
    order: (column: string, options?: any) => builder,
    single: () => {
       isSingle = true;
       return builder;
    },
    then: function<TResult1 = any, TResult2 = never>(
      resolve?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      reject?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
      const result = { data: isSingle ? (baseData[0] || null) : baseData, error: null };
      return Promise.resolve(result).then(resolve, reject);
    },
    insert: async (data: any) => ({ error: null }),
    update: async (data: any) => ({ error: null }),
    delete: () => builder
  };
  
  return builder as any;
};

export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: { user: mockUser } } }),
    onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getUser: async () => ({ data: { user: mockUser } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async (email: string, options?: any) => ({ error: null }),
    signInWithPassword: async (credentials: any) => ({ error: null }),
    signUp: async (credentials: any) => ({ error: null })
  },
  from: (table: string) => {
    let dataToReturn: any[] = [];
    if (table === 'listings') dataToReturn = mockListings;
    if (table === 'profiles') dataToReturn = [mockProfile];
    return createQueryBuilder(table, dataToReturn);
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?fit=crop&w=800' } })
    })
  }
};
