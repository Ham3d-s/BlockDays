import React, { useState, ChangeEvent, FormEvent } from 'react';
import { validateName, validateEmail, validateMessage } from '../utils/validation';
import { Mail, MessageSquareText, User, Send, Linkedin, Twitter, Send as TelegramIcon } from 'lucide-react'; // Renamed MessageSquare to MessageSquareText

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Changed from phone to email
    message: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '', // Changed from phone to email
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (submitStatus !== 'idle') setSubmitStatus('idle'); // Reset submit status on new input
  };

  const validateField = (name: keyof typeof formData, value: string): boolean => {
    let error = '';
    switch(name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email': // Changed from phone to email
        error = validateEmail(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
      default:
        // This case should not be reached if 'name' is correctly typed
        const exhaustiveCheck: never = name; 
        return exhaustiveCheck;
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
    
    if (!nameValid || !emailValid || !messageValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call: await api.submitForm(formData);
      // console.log("Form data submitted:", formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' }); // Clear form
      setTimeout(() => setSubmitStatus('idle'), 5000); 
    } catch (apiError) {
      console.error("Form submission error:", apiError);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-base-200 to-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            <MessageSquareText className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" /> {/* Renamed icon */}
            در تماس باشید
          </h2>
          <p className="text-base-content/80 text-lg md:text-xl max-w-2xl mx-auto">
            سوال، پیشنهاد یا انتقادی دارید؟ فرم زیر را پر کنید یا از طریق راه‌های ارتباطی دیگر با ما در میان بگذارید.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto bg-base-100 p-6 sm:p-8 rounded-xl shadow-xl">
          {submitStatus === 'success' && (
            <div role="alert" className="alert alert-success mb-6 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>پیام شما با موفقیت ارسال شد. سپاس از شما!</span>
            </div>
          )}
           {submitStatus === 'error' && (
            <div role="alert" className="alert alert-error mb-6 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>خطا در ارسال پیام. لطفاً دوباره تلاش کنید یا از روش‌های دیگر استفاده نمایید.</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <div className="form-control mb-5">
              <label className="label" htmlFor="name">
                <span className="label-text text-base font-medium">نام و نام خانوادگی</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
                <input
                  id="name" type="text" name="name"
                  className={`input input-bordered input-primary w-full pl-10 pr-2 ${errors.name ? 'input-error' : ''}`}
                  value={formData.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="مثال: مریم رضایی" required
                />
              </div>
              {errors.name && <span className="text-error text-xs mt-1 mr-1">{errors.name}</span>}
            </div>
            
            {/* Email Field */}
            <div className="form-control mb-5">
              <label className="label" htmlFor="email">
                <span className="label-text text-base font-medium">آدرس ایمیل</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
                <input
                  id="email" type="email" name="email"
                  className={`input input-bordered input-primary w-full pl-10 pr-2 ${errors.email ? 'input-error' : ''}`}
                  value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder="مثال: user@example.com" required dir="ltr"
                />
              </div>
              {errors.email && <span className="text-error text-xs mt-1 mr-1">{errors.email}</span>}
            </div>
            
            {/* Message Field */}
            <div className="form-control mb-6">
              <label className="label" htmlFor="message">
                <span className="label-text text-base font-medium">پیام شما</span>
              </label>
              <textarea
                id="message" name="message"
                className={`textarea textarea-bordered textarea-primary w-full h-36 text-base ${errors.message ? 'textarea-error' : ''}`}
                value={formData.message} onChange={handleChange} onBlur={handleBlur}
                placeholder="متن پیام خود را اینجا بنویسید..." required
              />
              {errors.message && <span className="text-error text-xs mt-1 mr-1">{errors.message}</span>}
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary btn-block text-lg ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              <Send size={20} className="ml-2"/>
              {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
            </button>
          </form>
        </div>

        {/* Alternative Contact Methods */}
        <div className="mt-16 text-center">
          <h3 className="text-xl md:text-2xl font-semibold mb-6 text-base-content">یا از این طریق با ما در ارتباط باشید:</h3>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <a href="mailto:info@blockdays.com" className="btn btn-outline btn-neutral gap-2 text-sm sm:text-base group hover:text-primary">
              <Mail size={18} className="text-primary group-hover:text-primary-content" /> info@blockdays.com
            </a>
            <a href="https://twitter.com/BlockDaysIran" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-neutral gap-2 text-sm sm:text-base group hover:text-[#1DA1F2] hover:border-[#1DA1F2]">
              <Twitter size={18} className="text-[#1DA1F2] group-hover:text-white" /> توییتر رسمی
            </a>
            <a href="https://t.me/BlockDaysSupport" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-neutral gap-2 text-sm sm:text-base group hover:text-[#2AABEE] hover:border-[#2AABEE]">
              <TelegramIcon size={18} className="text-[#2AABEE] group-hover:text-white" /> پشتیبانی تلگرام
            </a>
            <a href="https://linkedin.com/company/BlockDays" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-neutral gap-2 text-sm sm:text-base group hover:text-[#0A66C2] hover:border-[#0A66C2]">
              <Linkedin size={18} className="text-[#0A66C2] group-hover:text-white" /> صفحه لینکدین
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;