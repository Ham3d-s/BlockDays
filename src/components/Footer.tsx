import React, { useState, FormEvent, useEffect } from 'react';
import { Linkedin, Twitter, Send as TelegramIcon, Instagram, Youtube, Rss } from 'lucide-react'; // Keep relevant icons
import { validateEmail } from '../utils/validation';
import { showToast } from '../utils/helpers';
import { fetchContent } from '../utils/api';

interface SocialMediaLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface NewsletterConfig {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  privacyNote: string;
}

interface FooterConfig {
  brandName?: string;
  description: string;
  newsletter: NewsletterConfig;
  copyrightText: string;
  socialMediaLinks: SocialMediaLink[];
}

interface GlobalConfig {
  siteName: string;
}

const socialIconMap: { [key: string]: React.ElementType } = {
  Twitter: Twitter,
  Linkedin: Linkedin,
  Telegram: TelegramIcon,
  Instagram: Instagram,
  Youtube: Youtube,
  RSS: Rss,
  // Add other icons as needed
};

const renderSocialIcon = (iconName?: string) => {
  if (!iconName) return <TelegramIcon size={20} />; // Default icon
  const IconComponent = socialIconMap[iconName];
  return IconComponent ? <IconComponent size={20} /> : <TelegramIcon size={20} />;
};

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [footerData, setFooterData] = useState<FooterConfig | null>(null);
  const [globalData, setGlobalData] = useState<GlobalConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null); // Error state can be used to display specific error messages

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [footerRes, globalRes] = await Promise.allSettled([
          fetchContent<FooterConfig>('footer.json'),
          fetchContent<GlobalConfig>('global.json'),
        ]);

        if (footerRes.status === 'fulfilled') {
          setFooterData(footerRes.value);
        } else {
          console.error('Failed to load footer.json:', footerRes.reason);
          // setError(prev => prev ? `${prev}, Footer fetch failed` : 'Footer fetch failed');
        }

        if (globalRes.status === 'fulfilled') {
          setGlobalData(globalRes.value);
        } else {
          console.error('Failed to load global.json:', globalRes.reason);
          // setError(prev => prev ? `${prev}, Global fetch failed` : 'Global fetch failed');
        }
      } catch (e) {
        console.error("Error fetching footer/global configuration files:", e);
        // setError('Failed to load critical footer configuration.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorMsg = validateEmail(email);
    if (errorMsg) {
      setEmailError(errorMsg);
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate API call: await api.subscribeToNewsletter(email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('با موفقیت در خبرنامه عضو شدید!', 'success');
      setEmail('');
    } catch (apiError) {
      console.error("Newsletter subscription error:", apiError);
      showToast('خطا در عضویت خبرنامه. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const defaultFooterData: FooterConfig = {
    brandName: 'BlockDays',
    description: 'Your gateway to blockchain events in Iran and the Farsi-speaking region. Discover, organize, and celebrate blockchain events with BlockDays.',
    newsletter: {
      title: 'Subscribe to our Newsletter',
      description: 'Get the latest news, events, and expert analysis from BlockDays directly in your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      privacyNote: 'We respect your privacy and will not send spam.'
    },
    copyrightText: '© {year} BlockDays. All rights reserved.',
    socialMediaLinks: [
      { id: 'twitter', name: 'Twitter', url: 'https://twitter.com/BlockDaysIran', icon: 'Twitter' },
      { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/company/BlockDays', icon: 'Linkedin' },
    ]
  };

  const currentFooterData = footerData || defaultFooterData;
  const currentBrandName = currentFooterData.brandName || globalData?.siteName || defaultFooterData.brandName;
  const currentYear = new Date().getFullYear();
  const copyright = currentFooterData.copyrightText.replace('{year}', currentYear.toString());


  if (isLoading) {
    return (
      <footer className="bg-base-300 text-base-content pt-16 pb-8">
        <div className="container mx-auto px-4 text-center">
          <p>Loading Footer...</p>
        </div>
      </footer>
    );
  }
  
  // Even if there was an error, we use currentFooterData which has defaults
  return (
    <footer className="bg-base-300 text-base-content pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-10">
          <div className="space-y-4">
            <a href="/" className="text-3xl font-extrabold text-primary hover:text-primary-focus transition-colors">
              {currentBrandName}
            </a>
            <p className="text-sm opacity-80 leading-relaxed">
              {currentFooterData.description}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-secondary">{currentFooterData.newsletter.title}</h3>
            <p className="text-sm opacity-80 mb-4">
              {currentFooterData.newsletter.description}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="form-control w-full sm:flex-grow">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`input input-bordered input-sm sm:input-md w-full ${emailError ? 'input-error' : 'border-base-content/20'}`}
                  placeholder={currentFooterData.newsletter.placeholder}
                  dir="ltr"
                  required
                />
                {emailError && <span className="text-error text-xs mt-1">{emailError}</span>}
              </div>
              <button 
                type="submit" 
                className={`btn btn-primary btn-sm sm:btn-md ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? '...' : currentFooterData.newsletter.buttonText}
              </button>
            </form>
            <p className="text-xs opacity-60 mt-2">{currentFooterData.newsletter.privacyNote}</p>
          </div>
        </div>

        <div className="border-t border-base-content/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-70 text-center sm:text-right">
            {copyright}
          </p>
          <div className="flex space-x-3 rtl:space-x-reverse">
            {currentFooterData.socialMediaLinks.map(social => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {renderSocialIcon(social.icon)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;