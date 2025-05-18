
import React, { useEffect, useRef } from 'react';

export const StripeBuyButton: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Stripe Buy Button script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    // Clean up on unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full my-4">
      <stripe-buy-button
        buy-button-id="buy_btn_1RQ9CbLKGAMmFDpiLSrVEyKy"
        publishable-key="pk_live_51RP343LKGAMmFDpi6r4Qa0nZKttc0iGbVKBCd9wzq1CPUCve7eCWGVwr1a5baZlegJtiuP3oIXbNOzuHlh09O1cV006naJRvAh"
      >
      </stripe-buy-button>
    </div>
  );
};
