import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type RSVP = {
  id: string;
  created_at: string;
  name: string;
  attending: 'yes' | 'no';
  guest_count: number;
  message?: string;
};

export type GuestPhoto = {
  id: string;
  created_at: string;
  photo_url: string;
  uploaded_by?: string;
};
