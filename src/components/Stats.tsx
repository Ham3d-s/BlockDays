import React, { useState, useEffect, useRef } from 'react';
import { fetchContent } from '../utils/api';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { Calendar, Users, Building2, Users2, Trophy, Presentation } from 'lucide-react';

interface Stat {
  icon: string;
  title: string;
  value: number;
  tooltip: string;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  
  const { observeElement } = useIntersectionObserver();

  useEffect(() => {
    if (statsRef.current) {
      observeElement(statsRef.current, (isIntersecting) => {
        if (isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      });
    }
  }, [observeElement, isVisible]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<Stat[]>('stats.json');
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError('خطا در بارگذاری آمار');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    if (isVisible && !animationStarted && stats.length > 0) {
      animateStats();
      setAnimationStarted(true);
    }
  }, [isVisible, animationStarted, stats]);

  const animateStats = () => {
    stats.forEach((stat, index) => {
      animateStat(index, stat.value);
    });
  };

  const animateStat = (index: number, targetValue: number) => {
    const element = document.getElementById(`stat-value-${index}`);
    if (!element) return;

    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    
    let frame = 0;
    const counter = Math.ceil(targetValue / totalFrames);
    
    const animate = () => {
      frame++;
      const currentValue = Math.min(counter * frame, targetValue);
      element.textContent = currentValue.toLocaleString('fa-IR');
      
      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const getIcon = (title: string) => {
    switch (title) {
      case 'برنامه‌ها':
        return <Presentation className="w-8 h-8" />;
      case 'سال‌ها':
        return <Calendar className="w-8 h-8" />;
      case 'مهمانان':
        return <Users2 className="w-8 h-8" />;
      case 'شرکت‌کنندگان':
        return <Users className="w-8 h-8" />;
      case 'حامیان':
        return <Building2 className="w-8 h-8" />;
      default:
        return <Trophy className="w-8 h-8" />;
    }
  };

  if (isLoading) {
    return (
      <section id="stats" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  if (error || stats.length === 0) {
    return (
      <section id="stats" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-error">{error || 'اطلاعات آماری در دسترس نیست'}</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="stats" 
      ref={statsRef}
      className="py-20 bg-base-100 scroll-animate"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          آمار و ارقام
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-base-200 p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition-all duration-300 group"
              title={stat.tooltip}
            >
              <div className="text-primary mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                {getIcon(stat.title)}
              </div>
              <h3 className="text-xl font-bold mb-2">{stat.title}</h3>
              <p 
                id={`stat-value-${index}`} 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
              >
                {stat.value.toLocaleString('fa-IR')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;