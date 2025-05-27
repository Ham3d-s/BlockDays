import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { fetchContent } from '../utils/api';
import { 
    Users, Users2, BarChart3, Clock, Award, HelpCircle, 
    CalendarDays, CalendarClock, UsersRound, Briefcase // Added new icons
} from 'lucide-react';

// Interface for data from stats.json
interface JsonStatItem {
  icon: string; // Icon name as string e.g., "Award", "Users", "Clock"
  title: string;
  value: number;
  tooltip: string; // This will be mapped to 'context'
  suffix?: string;
}

// Interface for what the component will use internally after transformation
interface StatItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  value: number;
  context: string;
  suffix?: string;
}

// Structure for the entire stats page data including a title
interface StatsPageData {
  title: string;
  items: JsonStatItem[]; // Items as they come from JSON
}

const defaultPageTitle = "آمار و دستاوردهای ما";

const initialPageData: StatsPageData = {
  title: defaultPageTitle,
  items: [ // Items here are JsonStatItem structure
    { icon: 'Award', title: 'رویداد موفق', value: 60, tooltip: 'تعداد کل رویدادهای موفق برگزار شده تا کنون', suffix: '+' },
    { icon: 'Users', title: 'شرکت‌کننده', value: 15000, tooltip: 'مجموع شرکت‌کنندگان در تمام رویدادهای ما', suffix: '+' },
    { icon: 'Users2', title: 'سخنران متخصص', value: 200, tooltip: 'تعداد سخنرانان و متخصصان برجسته دعوت شده', suffix: '+' },
    { icon: 'Clock', title: 'ساعت محتوا', value: 800, tooltip: 'مجموع ساعات محتوای آموزشی و تخصصی ارائه شده', suffix: '+' },
  ]
};

const Stats: React.FC = () => {
  const [pageData, setPageData] = useState<StatsPageData>(initialPageData);
  const [transformedStats, setTransformedStats] = useState<StatItem[]>([]);
  // const [isLoading, setIsLoading] = useState(true); // This was unused
  // const [error, setError] = useState(''); // Optional: for displaying fetch errors

  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { observeElement } = useIntersectionObserver();

  // Define mapIconStringToNode once in the component scope
  const mapIconStringToNode = (iconString?: string): React.ReactNode => {
    const iconProps = { className: "w-10 h-10" };
    switch (iconString?.toLowerCase()) {
      case 'award': return <Award {...iconProps} />;
      case 'users2': return <Users2 {...iconProps} />;
      case 'clock': return <Clock {...iconProps} />;
      case 'event': return <CalendarDays {...iconProps} />;
      case 'calendar_today': return <CalendarClock {...iconProps} />;
      case 'people': return <Users {...iconProps} />;
      case 'groups': return <UsersRound {...iconProps} />;
      case 'business': return <Briefcase {...iconProps} />;
      case 'events': return <Award {...iconProps} />;
      case 'participants': return <Users {...iconProps} />;
      case 'speakers': return <Users2 {...iconProps} />;
      case 'hours': return <Clock {...iconProps} />;
      default:
        console.warn(`Unknown icon string: ${iconString}, using default HelpCircle.`);
        return <HelpCircle {...iconProps} />;
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      // setIsLoading(true); // isLoading is unused
      try {
        const data = await fetchContent<StatsPageData>('stats.json');
        setPageData({
          title: data?.title || defaultPageTitle,
          items: data?.items || initialPageData.items,
        });
      } catch (error) {
        console.error('Failed to fetch or process stats.json:', error);
        // setError('Failed to load stats. Using default data.'); // Optional: set error state
        setPageData(initialPageData); // Fallback to initial data on error
      } finally {
        // setIsLoading(false); // isLoading is unused
      }
    };
    loadStats();
  }, []); 

  useEffect(() => {
    // Transform items when pageData.items changes
    const transformAndSetStats = (items: JsonStatItem[]) => {
        const mappedItems: StatItem[] = items.map((item, index) => ({
          id: item.title.toLowerCase().replace(/\s+/g, '-') || `stat-${index}`,
          icon: mapIconStringToNode(item.icon), // mapIconStringToNode needs to be accessible here
          title: item.title,
          value: item.value,
          context: item.tooltip,
          suffix: item.suffix || (item.value > 1000 ? '+' : undefined),
        }));
        setTransformedStats(mappedItems);
    };

    // mapIconStringToNode is now defined in the component scope, so it's accessible here
    // No need to redefine it.

    if (pageData.items) {
        transformAndSetStats(pageData.items);
    }
  }, [pageData.items]);


  useEffect(() => {
    const currentRef = statsRef.current;
    let disconnectObserver: (() => void) | null = null;

    if (currentRef) {
      disconnectObserver = observeElement(currentRef, (isIntersecting) => {
        if (isIntersecting) {
          setIsVisible(true);
          if (disconnectObserver) {
            disconnectObserver();
          }
        }
      });
    }
    return () => {
      if (disconnectObserver) {
        disconnectObserver();
      }
    };
  }, [observeElement]);


  useEffect(() => {
    if (isVisible && transformedStats.length > 0) {
      transformedStats.forEach(stat => {
        animateStat(stat.id, stat.value);
      });
    }
  }, [isVisible, transformedStats]);

  const animateStat = (statId: string, targetValue: number) => {
    const element = document.getElementById(`stat-value-${statId}`);
    if (!element) return;

    const duration = 2000; // ms
    const frameDuration = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameDuration);
    let currentFrame = 0;
    const initialValue = 0; // Or parse from element.textContent if resuming
    
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const animate = () => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.round(initialValue + (targetValue - initialValue) * easedProgress);
      
      element.textContent = currentValue.toLocaleString('fa-IR');
      
      if (currentFrame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = targetValue.toLocaleString('fa-IR'); // Ensure final value is exact
      }
    };
    requestAnimationFrame(animate);
  };

  // Removed renderCustomizedLabel and CustomTooltip functions

  return (
    <section id="stats" ref={statsRef} className="py-16 md:py-24 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          <BarChart3 className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          {pageData.title || defaultPageTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {transformedStats.map((stat) => (
            <div 
              key={stat.id} 
              className="bg-base-100 p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:shadow-primary/30 hover:-translate-y-1 group"
              title={stat.context}
            >
              <div className="text-primary mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <p 
                id={`stat-value-${stat.id}`} 
                className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary mb-1"
              >
                {isVisible ? '0' : stat.value.toLocaleString('fa-IR')} 
              </p>
              {stat.suffix && <span className="text-3xl md:text-4xl font-bold text-secondary/80">{stat.suffix}</span>}
              <h3 className="text-lg font-semibold mt-2 mb-1 text-base-content">{stat.title}</h3>
              <p className="text-xs text-base-content/70 px-2">{stat.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;