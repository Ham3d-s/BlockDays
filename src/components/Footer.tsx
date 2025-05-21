import React, { useState, FormEvent } from 'react';
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { validateEmail } from '../utils/validation';
import { showToast } from '../utils/helpers';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    
    // Simulate submission
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      
      // Show success message
      showToast('با موفقیت در خبرنامه عضو شدید!', 'success');
      
      // Also show newsletter success message
      const messageEl = document.getElementById('newsletter-message');
      if (messageEl) {
        messageEl.textContent = 'با تشکر از عضویت شما در خبرنامه!';
        messageEl.classList.remove('hidden');
        
        setTimeout(() => {
          messageEl.classList.add('hidden');
        }, 5000);
      }
    }, 1000);
  };

  return (
    <footer className="bg-base-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Logo and description */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold">BlockDays</span>
            </div>
            <p className="mb-6 opacity-80 max-w-md">
              بلاک دیز محلی برای گردهمایی توسعه‌دهندگان، کارشناسان و علاقه‌مندان به فناوری بلاکچین است. ما با برگزاری رویدادها، میتاپ‌ها و تولید محتوای آموزشی، به گسترش دانش و فرهنگ بلاکچین کمک می‌کنیم.
            </p>
            
            {/* Social media links */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="btn btn-circle btn-ghost">
                <Instagram size={20} />
              </a>
              <a href="#" className="btn btn-circle btn-ghost">
                <Twitter size={20} />
              </a>
              <a href="#" className="btn btn-circle btn-ghost">
                <Youtube size={20} />
              </a>
              <a href="#" className="btn btn-circle btn-ghost">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-4">عضویت در خبرنامه</h3>
            <p className="mb-6 opacity-80">
              برای دریافت آخرین اخبار و رویدادهای بلاک دیز در خبرنامه ما عضو شوید.
            </p>
            
            <form id="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="form-control flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`input input-bordered w-full ${emailError ? 'input-error' : ''}`}
                    placeholder="ایمیل خود را وارد کنید"
                    dir="ltr"
                  />
                  {emailError && (
                    <label className="label">
                      <span className="label-text-alt text-error">{emailError}</span>
                    </label>
                  )}
                </div>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  عضویت
                </button>
              </div>
            </form>
            
            <p id="newsletter-message" className="mt-4 text-success hidden"></p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-base-content border-opacity-10 pt-8 text-center">
          <p>
            &copy; <span id="current-year">{new Date().getFullYear()}</span> BlockDays. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;