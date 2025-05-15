
/// <reference types="vite/client" />

import type { AuthChangeEvent } from "@supabase/supabase-js";

// Extend the global Window interface to include Tawk_API
declare global {
  interface Window {
    Tawk_API?: {
      toggle: () => void;
      maximize: () => void;
      minimize: () => void;
    }
  }
}
