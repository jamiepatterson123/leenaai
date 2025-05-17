
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackEvent } from './utils/metaPixel'

// Track initial page view
if (typeof window !== 'undefined') {
  // Facebook Pixel tracking
  if ((window as any).fbq) {
    trackEvent('PageView');
  }
  
  // PostHog tracking
  if ((window as any).posthog) {
    (window as any).posthog.capture('PageView');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
