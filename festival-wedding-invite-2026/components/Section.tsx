
import React from 'react';

interface SectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, className = '', children }) => {
  return (
    <section 
      id={id} 
      className={`relative py-20 px-6 overflow-hidden transition-all duration-700 ${className}`}
    >
      <div className="max-w-md mx-auto animate-fade-in-up">
        {children}
      </div>
    </section>
  );
};
