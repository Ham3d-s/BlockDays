import React, { useState, useEffect, useRef, MouseEvent } from 'react'; // Added useRef, MouseEvent
import { fetchContent } from '../utils/api';
import { Handshake } from 'lucide-react';

// Updated Sponsor Interface
interface SponsorEntry {
  id: string;
  name: string;
  logo: string; // URL to the logo
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Community';
  description: string; // Brief description or contribution
  websiteUrl: string; // Link to sponsor's website
}

const DEMO_MODE = false; // Enable to use hardcoded demo sponsors

const DEMO_SPONSORS: SponsorEntry[] = [
  // Platinum
  { id: 'p1', name: 'صرافی پیشرو ایران', logo: '/images/sponsors/platinum-logo-1.svg', tier: 'Platinum', description: 'پیشرو در ارائه خدمات نوین تبادل رمزارز در ایران با بالاترین استانداردهای امنیتی.', websiteUrl: 'https://example-platinum1.com' },
  { id: 'p2', name: 'فناوری‌های بلاکچین آینده', logo: '/images/sponsors/platinum-logo-2.svg', tier: 'Platinum', description: 'توسعه‌دهنده راه‌حل‌های سازمانی مبتنی بر بلاکچین برای صنایع مختلف.', websiteUrl: 'https://example-platinum2.com' },
  // Gold
  { id: 'g1', name: 'آکادمی بلاکچین ایران', logo: '/images/sponsors/gold-logo-1.svg', tier: 'Gold', description: 'مرکز تخصصی آموزش و پژوهش در حوزه بلاکچین و رمزارزها.', websiteUrl: 'https://example-gold1.com' },
  { id: 'g2', name: 'کیف پول امن دیجیتال', logo: '/images/sponsors/gold-logo-2.svg', tier: 'Gold', description: 'ارائه‌دهنده راه‌کارهای امن نگهداری دارایی‌های دیجیتال.', websiteUrl: 'https://example-gold2.com' },
  { id: 'g3', name: 'سرمایه‌گذاری جسورانه کریپتو', logo: '/images/sponsors/gold-logo-3.svg', tier: 'Gold', description: 'صندوق سرمایه‌گذاری خطرپذیر متخصص در پروژه‌های نوآورانه بلاکچینی.', websiteUrl: 'https://example-gold3.com' },
  // Silver
  { id: 's1', name: 'استودیو بازی‌سازی وب۳', logo: '/images/sponsors/silver-logo-1.svg', tier: 'Silver', description: 'خلق تجربه‌های نوین بازی با استفاده از تکنولوژی بلاکچین و NFT.', websiteUrl: 'https://example-silver1.com' },
  { id: 's2', name: 'پلتفرم وام‌دهی دیفای', logo: '/images/sponsors/silver-logo-2.svg', tier: 'Silver', description: 'ارائه خدمات وام‌دهی غیرمتمرکز با استفاده از قراردادهای هوشمند.', websiteUrl: 'https://example-silver2.com' },
  { id: 's3', name: 'مشاوره حقوقی رمزارز', logo: '/images/sponsors/silver-logo-3.svg', tier: 'Silver', description: 'ارائه خدمات مشاوره حقوقی تخصصی در حوزه رمزارزها و بلاکچین.', websiteUrl: 'https://example-silver3.com' },
  { id: 's4', name: 'رسانه خبری بلاکچین', logo: '/images/sponsors/silver-logo-4.svg', tier: 'Silver', description: 'پوشش آخرین اخبار و تحلیل‌های دنیای بلاکچین و ارزهای دیجیتال.', websiteUrl: 'https://example-silver4.com' },
  // Community
  { id: 'c1', name: 'انجمن بلاکچین ایران', logo: '/images/sponsors/community-logo-1.svg', tier: 'Community', description: 'حمایت از رشد و توسعه جامعه بلاکچین در ایران.', websiteUrl: 'https://example-community1.com' },
  { id: 'c2', name: 'گروه توسعه‌دهندگان اتریوم تهران', logo: '/images/sponsors/community-logo-2.svg', tier: 'Community', description: 'برگزاری میت‌آپ‌ها و کارگاه‌های آموزشی برای توسعه‌دهندگان.', websiteUrl: 'https://example-community2.com' },
  // Adding more demo sponsors to reach at least 18 for the 3x6 grid if possible
  { id: 'p3', name: 'پلتفرم معاملاتی نوین', logo: '/images/sponsors/platinum-logo-3.svg', tier: 'Platinum', description: 'ارائه دهنده پلتفرم پیشرفته برای معاملات رمزارز.', websiteUrl: 'https://example-platinum3.com' },
  { id: 'g4', name: 'مرکز نوآوری بلاکچین', logo: '/images/sponsors/gold-logo-4.svg', tier: 'Gold', description: 'حمایت از استارتاپ های بلاکچینی.', websiteUrl: 'https://example-gold4.com' },
  { id: 's5', name: 'خدمات احراز هویت دیجیتال', logo: '/images/sponsors/silver-logo-5.svg', tier: 'Silver', description: 'راهکارهای امن برای احراز هویت.', websiteUrl: 'https://example-silver5.com' },
  { id: 'c3', name: 'جامعه برنامه‌نویسان پایتون', logo: '/images/sponsors/community-logo-3.svg', tier: 'Community', description: 'گردهمایی و اشتراک دانش بین برنامه‌نویسان.', websiteUrl: 'https://example-community3.com' },
  { id: 'p4', name: 'شرکت داده‌پردازی ابری', logo: '/images/sponsors/platinum-logo-4.svg', tier: 'Platinum', description: 'زیرساخت ابری مطمئن برای پروژه‌های بزرگ.', websiteUrl: 'https://example-platinum4.com' },
  { id: 'g5', name: 'مشاوران سرمایه‌گذاری دیجیتال', logo: '/images/sponsors/gold-logo-5.svg', tier: 'Gold', description: 'راهنمایی برای سرمایه‌گذاری هوشمند در رمزارزها.', websiteUrl: 'https://example-gold5.com' },
  { id: 's6', name: 'توسعه‌دهنده اپلیکیشن‌های غیرمتمرکز', logo: '/images/sponsors/silver-logo-6.svg', tier: 'Silver', description: 'ساخت dApp های کاربردی و نوآورانه.', websiteUrl: 'https://example-silver6.com' },
  { id: 'c4', name: 'کانون کارآفرینی فناوری', logo: '/images/sponsors/community-logo-4.svg', tier: 'Community', description: 'حمایت از کارآفرینان در حوزه فناوری.', websiteUrl: 'https://example-community4.com' },
  { id: 's7', name: 'آژانس مارکتینگ وب ۳', logo: '/images/sponsors/silver-logo-7.svg', tier: 'Silver', description: 'خدمات تخصصی بازاریابی برای پروژه‌های وب ۳.', websiteUrl: 'https://example-silver7.com' },
  { id: 's8', name: 'پلتفرم آموزشی آنلاین کریپتو', logo: '/images/sponsors/silver-logo-8.svg', tier: 'Silver', description: 'دوره‌های جامع آموزشی در زمینه ارزهای دیجیتال.', websiteUrl: 'https://example-silver8.com' },
];

// Tier configuration and mapOldTypeToTier REMOVED

const Sponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Refs and state for drag scrolling
  const trackRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [isDragging, setIsDragging] = useState<boolean[]>([false, false, false]);
  const [startX, setStartX] = useState<number[]>([0, 0, 0]);
  const [scrollLeftStart, setScrollLeftStart] = useState<number[]>([0, 0, 0]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, index: number) => {
    if (!trackRefs[index].current) return;
    e.preventDefault(); // Prevent text selection and other default drag behaviors
    trackRefs[index].current!.style.animationPlayState = 'paused';
    setIsDragging(prev => { const newArr = [...prev]; newArr[index] = true; return newArr; });
    setStartX(prev => { const newArr = [...prev]; newArr[index] = e.pageX - trackRefs[index].current!.offsetLeft; return newArr; });
    setScrollLeftStart(prev => { const newArr = [...prev]; newArr[index] = trackRefs[index].current!.scrollLeft; return newArr; });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, index: number) => {
    if (!isDragging[index] || !trackRefs[index].current) return;
    e.preventDefault();
    const x = e.pageX - trackRefs[index].current!.offsetLeft;
    const walk = (x - startX[index]) * 1.5; // scroll-fast factor
    trackRefs[index].current!.scrollLeft = scrollLeftStart[index] - walk;
  };

  const handleMouseUpOrLeave = (index: number) => {
    // Check if it was actually dragging this specific track before resetting
    if (!isDragging[index] || !trackRefs[index].current) return; 
    
    setIsDragging(prev => {
      const newArr = [...prev];
      newArr[index] = false;
      return newArr;
    });
    // Optional: Decide if animation should resume. For now, it stays paused.
    // if (trackRefs[index].current) {
    //   trackRefs[index].current!.style.animationPlayState = 'running'; // Or keep paused
    // }
  };

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        setIsLoading(true);
        let finalSponsorsToSet: SponsorEntry[];

        if (DEMO_MODE) {
          finalSponsorsToSet = DEMO_SPONSORS.map(ds => ({ // Ensure demo sponsors are also fully formed
            ...ds,
            id: ds.id || `demo-id-${Math.random().toString(36).substr(2, 9)}`,
            name: ds.name || "Demo Sponsor",
            logo: ds.logo || "https://via.placeholder.com/150x60?text=Demo+Logo",
            tier: ds.tier || 'Community',
            description: ds.description || `Demo sponsor description for ${ds.name || "Demo Sponsor"}`,
            websiteUrl: ds.websiteUrl || '#',
          }));
        } else {
          let liveSponsors: SponsorEntry[] = [];
          try {
            const fetchedData = await fetchContent<any[]>('sponsors.json');
            if (fetchedData && fetchedData.length > 0) {
                liveSponsors = fetchedData.map((item: any) => ({
                    id: item.id || `live-id-${Math.random().toString(36).substr(2, 9)}`,
                    name: item.name || "Unnamed Sponsor",
                    logo: item.logo, // Assuming logo URL must be present
                    tier: item.tier || 'Community', // Default tier if not specified
                    description: item.description || `Sponsor: ${item.name || "Unnamed"}`,
                    websiteUrl: item.website || '#',
                })).filter(sponsor => sponsor.logo); // Filter out sponsors without a logo
            }
          } catch (fetchErr) {
             console.warn('Fetching sponsors.json failed or it was empty, will use demo sponsors for supplementation.', fetchErr);
             // liveSponsors will remain empty if fetchContent itself throws or returns null/empty
          }


          finalSponsorsToSet = [...liveSponsors];
          const requiredSponsors = 18;

          if (finalSponsorsToSet.length < requiredSponsors) {
            const demoSponsorsProcessed: SponsorEntry[] = DEMO_SPONSORS.map(ds => ({
                ...ds,
                id: ds.id || `demo-fill-id-${Math.random().toString(36).substr(2, 9)}`,
                name: ds.name || "Demo Sponsor",
                logo: ds.logo || "https://via.placeholder.com/150x60?text=Demo+Logo",
                tier: ds.tier || 'Community',
                description: ds.description || `Demo sponsor description for ${ds.name || "Demo Sponsor"}`,
                websiteUrl: ds.websiteUrl || '#',
            }));

            for (const demoSponsor of demoSponsorsProcessed) {
              if (finalSponsorsToSet.length >= requiredSponsors) break;
              if (!finalSponsorsToSet.some(s => s.id === demoSponsor.id)) {
                finalSponsorsToSet.push(demoSponsor);
              }
            }
          }
        }
        
        // The rendering logic already handles slicing to 18 by how it forms rows.
        // We just provide the (potentially supplemented) list.
        setSponsors(finalSponsorsToSet);

      } catch (err) { // Catch errors from the outer try block (e.g., issues not related to fetchContent directly)
        console.error('Error in loadSponsors, falling back to DEMO_SPONSORS:', err);
        setError('خطا در بارگذاری اطلاعات حامیان. نمایش حامیان پیش‌فرض.');
        const demoSponsorsOnError = DEMO_SPONSORS.map(ds => ({
            ...ds,
            id: ds.id || `demo-error-id-${Math.random().toString(36).substr(2, 9)}`,
            name: ds.name || "Demo Sponsor",
            logo: ds.logo || "https://via.placeholder.com/150x60?text=Demo+Logo",
            tier: ds.tier || 'Community',
            description: ds.description || `Demo sponsor description for ${ds.name || "Demo Sponsor"}`,
            websiteUrl: ds.websiteUrl || '#',
        }));
        setSponsors(demoSponsorsOnError);
      } finally {
        setIsLoading(false);
      }
    };
    loadSponsors();
  }, []);

  // mapOldTypeToTier REMOVED

  if (isLoading) {
    return (
      <section id="sponsors" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-lg text-primary"></div>
          <p className="mt-4">در حال بارگذاری حامیان...</p>
        </div>
      </section>
    );
  }

  if (error && sponsors.length === 0 && !DEMO_MODE) {
    return (
      <section id="sponsors" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error text-lg">{error}</p>
        </div>
      </section>
    );
  }
  
  if (sponsors.length === 0 && !isLoading) { // Ensure not to show "no sponsors" while loading
     return (
      <section id="sponsors" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <Handshake size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-xl text-base-content/70">در حال حاضر اطلاعات حامیان در دسترس نیست.</p>
        </div>
      </section>
    );
  }

  // Logic for new logo display
  const displaySponsors = sponsors.slice(0, 18); // Take up to 18 sponsors
  const rowSize = 6;
  const rows: SponsorEntry[][] = [];
  for (let i = 0; i < displaySponsors.length; i += rowSize) {
    rows.push(displaySponsors.slice(i, i + rowSize));
  }
  // Ensure there are up to 3 rows for the structure, even if some are empty or partially filled.
  // The rendering will handle empty or partially filled rows gracefully.

  // renderSponsorTier REMOVED

  return (
    <section id="sponsors" className="py-16 md:py-24 bg-gradient-to-b from-base-100 to-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          {/* Handshake icon removed from title */}
          با حامیان ما آشنا شوید
        </h2>
        
        {/* New animated logo display */}
        {sponsors.length > 0 && ( // Only render if there are sponsors
          <div className="space-y-2 md:space-y-4"> {/* Container for the three rows */}
            {rows.map((rowSponsors, rowIndex) => {
              if (rowSponsors.length === 0) return null; // Don't render empty rows
              return (
                <div key={rowIndex} className="logo-row-container">
                  <div
                    ref={trackRefs[rowIndex]}
                    className={`logo-track ${
                      rowIndex === 1 ? 'animate-scroll-right' : 'animate-scroll-left'
                    } ${isDragging[rowIndex] ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onMouseDown={(e) => handleMouseDown(e, rowIndex)}
                    onMouseMove={(e) => handleMouseMove(e, rowIndex)}
                    onMouseUp={() => handleMouseUpOrLeave(rowIndex)}
                    onMouseLeave={() => handleMouseUpOrLeave(rowIndex)}
                    style={{ userSelect: isDragging[rowIndex] ? 'none' : 'auto' }}
                  >
                    {/* Render logos twice for seamless scroll */}
                    {[...rowSponsors, ...rowSponsors].map((sponsor, imgIndex) => (
                      <a 
                        key={`${sponsor.id}-${imgIndex}-${rowIndex}`} // Unique key considering duplication and row
                        href={sponsor.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={sponsor.name}
                        className="flex-shrink-0"
                        draggable="false" // Prevent native anchor drag
                      >
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          loading="lazy"
                          className="h-16 mx-6 object-contain" // pointer-events: none; will be in CSS
                          draggable="false" // Prevent native image drag
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x60?text=Logo'; }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Fallback for empty state is handled above by checking sponsors.length === 0 */}
      </div>
    </section>
  );
};

export default Sponsors;