import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section 
      id="hero"
      className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-base-300 via-base-200 to-base-100 py-16 md:py-24"
    >
      <div className="container mx-auto px-4 text-center z-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          بلاک دیز
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-base-content/80">
          دروازه شما به دنیای رویدادهای بلاکچین در ایران و منطقه فارسی‌زبان. با بلاک‌دیز رویدادهای بلاکچین را کشف، سازماندهی و جشن بگیرید.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            className="btn btn-primary btn-lg group shadow-lg hover:shadow-xl transition-shadow duration-300"
            onClick={() => {
              // Assuming 'explore-events' is the ID of the section to scroll to
              document.getElementById('upcoming-event-section')?.scrollIntoView({ behavior: 'smooth' }); // Changed ID here
            }}
          >
            کاوش رویدادها
            {/* Optional: Icon can be added here if desired */}
          </button>
          
          <button 
            className="btn btn-outline btn-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            onClick={() => {
              document.getElementById('past-events')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            رویدادهای گذشته
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;