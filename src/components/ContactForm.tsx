import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { validateName, validateEmail, validateMessage } from '../utils/validation';
import { Mail, MessageSquareText, User, Send, Linkedin, Twitter, Send as TelegramIcon, ExternalLink, Users } from 'lucide-react';
import { fetchContent } from '../utils/api';

interface ContactFormLabels { name: string; email: string; message: string; }
interface ContactFormPlaceholders { name: string; email: string; message: string; }
interface AltContactLink { id: string; text: string; url: string; icon: string; }
interface ContactFormConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  labels: ContactFormLabels;
  placeholders: ContactFormPlaceholders;
  buttonText: string;
  buttonTextSubmitting: string;
  successMessage: string;
  errorMessage: string;
  alternativeContactTitle: string;
  alternativeContactLinks: AltContactLink[];
}

const altContactIconMap: { [key: string]: React.ElementType } = {
  Mail: Mail,
  Twitter: Twitter,
  Telegram: TelegramIcon,
  Linkedin: Linkedin,
  Discord: Users, // Example, replace with actual Discord icon if available or needed
  Default: ExternalLink,
};

const renderAltContactIcon = (iconName?: string) => {
  if (!iconName) return <ExternalLink size={18} />;
  const IconComponent = altContactIconMap[iconName] || altContactIconMap.Default;
  return <IconComponent size={18} />;
};

const defaultContent: ContactFormConfig = {
  sectionTitle: "در تماس باشید",
  sectionSubtitle: "سوال، پیشنهاد یا انتقادی دارید؟ فرم زیر را پر کنید یا از طریق راه‌های ارتباطی دیگر با ما در میان بگذارید.",
  labels: { name: "نام و نام خانوادگی", email: "آدرس ایمیل", message: "پیام شما" },
  placeholders: { name: "مثال: مریم رضایی", email: "مثال: user@example.com", message: "متن پیام خود را اینجا بنویسید..." },
  buttonText: "ارسال پیام",
  buttonTextSubmitting: "در حال ارسال...",
  successMessage: "پیام شما با موفقیت ارسال شد. سپاس از شما!",
  errorMessage: "خطا در ارسال پیام. لطفاً دوباره تلاش کنید یا از روش‌های دیگر استفاده نمایید.",
  alternativeContactTitle: "یا از این طریق با ما در ارتباط باشید:",
  alternativeContactLinks: [
    {id: "email-alt", text: "info@blockdays.com", url:"mailto:info@blockdays.com", icon: "Mail"},
    {id: "twitter-alt", text: "توییتر رسمی", url:"https://twitter.com/BlockDaysIran", icon: "Twitter"},
  ]
};

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [content, setContent] = useState<ContactFormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [fetchError, setFetchError] = useState<string | null>(null); // To display specific fetch errors

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchContent<ContactFormConfig>('contact-form.json');
        setContent(data);
      } catch (e) {
        console.error("Failed to fetch contact-form.json:", e);
        // setFetchError('Failed to load contact form content.');
        // Use default content if fetch fails to ensure basic functionality
        setContent(defaultContent);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // defaultContent is now defined in module scope, so it's a stable dependency
  
  const currentContent = content || defaultContent;


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  };

  const validateField = (name: keyof typeof formData, value: string): boolean => {
    let error = '';
    switch(name) {
      case 'name': error = validateName(value); break;
      case 'email': error = validateEmail(value); break;
      case 'message': error = validateMessage(value); break;
      default: { const exhaustiveCheck: never = name; return exhaustiveCheck; }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData; value: string };
    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus('idle');
    const nameValid = validateField('name', formData.name);
    const emailValid = validateField('email', formData.email); 
    const messageValid = validateField('message', formData.message);
    
    if (!nameValid || !emailValid || !messageValid) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000); 
    } catch (apiError) {
      console.error("Form submission error:", apiError);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-base-200 to-base-100">
        <div className="container mx-auto px-4 text-center">
          <p>Loading Contact Form...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-base-200 to-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            <MessageSquareText className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
            {currentContent.sectionTitle}
          </h2>
          <p className="text-base-content/80 text-lg md:text-xl max-w-2xl mx-auto">
            {currentContent.sectionSubtitle}
          </p>
        </div>
        
        <div className="max-w-xl mx-auto bg-base-100 p-6 sm:p-8 rounded-xl shadow-xl">
          {submitStatus === 'success' && (
            <div role="alert" className="alert alert-success mb-6 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{currentContent.successMessage}</span>
            </div>
          )}
           {submitStatus === 'error' && (
            <div role="alert" className="alert alert-error mb-6 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{currentContent.errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-control mb-5">
              <label className="label" htmlFor="name">
                <span className="label-text text-base font-medium">{currentContent.labels.name}</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
                <input
                  id="name" type="text" name="name"
                  className={`input input-bordered input-primary w-full pl-10 pr-2 ${errors.name ? 'input-error' : ''}`}
                  value={formData.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder={currentContent.placeholders.name} required
                />
              </div>
              {errors.name && <span className="text-error text-xs mt-1 mr-1">{errors.name}</span>}
            </div>
            
            <div className="form-control mb-5">
              <label className="label" htmlFor="email">
                <span className="label-text text-base font-medium">{currentContent.labels.email}</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
                <input
                  id="email" type="email" name="email"
                  className={`input input-bordered input-primary w-full pl-10 pr-2 ${errors.email ? 'input-error' : ''}`}
                  value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder={currentContent.placeholders.email} required dir="ltr"
                />
              </div>
              {errors.email && <span className="text-error text-xs mt-1 mr-1">{errors.email}</span>}
            </div>
            
            <div className="form-control mb-6">
              <label className="label" htmlFor="message">
                <span className="label-text text-base font-medium">{currentContent.labels.message}</span>
              </label>
              <textarea
                id="message" name="message"
                className={`textarea textarea-bordered textarea-primary w-full h-36 text-base ${errors.message ? 'textarea-error' : ''}`}
                value={formData.message} onChange={handleChange} onBlur={handleBlur}
                placeholder={currentContent.placeholders.message} required
              />
              {errors.message && <span className="text-error text-xs mt-1 mr-1">{errors.message}</span>}
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary btn-block text-lg ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              <Send size={20} className="ml-2"/>
              {isSubmitting ? currentContent.buttonTextSubmitting : currentContent.buttonText}
            </button>
          </form>
        </div>

        {currentContent.alternativeContactLinks && currentContent.alternativeContactLinks.length > 0 && (
          <div className="mt-16 text-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-6 text-base-content">
              {currentContent.alternativeContactTitle || "یا از این طریق با ما در ارتباط باشید:"}
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              {currentContent.alternativeContactLinks.map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline btn-neutral gap-2 text-sm sm:text-base group hover:text-primary"
                >
                  {renderAltContactIcon(link.icon)} {link.text}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactForm;