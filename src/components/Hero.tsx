import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section 
      id="hero" 
      className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-base-300 via-base-200 to-base-100"
    >
      <div className="container mx-auto px-4 text-center z-10 scroll-animate">
        <span className="inline-block text-sm md:text-base font-semibold text-primary mb-4 tracking-wider uppercase">
          بزرگترین رویداد بلاکچین ایران
        </span>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          بلاک دیز
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed">
          محل گردهمایی توسعه‌دهندگان و علاقه‌مندان به تکنولوژی بلاکچین
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            className="btn btn-primary btn-lg group"
            onClick={() => {
              document.getElementById('upcoming-event-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            مشاهده رویداد بعدی
            <ArrowDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
          </button>
          
          <button 
            className="btn btn-outline btn-lg"
            onClick={() => {
              document.getElementById('past-events')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            رویدادهای گذشته
          </button>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-primary" />
        </div>
      </div>
    </section>
  );
};

export default Hero;