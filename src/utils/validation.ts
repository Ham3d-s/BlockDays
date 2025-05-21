/**
 * Validates name input
 * @param name The name to validate
 * @returns Error message or empty string if valid
 */
export const validateName = (name: string): string => {
  if (!name.trim()) {
    return 'نام نمی‌تواند خالی باشد';
  }
  
  if (name.trim().length < 3) {
    return 'نام باید حداقل ۳ کاراکتر باشد';
  }
  
  return '';
};

/**
 * Validates Iranian phone number
 * @param phone The phone number to validate
 * @returns Error message or empty string if valid
 */
export const validatePhone = (phone: string): string => {
  if (!phone.trim()) {
    return 'شماره تماس نمی‌تواند خالی باشد';
  }
  
  // Format for Iranian mobile numbers (e.g., 09123456789)
  const phoneRegex = /^(0|\+98|98)?9\d{9}$/;
  
  if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
    return 'شماره تماس وارد شده معتبر نیست';
  }
  
  return '';
};

/**
 * Validates message input
 * @param message The message to validate
 * @returns Error message or empty string if valid
 */
export const validateMessage = (message: string): string => {
  if (!message.trim()) {
    return 'پیام نمی‌تواند خالی باشد';
  }
  
  if (message.trim().length < 10) {
    return 'پیام باید حداقل ۱۰ کاراکتر باشد';
  }
  
  if (message.trim().length > 500) {
    return 'پیام نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد';
  }
  
  return '';
};

/**
 * Validates email address
 * @param email The email to validate
 * @returns Error message or empty string if valid
 */
export const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return 'ایمیل نمی‌تواند خالی باشد';
  }
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return 'ایمیل وارد شده معتبر نیست';
  }
  
  return '';
};