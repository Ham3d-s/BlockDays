import React, { useState, useEffect } from 'react';
import { fetchContent } from '../utils/api';
import { Handshake, Building, Megaphone, Users, ExternalLink, Star } from 'lucide-react'; // Added Star for tiers

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
];

// Tier configuration
const tierConfig = {
  Platinum: { title: 'حامیان پلاتینیوم', icon: <Star size={28} className="text-yellow-400" />, gridCols: 'lg:grid-cols-2', cardClass: 'bg-base-300 shadow-2xl', logoSize: 'h-20 md:h-24', nameClass: 'text-xl md:text-2xl', descClass: 'text-base-content/80 text-sm md:text-base' },
  Gold: { title: 'حامیان طلایی', icon: <Star size={24} className="text-yellow-500" />, gridCols: 'lg:grid-cols-3', cardClass: 'bg-base-200 shadow-xl', logoSize: 'h-16 md:h-20', nameClass: 'text-lg md:text-xl', descClass: 'text-base-content/70 text-sm' },
  Silver: { title: 'حامیان نقره‌ای', icon: <Star size={20} className="text-gray-400" />, gridCols: 'md:grid-cols-3 lg:grid-cols-4', cardClass: 'bg-base-100 shadow-lg', logoSize: 'h-12 md:h-16', nameClass: 'text-md md:text-lg', descClass: 'text-xs' },
  Community: { title: 'همکاران جامعه', icon: <Users size={20} className="text-blue-500" />, gridCols: 'md:grid-cols-4 lg:grid-cols-5', cardClass: 'bg-base-100 shadow-md', logoSize: 'h-10 md:h-12', nameClass: 'text-sm', descClass: 'text-xs' },
};


const Sponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        setIsLoading(true);
        if (DEMO_MODE) {
          setSponsors(DEMO_SPONSORS);
        } else {
          // Assuming the fetched data structure needs mapping to SponsorEntry
          const fetchedData = await fetchContent<any[]>('sponsors.json'); 
          const mappedData: SponsorEntry[] = fetchedData.map(item => ({
            id: item.id,
            name: item.name,
            logo: item.logo,
            // Map 'type' from old structure to 'tier' in new, or define default
            tier: mapOldTypeToTier(item.type) || 'Silver', 
            description: item.description || 'حامی رویداد بلاک دیز', // Provide default description
            websiteUrl: item.website,
          }));
          setSponsors(mappedData);
        }
      } catch (err) {
        console.error('Failed to load sponsors:', err);
        setError('خطا در بارگذاری اطلاعات حامیان. لطفاً بعداً دوباره تلاش کنید.');
        if (DEMO_MODE) setSponsors(DEMO_SPONSORS); // Fallback for demo
      } finally {
        setIsLoading(false);
      }
    };
    loadSponsors();
  }, []);
  
  // Helper function to map old sponsor types to new tiers if not in DEMO_MODE
  const mapOldTypeToTier = (type?: 'financial' | 'moral' | 'media'): SponsorEntry['tier'] | undefined => {
    if (!type) return undefined;
    switch (type) {
      case 'financial': return 'Platinum';
      case 'moral': return 'Gold';
      case 'media': return 'Silver';
      default: return 'Community';
    }
  };


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
  
  if (sponsors.length === 0) {
     return (
      <section id="sponsors" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <Handshake size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-xl text-base-content/70">در حال حاضر اطلاعات حامیان در دسترس نیست.</p>
        </div>
      </section>
    );
  }

  const renderSponsorTier = (tier: SponsorEntry['tier']) => {
    const tierSponsors = sponsors.filter(s => s.tier === tier);
    if (tierSponsors.length === 0) return null;

    const config = tierConfig[tier];

    return (
      <div key={tier} className="mb-12 md:mb-16">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          {config.icon}
          {config.title}
        </h3>
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 ${config.gridCols}`}>
          {tierSponsors.map(sponsor => (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={sponsor.name} // Add title attribute for tooltip on hover
              className="flex items-center justify-center p-4 bg-base-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" // Basic container for the logo
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                loading="lazy"
                className={`max-w-full max-h-full object-contain ${config.logoSize}`} // Use logoSize from tierConfig for height
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x60?text=Logo+Error'; }} // Basic error placeholder
              />
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="sponsors" className="py-16 md:py-24 bg-gradient-to-b from-base-100 to-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          <Handshake className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          با حامیان ما آشنا شوید
        </h2>
        
        {(Object.keys(tierConfig) as Array<SponsorEntry['tier']>).map(tier => renderSponsorTier(tier))}
        
      </div>
    </section>
  );
};

export default Sponsors;