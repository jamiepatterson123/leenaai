
import React, { useEffect, useRef } from 'react';

interface StyleWrapperProps {
  children: React.ReactNode;
}

export const StyleWrapper: React.FC<StyleWrapperProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Apply styling to all buttons inside wrapped components
    if (wrapperRef.current) {
      const buttons = wrapperRef.current.querySelectorAll('button');
      buttons.forEach(button => {
        // If the button doesn't already have the gradient class, add it
        if (!button.className.includes('bg-gradient')) {
          // Remove other background classes
          const classesToRemove = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-background'];
          classesToRemove.forEach(cls => button.classList.remove(cls));
          
          // Add gradient and font-semibold
          button.classList.add('bg-gradient-to-r', 'from-[#D946EF]', 'to-[#8B5CF6]', 'text-white', 'hover:opacity-90', 'font-semibold');
        }
      });
    }
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
};
