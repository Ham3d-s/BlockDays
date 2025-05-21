import React, { useState, ChangeEvent, FormEvent } from 'react';
import { validateName, validatePhone, validateMessage } from '../utils/validation';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch(name) {
      case 'name':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValid = validateField('name', formData.name);
    const phoneValid = validateField('phone', formData.phone);
    const messageValid = validateField('message', formData.message);
    
    if (!nameValid || !phoneValid || !messageValid) {
      return;
    }
    
    // Begin submission
    setIsSubmitting(true);
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', phone: '', message: '' });
      
      // Hide success message after a few seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 bg-base-100 scroll-animate">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">تماس با ما</h2>
        
        <div className="max-w-lg mx-auto">
          {submitSuccess && (
            <div id="form-submission-message" className="alert alert-success mb-6">
              <span>پیام شما با موفقیت ارسال شد. با تشکر از ارتباط شما!</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">نام و نام خانوادگی</span>
              </label>
              <input
                type="text"
                name="name"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="نام و نام خانوادگی خود را وارد کنید"
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name}</span>
                </label>
              )}
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">شماره تماس</span>
              </label>
              <input
                type="tel"
                name="phone"
                className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="شماره تماس خود را وارد کنید"
                dir="ltr"
              />
              {errors.phone && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.phone}</span>
                </label>
              )}
            </div>
            
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">پیام</span>
              </label>
              <textarea
                name="message"
                className={`textarea textarea-bordered w-full h-32 ${errors.message ? 'textarea-error' : ''}`}
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="پیام خود را بنویسید"
              />
              {errors.message && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.message}</span>
                </label>
              )}
            </div>
            
            <div className="form-control">
              <button 
                type="submit" 
                className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;