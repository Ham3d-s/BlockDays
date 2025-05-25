import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Calendar, Users, Image, Building2, HelpCircle, Phone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'hero';
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionId = section.getAttribute('id');
        
        if (sectionTop <= 100 && sectionId) {
          currentSection = sectionId;
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { id: 'hero', label: 'خانه', icon: <Calendar size={18} /> },
    { id: 'upcoming-event-section', label: 'رویداد آینده', icon: <Calendar size={18} /> },
    { id: 'stats', label: 'آمار', icon: <Users size={18} /> },
    { id: 'past-events', label: 'رویدادهای گذشته', icon: <Calendar size={18} /> },
    { id: 'gallery', label: 'گالری', icon: <Image size={18} /> },
    { id: 'sponsors', label: 'حامیان', icon: <Building2 size={18} /> },
    { id: 'faq', label: 'سوالات متداول', icon: <HelpCircle size={18} /> },
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header 
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm
        ${isScrolled ? 'bg-base-300/80 shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex-1">
          <button 
            onClick={() => scrollToSection('hero')}
            className="btn btn-ghost text-xl font-bold"
          >
            BlockDays
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

        <nav className="flex-none hidden lg:flex items-center gap-2">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`btn btn-ghost btn-sm gap-2 ${activeSection === item.id ? 'text-primary' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          <button 
            className="btn btn-primary btn-sm gap-2"
            onClick={() => scrollToSection('contact')}
          >
            <Phone size={18} />
            تماس با ما
          </button>
          
          <button 
            className="btn btn-ghost btn-circle btn-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-base-300/95 backdrop-blur-sm shadow-lg py-4">
          <nav className="container mx-auto px-4">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`btn btn-ghost btn-sm w-full justify-start gap-2 mb-2 ${
                  activeSection === item.id ? 'text-primary' : ''
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            
            <button
              onClick={() => scrollToSection('contact')}
              className="btn btn-primary btn-sm w-full justify-start gap-2 mb-2"
            >
              <Phone size={18} />
              تماس با ما
            </button>
            
            <button 
              className="btn btn-ghost btn-sm w-full justify-start gap-2"
              onClick={toggleTheme}
              aria-label={`تغییر به حالت ${theme === 'light' ? 'تاریک' : 'روشن'}`}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={18} />
                  <span>حالت تاریک</span>
                </>
              ) : (
                <>
                  <Sun size={18} />
                  <span>حالت روشن</span>
                </>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;