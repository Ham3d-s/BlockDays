import React, { useState, FormEvent } from 'react';
import { Linkedin, Twitter, Send as TelegramIcon, FileText, Shield, Users, Mail, Briefcase } from 'lucide-react'; // Added more icons
import { validateEmail } from '../utils/validation';
import { showToast } from '../utils/helpers'; // Assuming this is a custom helper

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    try {
      // await api.subscribeToNewsletter(email); // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('با موفقیت در خبرنامه عضو شدید!', 'success');
      setEmail('');
      // The original code had a direct DOM manipulation for a message, 
      // using showToast is generally better for React. If a persistent message is needed, state is preferred.
    } catch (apiError) {
      console.error("Newsletter subscription error:", apiError);
      showToast('خطا در عضویت خبرنامه. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const importantLinks = [
    { href: '#about-us', label: 'درباره ما', icon: <Users size={16} className="ml-2" /> },
    { href: '#privacy-policy', label: 'سیاست حفظ حریم خصوصی', icon: <Shield size={16} className="ml-2" /> },
    { href: '#terms-of-service', label: 'شرایط خدمات', icon: <FileText size={16} className="ml-2" /> },
    { href: '#contact-us', label: 'تماس با ما', icon: <Mail size={16} className="ml-2" /> },
    // { href: '#careers', label: 'فرصت‌های شغلی', icon: <Briefcase size={16} className="ml-2" /> }, // Example of another link
  ];

  const socialMediaLinks = [
    { href: 'https://twitter.com/BlockDaysIran', label: 'Twitter', icon: <Twitter size={20} />, name: 'توییتر' },
    { href: 'https://linkedin.com/company/BlockDays', label: 'LinkedIn', icon: <Linkedin size={20} />, name: 'لینکدین' },
    { href: 'https://t.me/BlockDaysChannel', label: 'Telegram', icon: <TelegramIcon size={20} />, name: 'تلگرام' },
    // { href: 'https://instagram.com/BlockDays', label: 'Instagram', icon: <Instagram size={20} />, name: 'اینستاگرام' }, // Example
  ];

  return (
    <footer className="bg-base-300 text-base-content pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10">
          {/* Column 1: Brand Info & Description */}
          <div className="space-y-4">
            <a href="/" className="text-3xl font-extrabold text-primary hover:text-primary-focus transition-colors">
              BlockDays
            </a>
            <p className="text-sm opacity-80 leading-relaxed">
              بلاک دیز، پلتفرم جامع شما برای کشف، سازماندهی و شرکت در رویدادهای بلاکچین در ایران و منطقه فارسی‌زبان. به جامعه پیشرو در فناوری بپیوندید.
            </p>
          </div>

          {/* Column 2: Important Links */}
          <div className="md:col-start-auto"> {/* Adjusted for potential 3-col on md */}
            <h3 className="text-lg font-semibold mb-4 text-secondary">لینک‌های مهم</h3>
            <ul className="space-y-2">
              {importantLinks.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-primary transition-colors flex items-center opacity-80 hover:opacity-100">
                    {link.icon} {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="lg:col-span-2"> {/* Newsletter takes more space on large screens */}
            <h3 className="text-lg font-semibold mb-4 text-secondary">عضویت در خبرنامه</h3>
            <p className="text-sm opacity-80 mb-4">
              برای دریافت آخرین اخبار، رویدادها و تحلیل‌های تخصصی بلاک دیز، در خبرنامه ما عضو شوید.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="form-control w-full sm:flex-grow">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`input input-bordered input-sm sm:input-md w-full ${emailError ? 'input-error' : 'border-base-content/20'}`}
                  placeholder="ایمیل خود را وارد کنید"
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
                {isSubmitting ? 'عضویت...' : 'عضویت'}
              </button>
            </form>
            <p className="text-xs opacity-60 mt-2">ما به حریم خصوصی شما احترام می‌گذاریم و اسپم ارسال نمی‌کنیم.</p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Media */}
        <div className="border-t border-base-content/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-70 text-center sm:text-right">
            &copy; {new Date().getFullYear()} BlockDays. تمامی حقوق محفوظ است.
          </p>
          <div className="flex space-x-3 rtl:space-x-reverse">
            {socialMediaLinks.map(social => (
              <a 
                key={social.label} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;