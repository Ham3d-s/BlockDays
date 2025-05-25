import React, { useState, useEffect, useMemo } from 'react';
import { fetchContent } from '../utils/api';
import { Share2, Calendar, Video, Users, MapPin, Search, ListChecks, Tv, Link as LinkIcon, Image as ImageIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

// Updated Event Interface
interface PastEvent {
  id: string;
  title: string;
  date: string; // Keep as string, e.g., "YYYY-MM-DD" or "1402/10/15"
  year?: string; // Extracted for searching
  location?: string;
  category: 'meetup' | 'conference' | 'videocast' | 'workshop' | 'webinar'; // Expanded
  image: string;
  description: string;
  highlights?: string[];
  tags?: string[]; // For keywords
  resources?: {
    youtube?: string;
    slides?: string;
    gallery?: string;
    other?: { url: string; label: string }[];
  };
}

const DEMO_MODE = true; // Enable demo mode to use hardcoded data

const DEMO_PAST_EVENTS: PastEvent[] = [
  {
    id: 'past-conf-1',
    title: 'همایش بزرگ بلاکچین ۱۴۰۲',
    date: '1402/08/15', // Example Farsi date
    location: 'مرکز همایش‌های برج میلاد، تهران',
    category: 'conference',
    image: '/images/gallery/event1.svg', // Placeholder, replace with actual if available
    description: 'مروری بر آخرین تحولات دنیای بلاکچین و رمزارزها با حضور برترین متخصصان داخلی و خارجی.',
    highlights: [
      'سخنرانی‌های کلیدی از پیشگامان صنعت',
      'پنل‌های تخصصی در مورد دیفای، NFT و وب ۳',
      'فرصت‌های شبکه‌سازی گسترده',
    ],
    tags: ['بلاکچین', 'همایش', 'تهران', 'دیفای', 'NFT', 'وب ۳'],
    resources: {
      youtube: 'https://youtube.com/example-conf1',
      gallery: '#gallery-link-conf1',
      slides: '#slides-link-conf1'
    },
  },
  {
    id: 'past-meetup-1',
    title: 'میت‌آپ ماهانه جامعه اتریوم ایران',
    date: '1402/05/20',
    location: 'فضای کار اشتراکی زاویه، اصفهان',
    category: 'meetup',
    image: '/images/gallery/event2.svg',
    description: 'دورهمی صمیمانه اعضای جامعه اتریوم ایران برای بحث و تبادل نظر پیرامون آخرین پروژه‌ها و ایده‌ها.',
    highlights: ['ارائه پروژه‌های جدید توسط اعضا', 'بحث آزاد در مورد آینده اتریوم'],
    tags: ['اتریوم', 'میت‌آپ', 'اصفهان', 'جامعه'],
    resources: {
      youtube: 'https://youtube.com/example-meetup1',
    },
  },
  {
    id: 'past-workshop-1',
    title: 'کارگاه عملی توسعه قرارداد هوشمند',
    date: '1401/12/10',
    location: 'دانشگاه صنعتی شریف، تهران',
    category: 'workshop',
    image: '/images/gallery/event3.svg',
    description: 'آموزش گام به گام نوشتن، تست و دیپلوی قراردادهای هوشمند بر روی شبکه اتریوم.',
    highlights: ['یادگیری سالیدیتی از پایه', 'انجام پروژه‌های عملی', 'دریافت گواهی شرکت در کارگاه'],
    tags: ['قرارداد هوشمند', 'کارگاه', 'سالیدیتی', 'برنامه‌نویسی', 'تهران'],
    resources: {
      slides: '#slides-workshop1',
      other: [{ label: 'مخزن کد گیت‌هاب', url: '#github-repo' }]
    },
  },
  {
    id: 'past-webinar-1',
    title: 'وبینار امنیت در فضای دیفای',
    date: '1402/03/05',
    location: 'آنلاین',
    category: 'webinar',
    image: '/images/gallery/event4.svg',
    description: 'بررسی مهم‌ترین ریسک‌های امنیتی در پروتکل‌های دیفای و نحوه محافظت از دارایی‌ها.',
    highlights: ['تحلیل حملات رایج به پلتفرم‌های دیفای', 'معرفی ابزارهای امنیتی', 'پرسش و پاسخ با کارشناس امنیت'],
    tags: ['دیفای', 'امنیت', 'وبینار', 'آنلاین'],
    resources: {
      youtube: 'https://youtube.com/example-webinar1',
    },
  }
];


// Share functionality (can be kept similar)
interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  getUrl: ((event: PastEvent) => string) | null;
  description: string;
}
const SHARE_SLOGAN = 'بلاک‌دِیز، ویترین حوزه تکنولوژی ایران';
const getShareText = (event: PastEvent) => `${event.title}\n\n${event.description.substring(0,100)}...\n\n${SHARE_SLOGAN}`;
const getShareUrl = (event: PastEvent) => event.resources?.youtube || event.resources?.other?.[0]?.url || window.location.href;

const shareOptions: ShareOption[] = [
  {
    id: 'telegram', label: 'تلگرام',
    icon: <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg" alt="Telegram" className="w-5 h-5" style={{ filter: 'invert(38%) sepia(77%) saturate(2160%) hue-rotate(184deg) brightness(96%) contrast(94%)' }} />,
    getUrl: (event: PastEvent) => `https://t.me/share/url?url=${encodeURIComponent(getShareUrl(event))}&text=${encodeURIComponent(getShareText(event))}`,
    description: 'اشتراک‌گذاری در تلگرام',
  },
  {
    id: 'twitter', label: 'توییتر',
    icon: <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg" alt="X (Twitter)" className="w-5 h-5" style={{ filter: 'invert(100%)' }} />, // Updated to X icon
    getUrl: (event: PastEvent) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(event))}&url=${encodeURIComponent(getShareUrl(event))}`,
    description: 'اشتراک‌گذاری در توییتر',
  },
  {
    id: 'linkedin', label: 'لینکدین',
    icon: <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg" alt="LinkedIn" className="w-5 h-5" style={{ filter: 'invert(34%) sepia(97%) saturate(1263%) hue-rotate(189deg) brightness(93%) contrast(91%)' }} />,
    getUrl: (event: PastEvent) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(getShareUrl(event))}&title=${encodeURIComponent(event.title)}&summary=${encodeURIComponent(getShareText(event))}`,
    description: 'اشتراک‌گذاری در لینکدین',
  },
  {
    id: 'copy', label: 'کپی لینک',
    icon: <LinkIcon size={20} className="text-base-content" />,
    getUrl: null, description: 'کپی کردن لینک رویداد',
  },
];


const PastEvents: React.FC = () => {
  const [allPastEvents, setAllPastEvents] = useState<PastEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEventForShare, setSelectedEventForShare] = useState<PastEvent | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const categoryTranslation: Record<PastEvent['category'], string> = {
    meetup: 'میت‌آپ',
    conference: 'کنفرانس',
    videocast: 'ویدیوکست',
    workshop: 'کارگاه',
    webinar: 'وبینار',
  };

  const categoryIcons: Record<PastEvent['category'], React.ReactNode> = {
    meetup: <Users size={16} className="ml-1" />,
    conference: <Users2 size={16} className="ml-1" />, // Changed icon for conference
    videocast: <Tv size={16} className="ml-1" />,    // Changed icon for videocast
    workshop: <ListChecks size={16} className="ml-1" />,
    webinar: <Clock size={16} className="ml-1" />, // Changed icon for webinar
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        let data: PastEvent[];
        if (DEMO_MODE) {
          data = DEMO_PAST_EVENTS.map(event => ({
            ...event,
            year: event.date.split('/')[0] // Extract year for Farsi dates like "1402/08/15"
          }));
        } else {
          const fetchedData = await fetchContent<Omit<PastEvent, 'year'>[]>('past-events.json');
          data = fetchedData.map(event => ({
            ...event,
            year: new Date(event.date).getFullYear().toString() // Assuming standard date format for non-demo
          }));
        }
        setAllPastEvents(data);
      } catch (err) {
        console.error('Failed to load past events:', err);
        setError('خطا در بارگذاری رویدادهای گذشته. لطفاً بعداً دوباره تلاش کنید.');
        if (DEMO_MODE) setAllPastEvents(DEMO_PAST_EVENTS.map(event => ({ ...event, year: event.date.split('/')[0] }))); // Fallback to demo data
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return allPastEvents;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allPastEvents.filter(event => {
      const yearMatch = event.year && event.year.includes(lowerSearchTerm);
      const titleMatch = event.title.toLowerCase().includes(lowerSearchTerm);
      const categoryMatch = categoryTranslation[event.category].toLowerCase().includes(lowerSearchTerm);
      const tagMatch = event.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      const highlightMatch = event.highlights?.some(hl => hl.toLowerCase().includes(lowerSearchTerm));
      const descriptionMatch = event.description.toLowerCase().includes(lowerSearchTerm);

      return titleMatch || categoryMatch || yearMatch || tagMatch || highlightMatch || descriptionMatch;
    });
  }, [allPastEvents, searchTerm]);

  const handleShareClick = (event: PastEvent) => {
    setSelectedEventForShare(event);
    setShareModalOpen(true);
  };

  const handleShareAction = async (option: ShareOption, event: PastEvent) => {
    if (option.id === 'copy') {
      try {
        await navigator.clipboard.writeText(getShareUrl(event));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        alert('کپی لینک ناموفق بود.');
      }
    } else if (option.getUrl) {
      window.open(option.getUrl(event), '_blank', 'noopener,noreferrer');
    }
    // Consider closing modal or not based on UX preference
    // setShareModalOpen(false); 
  };


  if (isLoading) {
    return (
      <section id="past-events" className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-lg text-primary"></div>
          <p className="mt-4">در حال بارگذاری رویدادهای گذشته...</p>
        </div>
      </section>
    );
  }

  if (error && filteredEvents.length === 0 && !DEMO_MODE) { // Show error only if not in demo and no events
    return (
      <section id="past-events" className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error text-lg">{error}</p>
        </div>
      </section>
    );
  }
  
  const TimelineCard: React.FC<{ event: PastEvent; index: number }> = ({ event, index }) => {
    const isLeft = index % 2 === 0;
    const formattedDate = event.date; // Assuming date is already in desired Farsi format for demo

    return (
      <div className={`flex md:contents`}>
        {isLeft && <div className="col-start-5 col-end-6 md:mx-auto relative mr-10 md:mr-0">
          <div className="h-full w-6 flex items-center justify-center">
            <div className="h-full w-1 bg-primary pointer-events-none"></div>
          </div>
          <div className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-secondary shadow text-center flex items-center justify-center">
            {categoryIcons[event.category] && React.cloneElement(categoryIcons[event.category] as React.ReactElement, { size: 14, className: "text-secondary-content" })}
          </div>
        </div>}
        
        <div className={`bg-base-200 col-start-6 col-end-10 p-4 sm:p-6 rounded-xl my-4 mr-auto shadow-md w-full md:w-auto ${isLeft ? 'md:ml-auto md:mr-0' : 'md:mr-auto'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-primary text-sm flex items-center">
              {categoryIcons[event.category]}
              {categoryTranslation[event.category]}
            </span>
            <span className="text-xs text-base-content/70 flex items-center">
              <Calendar size={14} className="ml-1" /> {formattedDate}
            </span>
          </div>
          <h3 className="font-semibold text-xl sm:text-2xl mb-1 text-base-content">{event.title}</h3>
          {event.location && (
            <p className="text-xs text-base-content/70 mb-2 flex items-center">
              <MapPin size={12} className="ml-1" /> {event.location}
            </p>
          )}
          <p className="text-sm leading-relaxed opacity-90 mb-3 line-clamp-3">{event.description}</p>
          
          {event.highlights && event.highlights.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-1 text-secondary">نکات کلیدی:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 opacity-80">
                {event.highlights.map((hl, i) => <li key={i} className="line-clamp-2">{hl}</li>)}
              </ul>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
             <div className="mb-4">
                {event.tags.slice(0,4).map(tag => (
                    <span key={tag} className="badge badge-outline badge-sm mr-1 mb-1">{tag}</span>
                ))}
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2 flex-wrap">
              {event.resources?.youtube && <a href={event.resources.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-error btn-outline btn-xs gap-1"><Video size={14}/> یوتیوب</a>}
              {event.resources?.slides && <a href={event.resources.slides} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-outline btn-xs gap-1"><ListChecks size={14}/> اسلایدها</a>}
              {event.resources?.gallery && <a href={event.resources.gallery} target="_blank" rel="noopener noreferrer" className="btn btn-info btn-outline btn-xs gap-1"><ImageIcon size={14}/> گالری</a>}
              {event.resources?.other?.map(link => (
                 <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs gap-1"><LinkIcon size={14}/> {link.label}</a>
              ))}
            </div>
            <button 
              className="btn btn-circle btn-sm btn-ghost text-base-content/70 hover:bg-base-300"
              onClick={() => handleShareClick(event)}
              aria-label="اشتراک‌گذاری"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {!isLeft && <div className="col-start-5 col-end-6 md:mx-auto relative ml-10 md:ml-0">
          <div className="h-full w-6 flex items-center justify-center">
            <div className="h-full w-1 bg-primary pointer-events-none"></div>
          </div>
          <div className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-secondary shadow text-center flex items-center justify-center">
             {categoryIcons[event.category] && React.cloneElement(categoryIcons[event.category] as React.ReactElement, { size: 14, className: "text-secondary-content" })}
          </div>
        </div>}
      </div>
    );
  };
  

  return (
    <section id="past-events" className="py-16 md:py-24 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 text-primary">
          <Clock className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          مروری بر رویدادهای گذشته
        </h2>

        {/* Search Bar */}
        <div className="mb-10 md:mb-12 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو در رویدادها (نام، سال، کلیدواژه...)"
              className="input input-bordered input-primary w-full pr-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
          </div>
        </div>
        
        {/* Timeline */}
        {filteredEvents.length > 0 ? (
          <div className="flex flex-col md:grid grid-cols-9 mx-auto p-2 text-blue-50">
            {filteredEvents.map((event, index) => (
              <TimelineCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Search size={48} className="mx-auto text-base-content/30 mb-4" />
            <p className="text-xl text-base-content/70">
              هیچ رویدادی با عبارت جستجوی شما یافت نشد.
            </p>
            {searchTerm && (
                 <button className="btn btn-link mt-2" onClick={() => setSearchTerm('')}>پاک کردن جستجو</button>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && selectedEventForShare && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShareModalOpen(false)}>
          <div className="bg-base-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <button className="btn btn-sm btn-circle btn-ghost absolute left-3 top-3 text-base-content/70" onClick={() => setShareModalOpen(false)}><X size={20} /></button>
            <h3 className="text-lg sm:text-xl font-bold mb-6 text-primary text-center">اشتراک‌گذاری رویداد</h3>
            <p className="text-sm text-base-content/80 mb-1 text-center line-clamp-1">"{selectedEventForShare.title}"</p>
            <div className="divider my-3 text-xs">از طریق</div>
            <ul className="space-y-3">
              {shareOptions.map(option => (
                <li key={option.id}>
                  <button
                    className="btn btn-block btn-outline hover:bg-primary hover:text-primary-content border-base-content/20 flex items-center gap-3 justify-start text-sm py-2 h-auto"
                    onClick={() => handleShareAction(option, selectedEventForShare)}
                    title={option.description}
                  >
                    {option.icon}
                    <span className="flex-1 text-right text-base-content group-hover:text-primary-content">{option.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            {copySuccess && <div className="text-success text-xs text-center mt-3">لینک با موفقیت کپی شد!</div>}
            <div className="mt-6 text-xs text-base-content/50 text-center">{SHARE_SLOGAN}</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PastEvents;