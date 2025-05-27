import React, { useState, useEffect } from 'react'; // Removed useRef, MouseEvent
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

interface SponsorsPageData {
  title: string;
  items: SponsorEntry[];
}

const DEMO_MODE = false; // Enable to use hardcoded demo sponsors

const DEMO_SPONSORS_DATA: SponsorsPageData = {
  title: "حامیان ما (پیش‌فرض)",
  items: [
    // Platinum
    { id: 'p1', name: 'صرافی پیشرو ایران', logo: '/images/sponsors/platinum-logo-1.svg', tier: 'Platinum', description: 'پیشرو در ارائه خدمات نوین تبادل رمزارز در ایران با بالاترین استانداردهای امنیتی.', websiteUrl: 'https://example-platinum1.com' },
  // ... (rest of the demo sponsors to be included here for brevity in thought process)
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
  ]
};

// Tier configuration and mapOldTypeToTier REMOVED

const Sponsors: React.FC = () => {
  const [sponsorsPageData, setSponsorsPageData] = useState<SponsorsPageData>(DEMO_MODE ? DEMO_SPONSORS_DATA : { title: "با حامیان ما آشنا شوید", items: [] });
  const [isLoading, setIsLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState('');

  useEffect(() => {
    if (DEMO_MODE) return;

    const loadSponsors = async () => {
      try {
        setIsLoading(true);
        let finalSponsorsToSet: SponsorEntry[];
        let pageTitle = "با حامیان ما آشنا شوید";
        let liveSponsors: SponsorEntry[] = []; // Initialize here

        try {
          const fetchedData = await fetchContent<SponsorsPageData>('sponsors.json');
          pageTitle = fetchedData?.title || pageTitle;
          liveSponsors = (fetchedData?.items || []).map((item: any) => ({
              id: item.id || `live-id-${Math.random().toString(36).substr(2, 9)}`,
              name: item.name || "Unnamed Sponsor",
              logo: item.logo,
              tier: item.tier || 'Community',
              description: item.description || `Sponsor: ${item.name || "Unnamed"}`,
              websiteUrl: item.website || '#',
          })).filter(sponsor => sponsor.logo);
        } catch (fetchErr) {
           console.warn('Fetching sponsors.json failed or it was empty, will use demo sponsors for supplementation.', fetchErr);
           // liveSponsors remains [] as initialized
        }
        
        finalSponsorsToSet = [...liveSponsors];
        const requiredSponsors = 18;

        if (finalSponsorsToSet.length < requiredSponsors) {
          const demoSponsorsProcessed: SponsorEntry[] = DEMO_SPONSORS_DATA.items.map(ds => ({
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
        
        setSponsorsPageData({ title: pageTitle, items: finalSponsorsToSet });

      } catch (err) { 
        console.error('Error in loadSponsors, falling back to DEMO_SPONSORS_DATA:', err);
        setError('خطا در بارگذاری اطلاعات حامیان. نمایش حامیان پیش‌فرض.');
        setSponsorsPageData(DEMO_SPONSORS_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    loadSponsors();
  }, []);


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

  if (error && sponsorsPageData.items.length === 0 && !DEMO_MODE) {
    return (
      <section id="sponsors" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error text-lg">{error}</p>
        </div>
      </section>
    );
  }
  
  if (sponsorsPageData.items.length === 0 && !isLoading) { 
     return (
      <section id="sponsors" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <Handshake size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-xl text-base-content/70">در حال حاضر اطلاعات حامیان در دسترس نیست.</p>
        </div>
      </section>
    );
  }


  return (
    <section id="sponsors" className="py-16 md:py-24 bg-gradient-to-b from-base-100 to-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          {sponsorsPageData.title}
        </h2>
        
        {sponsorsPageData.items.length > 0 && (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 py-8">
            {sponsorsPageData.items.map(sponsor => ( 
              <a
                key={sponsor.id}
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={sponsor.name}
                className="flex items-center justify-center p-2 aspect-[3/2] transition-opacity hover:opacity-75"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x60?text=Logo'; }}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Sponsors;