import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from './database.types';

export const createServer = () => {
  return createServerComponentClient<Database>({ cookies });
};

// Use this strictly for protected server operations (like file uploads) 
// that bypass RLS. Never pass this client to the browser.
export const createServiceRoleClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
