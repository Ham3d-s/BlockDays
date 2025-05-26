import React, { useState, useEffect, useMemo } from 'react';
import { fetchContent } from '../utils/api';
import { Calendar, MapPin, Tag, ListFilter, ArrowUpDown } from 'lucide-react';

// Extended Event Interface
interface UpcomingEvent {
  id: string; // Added for unique key
  title: string;
  date: string;
  location: string; // Added
  type: string; // Added (e.g., 'conference', 'workshop', 'meetup')
  image?: string; // Added for dynamic images
  registerLink: string;
  detailsLink: string;
  youtubeLink?: string;
  aparatLink?: string;
  instagramLink?: string;
  infoLink?: string;
  tags?: string[]; // Can be used for secondary keywords
  description?: string;
  active?: boolean; // Default to true if not provided
}

// Demo mode toggle (set to true to always show demo events)
const DEMO_MODE = false; // Set to true for demo/testing with new features

const DEFAULT_EVENTS: UpcomingEvent[] = [
  {
    id: 'demo1',
    title: 'همایش بزرگ بلاکچین ایران',
    date: '2025-08-15T09:00:00Z',
    location: 'مرکز همایش‌های تهران',
    type: 'conference',
    image: '/images/events/conference1.jpg', // Example image path
    registerLink: '#register-conf1',
    detailsLink: '#details-conf1',
    description: 'بزرگترین گردهمایی متخصصان بلاکچین در ایران. ارائه آخرین دستاوردها و شبکه‌سازی.',
    tags: ['بلاکچین', 'فناوری', 'شبکه‌سازی'],
    active: true,
  },
  {
    id: 'demo2',
    title: 'کارگاه توسعه قرارداد هوشمند',
    date: '2025-09-05T14:00:00Z',
    location: 'دانشگاه صنعتی شریف، تهران',
    type: 'workshop',
    image: '/images/events/workshop1.jpg',
    registerLink: '#register-ws1',
    detailsLink: '#details-ws1',
    description: 'یک کارگاه عملی برای یادگیری توسعه و استقرار قراردادهای هوشمند بر روی اتریوم.',
    tags: ['قرارداد هوشمند', 'اتریوم', 'برنامه‌نویسی'],
    active: true,
  },
  {
    id: 'demo3',
    title: 'میت‌آپ فعالان دیفای',
    date: '2025-08-20T18:00:00Z',
    location: 'فضای کار اشتراکی زاویه، اصفهان',
    type: 'meetup',
    image: '/images/events/meetup1.jpg',
    registerLink: '#register-meetup1',
    detailsLink: '#details-meetup1',
    description: 'دورهمی ماهانه فعالان حوزه دیفای برای گفتگو و تبادل نظر.',
    tags: ['دیفای', 'جامعه', 'اصفهان'],
    active: true,
  },
  {
    id: 'demo4',
    title: 'وبینار امنیت در بلاکچین',
    date: '2025-09-25T16:00:00Z',
    location: 'آنلاین',
    type: 'webinar',
    image: '/images/events/webinar1.jpg',
    registerLink: '#register-webinar1',
    detailsLink: '#details-webinar1',
    description: 'بررسی چالش‌های امنیتی در پلتفرم‌های بلاکچینی و راهکارهای مقابله با آن‌ها.',
    tags: ['امنیت', 'وبینار', 'آنلاین'],
    active: true,
  },
  {
    id: 'demo5',
    title: 'کنفرانس آینده وب ۳',
    date: '2025-10-10T10:00:00Z',
    location: 'هتل اسپیناس پالاس، تهران',
    type: 'conference',
    image: '/images/events/conference2.jpg',
    registerLink: '#register-conf2',
    detailsLink: '#details-conf2',
    description: 'نگاهی عمیق به آینده اینترنت با تمرکز بر وب ۳، متاورس و NFT.',
    tags: ['وب ۳', 'متاورس', 'NFT'],
    active: true,
  }
];

const EVENT_TYPES = ['all', 'conference', 'workshop', 'meetup', 'webinar'];
const SORT_OPTIONS = {
  date_desc: 'جدیدترین‌ها',
  date_asc: 'قدیمی‌ترین‌ها',
};

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

// Keep calculateCountdown function as is
function calculateCountdown(dateString: string): Countdown {
  if (!dateString) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const eventDate = new Date(dateString);
  const now = new Date();
  const difference = eventDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}


const UpcomingEvent: React.FC = () => {
  const [allEvents, setAllEvents] = useState<UpcomingEvent[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, Countdown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('date_desc');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        let fetchedEvents: UpcomingEvent[];
        if (DEMO_MODE) {
          fetchedEvents = DEFAULT_EVENTS.map(event => ({
            ...event,
            active: event.active !== undefined ? event.active : true,
            image: event.image || `/images/events/default-${event.type || 'event'}.jpg` // Provide default image based on type
          }));
        } else {
          const data = await fetchContent<UpcomingEvent[] | UpcomingEvent>('upcoming-event.json');
          let arrData = Array.isArray(data) ? data : [data];
          fetchedEvents = arrData.filter(ev => ev && ev.id && ev.title && ev.date && ev.location && ev.type).map(event => ({
            ...event,
            active: event.active !== undefined ? event.active : true,
            image: event.image || `/images/events/default-${event.type || 'event'}.jpg`
          }));
        }
        setAllEvents(fetchedEvents.filter(ev => ev.active));
      } catch (err) {
        console.error("Error loading events:", err);
        setError('خطا در بارگذاری رویدادهای آینده. لطفاً بعداً دوباره تلاش کنید.');
        setAllEvents(DEMO_MODE ? DEFAULT_EVENTS.filter(ev => ev.active) : []); // Fallback to demo if error in non-demo
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!allEvents.length) {
      setCountdowns({});
      return;
    }
    const updateAllCountdowns = () => {
      const newCountdowns: Record<string, Countdown> = {};
      allEvents.forEach(event => {
        newCountdowns[event.id] = calculateCountdown(event.date);
      });
      setCountdowns(newCountdowns);
    };
    updateAllCountdowns();
    const timer = setInterval(updateAllCountdowns, 1000);
    return () => clearInterval(timer);
  }, [allEvents]);

  const processedEvents = useMemo(() => {
    let eventsToProcess = [...allEvents];

    // Filtering
    if (selectedType !== 'all') {
      eventsToProcess = eventsToProcess.filter(event => event.type === selectedType);
    }

    // Sorting
    eventsToProcess.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortOrder === 'date_asc') {
        return dateA - dateB;
      }
      return dateB - dateA; // date_desc
    });

    return eventsToProcess;
  }, [allEvents, selectedType, sortOrder]);


  if (isLoading) {
    return (
      <section id="upcoming-event-section" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-lg">در حال بارگذاری رویدادها...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="upcoming-event-section" className="py-16 md:py-24 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 text-center text-primary">
          <Calendar className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          رویدادهای آینده
        </h2>

        {/* Filters and Sorting Controls */}
        <div className="mb-10 p-4 bg-base-100 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter by Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold"><ListFilter className="inline-block w-4 h-4 mr-1" />فیلتر بر اساس نوع</span>
                </label>
                <select 
                  className="select select-bordered select-primary w-full sm:w-auto"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'همه رویدادها' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold"><ArrowUpDown className="inline-block w-4 h-4 mr-1" />مرتب‌سازی بر اساس</span>
                </label>
                <select 
                  className="select select-bordered select-primary w-full sm:w-auto"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-base-content/70 mt-4 md:mt-0">
              {processedEvents.length} رویداد یافت شد
            </div>
          </div>
        </div>
        
        {error && (
          <div className="alert alert-error shadow-lg my-6">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {processedEvents.length === 0 && !error && (
          <div className="text-center py-10">
            <Tag className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <p className="text-xl text-base-content/70">
              در حال حاضر هیچ رویدادی با معیارهای انتخابی شما وجود ندارد.
            </p>
            {selectedType !== 'all' && (
              <button 
                className="btn btn-link mt-4"
                onClick={() => setSelectedType('all')}
              >
                نمایش همه رویدادها
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {processedEvents.map((event) => {
            const timeLeft = countdowns[event.id] || { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
            const eventDateFormatted = new Date(event.date).toLocaleDateString('fa-IR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div key={event.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full overflow-hidden">
                <figure className="h-48 sm:h-56 overflow-hidden">
                  <img
                    src={event.image || `/images/events/default-${event.type}.jpg`} // Fallback image
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `/images/events/default-event.jpg`; // Generic fallback
                      e.currentTarget.onerror = null; // Prevent infinite loop if this also fails
                    }}
                  />
                </figure>
                <div className="card-body p-5 flex flex-col flex-grow">
                  <div className="mb-3">
                    <span className="badge badge-primary badge-outline mb-2 capitalize">{event.type}</span>
                    <h3 className="text-xl font-bold mb-1 text-base-content">{event.title}</h3>
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {event.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="badge badge-ghost badge-sm">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-base-content/80 mb-4 flex-grow">
                    <p className="flex items-start">
                      <Calendar className="w-4 h-4 ml-2 mt-0.5 flex-shrink-0 text-secondary" />
                      <span>{eventDateFormatted}</span>
                    </p>
                    <p className="flex items-start">
                      <MapPin className="w-4 h-4 ml-2 mt-0.5 flex-shrink-0 text-secondary" />
                      <span>{event.location}</span>
                    </p>
                    {event.description && (
                      <p className="text-sm opacity-90 line-clamp-3 min-h-[60px]">{event.description}</p>
                    )}
                  </div>

                  {!timeLeft.expired ? (
                    <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                      {[
                        { value: timeLeft.days, label: 'روز' },
                        { value: timeLeft.hours, label: 'ساعت' },
                        { value: timeLeft.minutes, label: 'دقیقه' },
                        { value: timeLeft.seconds, label: 'ثانیه' }
                      ].map((item, i) => (
                        <div key={i} className="bg-base-200 rounded-lg p-2">
                          <div className="text-lg font-bold text-primary">{item.value}</div>
                          <div className="text-xs opacity-80">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info my-3 py-2 px-3 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span>زمان این رویداد به پایان رسیده است.</span>
                    </div>
                  )}
                  
                  <div className="card-actions justify-center mt-auto pt-4 border-t border-base-content/10">
                    {!timeLeft.expired ? (
                      <>
                        <a href={event.registerLink} className="btn btn-primary btn-sm flex-grow" target="_blank" rel="noopener noreferrer">ثبت نام</a>
                        <a href={event.detailsLink} className="btn btn-outline btn-secondary btn-sm flex-grow" target="_blank" rel="noopener noreferrer">جزئیات بیشتر</a>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {event.youtubeLink && <a href={event.youtubeLink} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-100" target="_blank" rel="noopener noreferrer">یوتیوب</a>}
                        {event.aparatLink && <a href={event.aparatLink} className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">آپارات</a>}
                        {event.infoLink && <a href={event.infoLink} className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer">اطلاعات بیشتر</a>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvent;