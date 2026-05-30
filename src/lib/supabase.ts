import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://lytwyjlmiuvjehiuzuji.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dHd5amxtaXV2amVoaXV6dWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDE4NjQsImV4cCI6MjA5NTY3Nzg2NH0.okDqhPgT45gpJpr2uJ7RhF1ABgLUfGeATcE0Ucq_aQA';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
