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
      detectSessionInUrl: false, // Changed from true to false
      storage: {
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error('Error writing to localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        }
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);