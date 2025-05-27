import React, { useState, useEffect } from 'react';
// Removed ArrowDown as it's not used in the dynamic version
import { fetchContent } from '../utils/api';

interface HeroConfig {
  title: string;
  subtitle: string;
  ctaButton1: { text: string; targetSectionId: string };
  ctaButton2: { text: string; targetSectionId: string };
}

const Hero: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchContent<HeroConfig>('hero.json');
        setHeroData(data);
      } catch (e) {
        console.error("Failed to fetch hero.json:", e);
        setError('Failed to load hero content.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const idToScroll = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
    const section = document.getElementById(idToScroll);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Section with ID "${idToScroll}" not found.`);
    }
  };

  if (isLoading) {
    return (
      <section id="hero" className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-base-300 via-base-200 to-base-100 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl font-bold">Loading Hero...</h1>
        </div>
      </section>
    );
  }

  if (error || !heroData) {
    return (
      <section id="hero" className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-base-300 via-base-200 to-base-100 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Welcome to BlockDays
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-base-content/80">
            Discover amazing blockchain events. (Error loading content)
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn btn-primary btn-lg">Explore Events</button>
            <button className="btn btn-outline btn-lg">Learn More</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="hero"
      className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-base-300 via-base-200 to-base-100 py-16 md:py-24"
    >
      <div className="container mx-auto px-4 text-center z-10">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          {heroData.title}
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-base-content/80">
          {heroData.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {heroData.ctaButton1?.text && heroData.ctaButton1?.targetSectionId && (
            <button 
              className="btn btn-primary btn-lg group shadow-lg hover:shadow-xl transition-shadow duration-300"
              onClick={() => scrollToSection(heroData.ctaButton1.targetSectionId)}
            >
              {heroData.ctaButton1.text}
            </button>
          )}
          
          {heroData.ctaButton2?.text && heroData.ctaButton2?.targetSectionId && (
            <button 
              className="btn btn-outline btn-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              onClick={() => scrollToSection(heroData.ctaButton2.targetSectionId)}
            >
              {heroData.ctaButton2.text}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;