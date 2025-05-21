import React, { useState, useEffect, useRef } from 'react';
import { fetchContent } from '../utils/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'financial' | 'moral' | 'media';
  website: string;
}

const Sponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Refs for carousel wrappers
  const financialRef = useRef<HTMLDivElement>(null);
  const moralRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<Sponsor[]>('sponsors.json');
        setSponsors(data);
      } catch (err) {
        console.error('Failed to load sponsors:', err);
        setError('خطا در بارگذاری حامیان');
      } finally {
        setIsLoading(false);
      }
    };

    loadSponsors();
  }, []);

  const handleCarouselScroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    
    const scrollAmount = 300;
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Group sponsors by type
  const financialSponsors = sponsors.filter(s => s.type === 'financial');
  const moralSponsors = sponsors.filter(s => s.type === 'moral');
  const mediaSponsors = sponsors.filter(s => s.type === 'media');

  // If no sponsors at all, hide the section
  if ((sponsors.length === 0 && !isLoading) || error) {
    return null;
  }

  if (isLoading) {
    return (
      <section id="sponsors" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  const createSponsorCarousel = (
    title: string,
    sponsorsList: Sponsor[],
    ref: React.RefObject<HTMLDivElement>
  ) => {
    if (sponsorsList.length === 0) return null;
    
    return (
      <div className="mb-16 last:mb-0">
        <h3 className="text-2xl font-bold mb-6">{title}</h3>
        
        <div className="relative">
          {/* Carousel navigation */}
          <button 
            className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 btn btn-circle btn-sm"
            onClick={() => handleCarouselScroll(ref, 'left')}
            aria-label="Previous"
          >
            <ChevronRight size={18} />
          </button>
          
          <button 
            className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 btn btn-circle btn-sm"
            onClick={() => handleCarouselScroll(ref, 'right')}
            aria-label="Next"
          >
            <ChevronLeft size={18} />
          </button>
          
          {/* Sponsors carousel */}
          <div 
            ref={ref}
            className="flex overflow-x-auto gap-6 py-4 px-10 no-scrollbar"
          >
            {sponsorsList.map(sponsor => (
              <a 
                key={sponsor.id} 
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-base-200 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[180px] w-[180px] h-[120px] flex items-center justify-center"
              >
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.name}
                  className="max-w-full max-h-full object-contain transition-transform hover:scale-110"
                  onError={(e) => {
                    // Fallback for logo
                    (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="sponsors" className="py-20 bg-base-100 scroll-animate">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">حامیان ما</h2>
        
        {createSponsorCarousel('حامیان مالی', financialSponsors, financialRef)}
        {createSponsorCarousel('حامیان معنوی', moralSponsors, moralRef)}
        {createSponsorCarousel('حامیان رسانه‌ای', mediaSponsors, mediaRef)}
      </div>
    </section>
  );
};

export default Sponsors;