import React, { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Text } from 'recharts';
import { Users, Users2, BarChart3, Clock, Award, TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface StatItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  value: number;
  context: string; // New field for contextual explanation
  suffix?: string; // e.g., "+" or "K"
}

// Sample data for charts
const eventGrowthData = [
  { year: '۱۳۹۹', participants: 500 },
  { year: '۱۴۰۰', participants: 1200 },
  { year: '۱۴۰۱', participants: 1800 },
  { year: '۱۴۰۲', participants: 2500 },
  { year: '۱۴۰۳', participants: 3200 }, // Projected
];

const eventTypeData = [
  { name: 'همایش‌ها', value: 45, fill: 'hsl(var(--p))' }, // Using DaisyUI primary color
  { name: 'کارگاه‌ها', value: 35, fill: 'hsl(var(--s))' }, // Using DaisyUI secondary color
  { name: 'میت‌آپ‌ها', value: 20, fill: 'hsl(var(--a))' },   // Using DaisyUI accent color
];

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
  
  const { observeElement, unobserveElement } = useIntersectionObserver();

  useEffect(() => {
    const currentRef = statsRef.current;
    if (currentRef) {
      observeElement(currentRef, (isIntersecting) => {
        if (isIntersecting) {
          setIsVisible(true);
          // Optional: unobserve after first intersection if animation should only run once
          // unobserveElement(currentRef); 
        }
      });
    }
    return () => {
      if (currentRef) {
        unobserveElement(currentRef);
      }
    };
  }, [observeElement, unobserveElement]);

  useEffect(() => {
    if (isVisible && statsData.length > 0) {
      statsData.forEach(stat => {
        animateStat(stat.id, stat.value);
      });
    }
  }, [isVisible, statsData]);

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

  // Custom Label for Pie Chart
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
        {`${name} (${percentage}%)`}
      </text>
    );
  };
  
  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-base-300 border border-base-content/20 rounded-lg shadow-lg">
          <p className="label text-sm font-semibold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.fill }} className="text-sm">
              {`${pld.name}: ${pld.value.toLocaleString('fa-IR')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <section id="stats" ref={statsRef} className="py-16 md:py-24 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          <BarChart3 className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          آمار و دستاوردهای ما
        </h2>

        {/* Key Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 md:mb-16">
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Bar Chart - Event Growth */}
          <div className="bg-base-100 p-4 sm:p-6 rounded-xl shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center text-base-content/90">
              <TrendingUp className="inline-block w-6 h-6 mr-2 text-accent" />
              روند رشد شرکت‌کنندگان
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={eventGrowthData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--bc) / 0.7)', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => value.toLocaleString('fa-IR')} tick={{ fill: 'hsl(var(--bc) / 0.7)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--b1)/0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} payload={[{ value: 'تعداد شرکت‌کنندگان', type: 'square', color: 'hsl(var(--p))' }]}/>
                <Bar dataKey="participants" name="شرکت‌کنندگان" fill="hsl(var(--p))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Event Types */}
          <div className="bg-base-100 p-4 sm:p-6 rounded-xl shadow-lg">
            <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center text-base-content/90">
              <PieIcon className="inline-block w-6 h-6 mr-2 text-accent" />
              توزیع انواع رویدادها
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  dataKey="value"
                  nameKey="name"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none hover:opacity-80 transition-opacity"/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {/* <Legend wrapperStyle={{ fontSize: '14px' }} /> */}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;