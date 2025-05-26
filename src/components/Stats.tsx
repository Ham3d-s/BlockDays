import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { fetchContent } from '../utils/api'; // Import fetchContent
// Recharts imports are no longer needed
import { Users, Users2, BarChart3, Clock, Award, HelpCircle } from 'lucide-react'; // Removed TrendingUp, PieChart as PieIcon

// Interface for data from stats.json
interface JsonStatItem {
  icon: string; // Icon name as string e.g., "Award", "Users", "Clock"
  title: string;
  value: number;
  tooltip: string; // This will be mapped to 'context'
  suffix?: string;
}

interface StatItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  value: number;
  context: string; // New field for contextual explanation
  suffix?: string; // e.g., "+" or "K"
}

// Removed eventGrowthData and eventTypeData constants

const initialStatsData: StatItem[] = [
  { id: 'events', icon: <Award className="w-10 h-10" />, title: 'رویداد موفق', value: 60, context: 'تعداد کل رویدادهای موفق برگزار شده تا کنون', suffix: '+' },
  { id: 'participants', icon: <Users className="w-10 h-10" />, title: 'شرکت‌کننده', value: 15000, context: 'مجموع شرکت‌کنندگان در تمام رویدادهای ما', suffix: '+' },
  { id: 'speakers', icon: <Users2 className="w-10 h-10" />, title: 'سخنران متخصص', value: 200, context: 'تعداد سخنرانان و متخصصان برجسته دعوت شده', suffix: '+' },
  { id: 'hours', icon: <Clock className="w-10 h-10" />, title: 'ساعت محتوا', value: 800, context: 'مجموع ساعات محتوای آموزشی و تخصصی ارائه شده', suffix: '+' },
];

const Stats: React.FC = () => {
  const [statsData, setStatsData] = useState<StatItem[]>(initialStatsData);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { observeElement } = useIntersectionObserver();

  // Helper function to map icon string to ReactNode
  const mapIconStringToNode = (iconString?: string): React.ReactNode => {
    const iconProps = { className: "w-10 h-10" };
    switch (iconString?.toLowerCase()) {
      case 'award':
      case 'events': // Added alias based on initialStatsData id
        return <Award {...iconProps} />;
      case 'users':
      case 'participants': // Added alias
        return <Users {...iconProps} />;
      case 'users2':
      case 'speakers': // Added alias
        return <Users2 {...iconProps} />;
      case 'clock':
      case 'hours': // Added alias
        return <Clock {...iconProps} />;
      default:
        console.warn(`Unknown icon string: ${iconString}, using default.`);
        return <HelpCircle {...iconProps} />; // Default icon
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const jsonStats = await fetchContent<JsonStatItem[]>('stats.json');
        if (jsonStats && jsonStats.length > 0) {
          const transformedStats: StatItem[] = jsonStats.map((item, index) => ({
            id: item.title.toLowerCase().replace(/\s+/g, '-') || `stat-${index}`, // Generate ID
            icon: mapIconStringToNode(item.icon),
            title: item.title,
            value: item.value,
            context: item.tooltip, // Map tooltip to context
            suffix: item.suffix || (item.value > 1000 ? '+' : undefined), // Example default suffix logic
          }));
          setStatsData(transformedStats);
        } else {
          console.warn('Fetched stats.json is empty or invalid, using initial hardcoded data.');
          setStatsData(initialStatsData); // Fallback to initial data
        }
      } catch (error) {
        console.error('Failed to fetch or process stats.json:', error);
        setStatsData(initialStatsData); // Fallback to initial data on error
      }
    };

    loadStats();
  }, []); // Empty dependency array to run once on mount

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
    if (isVisible && statsData.length > 0) {
      statsData.forEach(stat => {
        animateStat(stat.id, stat.value);
      });
    }
  }, [isVisible, statsData]); // Keep this effect for animation logic

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
          آمار و دستاوردهای ما
        </h2>

        {/* Key Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {statsData.map((stat) => (
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

        {/* Charts Section Removed */}
      </div>
    </section>
  );
};

export default Stats;