import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Users, Image as ImageIconProp, Building2, HelpCircle, Phone, Home, Info, Star, Briefcase, Mail, ShieldCheck, Settings } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { fetchContent } from '../utils/api';

interface NavLink {
  id: string;
  label: string;
  target: string;
  icon?: string;
  isPrimary?: boolean;
}

interface HeaderConfig {
  brandName?: string;
  logoUrl?: string;
  navLinks: NavLink[];
}

interface GlobalConfig {
  siteName: string;
  siteLogoUrl?: string; // Keep it optional as per original GlobalSettingsType
}

const iconMap: { [key: string]: React.ElementType } = {
  Home: Home,
  Info: Info,
  Star: Star,
  Calendar: Calendar,
  Users: Users,
  Image: ImageIconProp,
  Building2: Building2,
  HelpCircle: HelpCircle,
  Phone: Phone,
  Briefcase: Briefcase,
  Mail: Mail,
  ShieldCheck: ShieldCheck,
  Settings: Settings,
  // Add other icons as needed
};

const renderIcon = (iconName?: string) => {
  if (!iconName) return null;
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent size={18} /> : null;
};


const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const [headerData, setHeaderData] = useState<HeaderConfig | null>(null);
  const [globalData, setGlobalData] = useState<GlobalConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [headerRes, globalRes] = await Promise.allSettled([
          fetchContent<HeaderConfig>('header.json'),
          fetchContent<GlobalConfig>('global.json'),
        ]);

        if (headerRes.status === 'fulfilled') {
          setHeaderData(headerRes.value);
        } else {
          console.error('Failed to load header.json:', headerRes.reason);
          setError(prev => prev ? `${prev}, Header fetch failed` : 'Header fetch failed');
        }

        if (globalRes.status === 'fulfilled') {
          setGlobalData(globalRes.value);
        } else {
          console.error('Failed to load global.json:', globalRes.reason);
           setError(prev => prev ? `${prev}, Global fetch failed` : 'Global fetch failed');
        }
      } catch (e) {
        console.error("Error fetching configuration files:", e);
        setError('Failed to load critical configuration.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'hero';
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
          currentSection = section.getAttribute('id') || 'hero';
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Remove '#' if present, as getElementById doesn't need it
    const idToScroll = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
    const section = document.getElementById(idToScroll);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Section with ID "${idToScroll}" not found.`);
    }
    setIsMenuOpen(false);
  };
  
  const brandName = headerData?.brandName || globalData?.siteName || 'BlockDays';
  const logoUrl = headerData?.logoUrl || globalData?.siteLogoUrl; // Prioritize header logo

  const defaultNavLinks: NavLink[] = [
    { id: 'home-fallback', label: 'Home', target: '#hero', icon: 'Home' },
  ];
  const navigationItems = headerData?.navLinks || defaultNavLinks;

  if (isLoading) {
    return (
      <header className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-base-300/80 shadow-lg`}>
        <div className="container mx-auto px-4">
          <div className="flex-1">
            <span className="text-xl font-bold">Loading...</span>
          </div>
        </div>
      </header>
    );
  }
  
  if (error && !headerData) {
     return (
      <header className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-base-300/80 shadow-lg`}>
        <div className="container mx-auto px-4">
          <div className="flex-1">
            <a href="#hero" className="btn btn-ghost text-xl font-bold">{brandName} (Error)</a>
          </div>
           <nav className="flex-none hidden lg:flex items-center gap-2">
             <ThemeSwitcher />
           </nav>
        </div>
      </header>
    );
  }


  const renderNavButton = (item: NavLink, isMobile: boolean = false) => (
    <button
      key={item.id}
      onClick={() => scrollToSection(item.target)}
      className={`btn btn-sm gap-2 ${item.isPrimary ? 'btn-primary' : 'btn-ghost'} 
                  ${activeSection === (item.target.startsWith('#') ? item.target.substring(1) : item.target) ? 'text-primary ring ring-primary/50' : ''}
                  ${isMobile ? 'w-full justify-start mb-2' : ''}`}
    >
      {renderIcon(item.icon)}
      {item.label}
    </button>
  );

  return (
    <header 
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm
        ${isScrolled ? 'bg-base-300/80 shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex-1">
          <button 
            onClick={() => scrollToSection('hero')}
            className="btn btn-ghost text-xl font-bold flex items-center gap-2"
          >
            {logoUrl && <img src={logoUrl} alt={brandName} className="h-8 w-auto" />}
            {!logoUrl && brandName}
          </button>
        </div>

        <div className="flex-none lg:hidden">
          <button 
            className="btn btn-ghost" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-none hidden lg:flex items-center gap-1">
          {navigationItems.map(item => renderNavButton(item))}
          <ThemeSwitcher />
        </nav>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-base-300/95 backdrop-blur-sm shadow-lg py-4">
          <nav className="container mx-auto px-4">
            {navigationItems.map(item => renderNavButton(item, true))}
            <div className="mt-2">
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;