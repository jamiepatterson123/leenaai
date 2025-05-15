
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackEvent } from './utils/metaPixel'

// Track initial page view
if (typeof window !== 'undefined' && (window as any).fbq) {
  trackEvent('PageView');
}

createRoot(document.getElementById("root")!).render(<App />);
