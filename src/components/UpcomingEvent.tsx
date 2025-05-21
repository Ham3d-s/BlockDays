import React, { useState, useEffect } from 'react';
import { fetchContent } from '../utils/api';

interface UpcomingEvent {
  title: string;
  date: string;
  registerLink: string;
  detailsLink: string;
  youtubeLink?: string;
  aparatLink?: string;
  instagramLink?: string;
  infoLink?: string;
  tags?: string[];
  description?: string;
  active?: boolean;
}

// Demo mode toggle (set to true to always show 3 demo events)
const DEMO_MODE = false; // Set to true for demo mode

const DEFAULT_EVENTS: UpcomingEvent[] = [
  {
    title: 'رویداد نمونه ۱',
    date: '2025-08-01T09:00:00Z',
    registerLink: '',
    detailsLink: '#',
    youtubeLink: '',
    aparatLink: '',
    instagramLink: '',
    infoLink: '#',
    tags: ['نمونه', 'آینده'],
    description: 'این یک رویداد نمونه است.',
    active: true
  },
  {
    title: 'رویداد نمونه ۲',
    date: '2025-09-01T10:00:00Z',
    registerLink: '#',
    detailsLink: '#',
    youtubeLink: '',
    aparatLink: '',
    instagramLink: '',
    infoLink: '#',
    tags: ['نمونه', 'آینده'],
    description: 'این یک رویداد نمونه است.',
    active: true
  },
  {
    title: 'رویداد نمونه ۳',
    date: '2025-12-20T15:00:00Z',
    registerLink: '#',
    detailsLink: '#',
    youtubeLink: '',
    aparatLink: '',
    instagramLink: '',
    infoLink: '#',
    tags: ['نمونه', 'آینده'],
    description: 'این یک رویداد نمونه است.',
    active: true
  }
];

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

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
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        if (DEMO_MODE) {
          setEvents(DEFAULT_EVENTS);
        } else {
          const data = await fetchContent<UpcomingEvent[] | UpcomingEvent>('upcoming-event.json');
          let arr: UpcomingEvent[] = Array.isArray(data) ? data : [data];
          arr = arr.filter(ev => ev && ev.title && ev.date);
          setEvents(arr);
        }
      } catch (err) {
        setError('خطا در بارگذاری رویدادهای آینده');
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Update countdowns for all events
  useEffect(() => {
    if (!events.length) {
      setCountdowns([]);
      return;
    }
    const updateCountdowns = () => {
      setCountdowns(events.slice(0, 3).map(ev => calculateCountdown(ev.date)));
    };
    updateCountdowns();
    const timer = setInterval(updateCountdowns, 1000);
    return () => clearInterval(timer);
  }, [events]);

  const displayEvents = DEMO_MODE
    ? DEFAULT_EVENTS
    : events.length === 0 && !isLoading
      ? []
      : events.filter(ev => ev.active !== false).slice(0, 3);

  if (isLoading) {
    return (
      <section id="upcoming-event-section" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  if (error || (!DEMO_MODE && displayEvents.length === 0)) {
    return (
      <section id="upcoming-event-section" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error">{error || 'هیچ رویداد آینده‌ای ثبت نشده است.'}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="upcoming-event-section" className="py-20 bg-base-200 scroll-animate">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">رویدادهای آینده</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayEvents.map((event, idx) => {
            const timeLeft = countdowns[idx] || { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
            return (
              <div key={idx} className="card bg-base-100 shadow-lg p-6 flex flex-col h-full">
                <div className="mb-4">
                  <img
                    src={`/images/gallery/event${idx + 1}.svg`}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  {event.tags && (
                    <div className="flex flex-wrap gap-2 mb-2 justify-center">
                      {event.tags.map((tag, i) => (
                        <span key={i} className="badge badge-outline badge-primary">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="mb-2 text-sm opacity-80 min-h-[48px]">{event.description}</p>
                </div>
                {/* Countdown Timer */}
                {!timeLeft.expired ? (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { value: timeLeft.days, label: 'روز' },
                      { value: timeLeft.hours, label: 'ساعت' },
                      { value: timeLeft.minutes, label: 'دقیقه' },
                      { value: timeLeft.seconds, label: 'ثانیه' }
                    ].map((item, i) => (
                      <div key={i} className="bg-base-300 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-primary">{item.value}</div>
                        <div className="text-xs opacity-80">{item.label}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info mb-4">
                    <span>زمان به پایان رسیده است.</span>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mt-auto">
                  {!timeLeft.expired ? (
                    <>
                      <a href={event.registerLink} className="btn btn-primary btn-sm">ثبت نام</a>
                      <a href={event.detailsLink} className="btn btn-outline btn-sm">جزئیات</a>
                    </>
                  ) : (
                    <>
                      {event.youtubeLink && (
                        <a href={event.youtubeLink} className="btn btn-outline btn-error btn-sm">یوتیوب</a>
                      )}
                      {event.aparatLink && (
                        <a href={event.aparatLink} className="btn btn-outline btn-sm">آپارات</a>
                      )}
                      {event.instagramLink && (
                        <a href={event.instagramLink} className="btn btn-outline btn-accent btn-sm">اینستاگرام</a>
                      )}
                      {event.infoLink && (
                        <a href={event.infoLink} className="btn btn-outline btn-info btn-sm">اطلاعات</a>
                      )}
                    </>
                  )}
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