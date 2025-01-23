import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tehosjvonqxuiziqjlry.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaG9zanZvbnF4dWl6aXFqbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjcwMTIsImV4cCI6MjA1MDQ0MzAxMn0.m9fDIGxKggvlAL7SAfOwUN92cb8ZacpBrwE0vcwwU7M";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);