import React, { useState, useEffect, useRef } from 'react';
import { fetchContent } from '../utils/api';
import { Share2, Calendar, Video, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'meetup' | 'conference' | 'videocast';
  image: string;
  youtubeLink: string;
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  getUrl: ((event: Event) => string) | null;
  description: string;
}

const SHARE_SLOGAN = 'بلاک‌دِیز، ویترین حوزه تکنولوژی ایران';

const getShareText = (event: Event) => {
  return `${event.title}\n\n${event.description}\n\n${SHARE_SLOGAN}`;
};

const getShareUrl = (event: Event) => event.youtubeLink;

const shareOptions: ShareOption[] = [
  {
    id: 'telegram',
    label: 'تلگرام',
    icon: <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg" alt="Telegram" className="w-6 h-6" style={{ filter: 'invert(38%) sepia(77%) saturate(2160%) hue-rotate(184deg) brightness(96%) contrast(94%)' }} />,
    getUrl: (event: Event) => `https://t.me/share/url?url=${encodeURIComponent(getShareUrl(event))}&text=${encodeURIComponent(getShareText(event))}`,
    description: 'اشتراک‌گذاری در تلگرام',
  },
  {
    id: 'twitter',
    label: 'توییتر',
    icon: <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg" alt="Twitter" className="w-6 h-6" style={{ filter: 'invert(14%) sepia(96%) saturate(5568%) hue-rotate(205deg) brightness(101%) contrast(97%)' }} />,
    getUrl: (event: Event) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(event))}&url=${encodeURIComponent(getShareUrl(event))}`,
    description: 'اشتراک‌گذاری در توییتر',
  },
  {
    id: 'instagram',
    label: 'اینستاگرام',
    icon: <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" alt="Instagram" className="w-6 h-6" style={{ filter: 'invert(43%) sepia(25%) saturate(1318%) hue-rotate(216deg) brightness(94%) contrast(92%)' }} />,
    getUrl: (event: Event) => `https://www.instagram.com/?url=${encodeURIComponent(getShareUrl(event))}&text=${encodeURIComponent(getShareText(event))}`,
    description: 'اشتراک‌گذاری در اینستاگرام',
  },
  {
    id: 'copy',
    label: 'کپی به کلیپ‌بورد',
    icon: <span className="material-icons text-base-content"></span>,
    getUrl: null,
    description: 'کپی کردن متن و لینک',
  },
];

const PastEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEvent, setShareEvent] = useState<Event | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const categoryTranslation = {
    meetup: 'میتاپ',
    conference: 'کنفرانس',
    videocast: 'ویدیوکست'
  };

  const categoryIcons = {
    meetup: <Users size={16} />,
    conference: <Calendar size={16} />,
    videocast: <Video size={16} />
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<Event[]>('past-events.json');
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error('Failed to load past events:', err);
        setError('خطا در بارگذاری رویدادهای گذشته');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents(activeTab);
  }, [events, activeTab]);

  const filterEvents = (category: string) => {
    if (category === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === category));
    }
  };

  const handleTabClick = (category: string) => {
    setActiveTab(category);
  };

  const handleHorizontalScroll = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleShare = (event: Event) => {
    setShareEvent(event);
    setShareModalOpen(true);
  };

  const handleShareOption = async (option: ShareOption, event: Event) => {
    if (option.id === 'copy') {
      try {
        const copiedText = `${getShareText(event)}\n\nمشاهده این رویداد: ${getShareUrl(event)}`;
        await navigator.clipboard.writeText(copiedText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        alert('کپی به کلیپ‌بورد ناموفق بود');
      }
    } else if (option.getUrl) {
      window.open(option.getUrl(event), '_blank');
    }
    setShareModalOpen(false);
  };

  const createEventCard = (event: Event) => (
    <div key={event.id} className="card bg-base-200 shadow-xl overflow-hidden group">
      <figure className="relative h-48">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.svg';
          }}
        />
        <div className="absolute top-2 right-2">
          <div className="badge badge-primary gap-2">
            {categoryIcons[event.category]}
            {categoryTranslation[event.category]}
          </div>
        </div>
      </figure>
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg">{event.title}</h3>
          <button 
            className="btn btn-circle btn-sm btn-ghost"
            onClick={() => handleShare(event)}
            aria-label="اشتراک‌گذاری"
          >
            <Share2 size={16} />
          </button>
        </div>
        <p className="text-sm opacity-80 line-clamp-2">{event.description}</p>
        <p className="text-sm mt-2 flex items-center gap-2">
          <Calendar size={14} />
          {event.date}
        </p>
        <div className="card-actions justify-end mt-4">
          <a 
            href={event.youtubeLink} 
            className="btn btn-primary btn-sm gap-2" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Video size={16} />
            مشاهده
          </a>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section id="past-events" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  if (error || events.length === 0) {
    return (
      <section id="past-events" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error">{error || 'رویداد گذشته‌ای یافت نشد'}</p>
        </div>
      </section>
    );
  }

  const counts = {
    all: events.length,
    meetup: events.filter(event => event.category === 'meetup').length,
    conference: events.filter(event => event.category === 'conference').length,
    videocast: events.filter(event => event.category === 'videocast').length
  };

  return (
    <section id="past-events" className="py-20 bg-base-200 scroll-animate">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          رویدادهای گذشته
        </h2>
        
        <div className="md:hidden flex justify-between items-center mb-4">
          <button 
            className="btn btn-circle btn-sm"
            onClick={() => handleHorizontalScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
          
          <button 
            className="btn btn-circle btn-sm"
            onClick={() => handleHorizontalScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        
        <div 
          ref={tabsRef}
          className="flex overflow-x-auto pb-2 mb-8 no-scrollbar"
        >
          <div className="flex space-x-2 rtl:space-x-reverse mx-auto">
            {[
              { id: 'all', label: 'همه', icon: <Calendar size={16} /> },
              { id: 'meetup', label: 'میتاپ‌ها', icon: <Users size={16} /> },
              { id: 'conference', label: 'کنفرانس‌ها', icon: <Calendar size={16} /> },
              { id: 'videocast', label: 'ویدیوکست‌ها', icon: <Video size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`btn btn-sm gap-2 ${
                  activeTab === tab.id ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.icon}
                {tab.label} ({counts[tab.id as keyof typeof counts]})
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(event => createEventCard(event))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center my-12">
            <p>رویدادی در این دسته یافت نشد</p>
          </div>
        )}
      </div>
      {/* Share Modal */}
      {shareModalOpen && shareEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShareModalOpen(false)}>
          <div className="bg-base-100 rounded-lg shadow-lg p-8 max-w-xs w-full relative" onClick={e => e.stopPropagation()}>
            <button className="btn btn-sm btn-circle absolute left-4 top-4" onClick={() => setShareModalOpen(false)}><X size={18} /></button>
            <h3 className="text-lg font-bold mb-4 text-primary">اشتراک‌گذاری رویداد</h3>
            <ul className="space-y-3 mb-2">
              {shareOptions.map(option => (
                <li key={option.id}>
                  <button
                    className="btn btn-block btn-outline flex items-center gap-3 justify-start"
                    onClick={() => handleShareOption(option, shareEvent)}
                  >
                    {option.icon}
                    <span className="flex-1 text-right text-base-content">{option.label}</span>
                  </button>
                  <div className="text-xs opacity-70 mt-1 text-right">{option.description}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs opacity-60 text-center">{SHARE_SLOGAN}</div>
            {copySuccess && <div className="alert alert-success mt-2">متن با موفقیت کپی شد!</div>}
          </div>
        </div>
      )}
    </section>
  );
};

export default PastEvents;