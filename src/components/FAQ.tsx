import React, { useState, useEffect, useMemo } from 'react';
import { fetchContent } from '../utils/api';
import { HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  questions: FAQItem[];
}

const DEMO_MODE = true; // Enable to use hardcoded demo FAQs

const DEMO_FAQS: FAQCategory[] = [
  {
    id: 'cat-general',
    name: 'سوالات عمومی',
    questions: [
      { id: 'gen1', question: 'بلاک دیز چیست؟', answer: 'بلاک دیز یک پلتفرم جامع برای کشف، سازماندهی و شرکت در رویدادهای مرتبط با بلاکچین در ایران و منطقه فارسی‌زبان است. هدف ما ایجاد جامعه‌ای پویا و آگاه از آخرین تحولات این حوزه است.' },
      { id: 'gen2', question: 'چگونه می‌توانم در بلاک دیز ثبت نام کنم؟', answer: 'برای ثبت نام کافیست به صفحه عضویت مراجعه کرده و فرم مربوطه را تکمیل نمایید. پس از آن می‌توانید از تمامی امکانات پلتفرم بهره‌مند شوید.' },
      { id: 'gen3', question: 'آیا استفاده از خدمات بلاک دیز هزینه‌ای دارد؟', answer: 'ثبت نام و استفاده از بسیاری از خدمات بلاک دیز رایگان است. برخی رویدادها یا خدمات ویژه ممکن است شامل هزینه باشند که به طور شفاف اطلاع‌رسانی خواهد شد.' },
    ],
  },
  {
    id: 'cat-events',
    name: 'رویدادها',
    questions: [
      { id: 'evt1', question: 'چگونه می‌توانم یک رویداد جدید ثبت کنم؟', answer: 'پس از ورود به حساب کاربری خود، به بخش "ثبت رویداد جدید" مراجعه کرده و اطلاعات کامل رویداد خود را وارد نمایید. تیم ما پس از بررسی، رویداد شما را منتشر خواهد کرد.' },
      { id: 'evt2', question: 'چگونه می‌توانم برای شرکت در یک رویداد ثبت نام کنم؟', answer: 'در صفحه هر رویداد، دکمه "ثبت نام" یا لینک مربوط به آن قرار داده شده است. با کلیک بر روی آن و طی کردن مراحل، ثبت نام شما نهایی می‌شود.' },
      { id: 'evt3', question: 'آیا امکان مشاهده آنلاین رویدادها وجود دارد؟', answer: 'بسیاری از رویدادها، به خصوص وبینارها، امکان پخش آنلاین دارند. همچنین، ویدیوهای ضبط شده برخی رویدادهای گذشته نیز در آرشیو سایت موجود است.' },
      { id: 'evt4', question: 'اگر رویدادی لغو شود، چه اتفاقی می‌افتد؟', answer: 'در صورت لغو یک رویداد، به تمامی ثبت‌نام‌کنندگان از طریق ایمیل یا پیامک اطلاع‌رسانی خواهد شد و در صورت وجود هزینه، استرداد وجه طبق قوانین انجام می‌شود.' },
    ],
  },
  {
    id: 'cat-sponsorship',
    name: 'حمایت مالی و همکاری',
    questions: [
      { id: 'spn1', question: 'چگونه می‌توانم حامی مالی رویدادهای بلاک دیز شوم؟', answer: 'ما از همکاری با سازمان‌ها و شرکت‌های علاقه‌مند به حمایت از اکوسیستم بلاکچین استقبال می‌کنیم. لطفاً به صفحه "همکاری با ما" مراجعه کنید یا با ایمیل info@blockdays.com تماس بگیرید تا پکیج‌های حمایتی ما را دریافت کنید.' },
      { id: 'spn2', question: 'چه مزایایی برای حامیان مالی در نظر گرفته شده است؟', answer: 'حامیان مالی از مزایای متنوعی مانند نمایش لوگو در وبسایت و کمپین‌های تبلیغاتی، ارائه در رویدادها، و فرصت‌های شبکه‌سازی ویژه برخوردار خواهند شد. جزئیات کامل در پکیج‌های حمایتی موجود است.' },
    ],
  },
  {
    id: 'cat-technical',
    name: 'مسائل فنی',
    questions: [
      { id: 'tech1', question: 'در صورت بروز مشکل فنی در سایت چه کار کنم؟', answer: 'اگر با مشکل فنی مواجه شدید، لطفاً ابتدا از بروز بودن مرورگر خود اطمینان حاصل کنید. در صورت ادامه مشکل، از طریق صفحه "تماس با ما" یا ارسال ایمیل به support@blockdays.com مشکل خود را گزارش دهید.' },
      { id: 'tech2', question: 'آیا بلاک دیز اپلیکیشن موبایل دارد؟', answer: 'در حال حاضر تمرکز ما بر روی نسخه وب پلتفرم است تا بهترین تجربه را برای تمامی کاربران فراهم کنیم. برنامه‌هایی برای توسعه اپلیکیشن موبایل در آینده وجود دارد.' },
    ],
  }
];

const FAQ: React.FC = () => {
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({}); // Tracks open state of each FAQ item by its ID

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setIsLoading(true);
        if (DEMO_MODE) {
          setFaqCategories(DEMO_FAQS);
        } else {
          // Assuming faq.json returns FAQCategory[] structure or needs mapping
          const data = await fetchContent<FAQCategory[]>('faq.json'); 
          setFaqCategories(data);
        }
      } catch (err) {
        console.error('Failed to load FAQ:', err);
        setError('خطا در بارگذاری سوالات متداول. لطفاً بعداً دوباره تلاش کنید.');
        if (DEMO_MODE) setFaqCategories(DEMO_FAQS); // Fallback for demo
      } finally {
        setIsLoading(false);
      }
    };
    loadFAQs();
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqCategories;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return faqCategories
      .map(category => ({
        ...category,
        questions: category.questions.filter(
          item =>
            item.question.toLowerCase().includes(lowerSearchTerm) ||
            item.answer.toLowerCase().includes(lowerSearchTerm)
        ),
      }))
      .filter(category => category.questions.length > 0);
  }, [faqCategories, searchTerm]);


  if (isLoading) {
    return (
      <section id="faq" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-lg text-primary"></div>
          <p className="mt-4">در حال بارگذاری سوالات متداول...</p>
        </div>
      </section>
    );
  }
  
  if (error && faqCategories.length === 0 && !DEMO_MODE) {
     return (
      <section id="faq" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
           <p className="text-error text-lg">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-16 md:py-24 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 text-primary">
          <HelpCircle className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          سوالات متداول
        </h2>

        {/* Search Bar */}
        <div className="mb-10 md:mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="سوال خود را جستجو کنید..."
              className="input input-bordered input-primary w-full pr-10 shadow-sm text-base-content placeholder-base-content/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
          </div>
        </div>
        
        {filteredFaqCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredFaqCategories.map(category => (
              <div key={category.id}>
                <h3 className="text-xl md:text-2xl font-semibold mb-4 text-secondary border-r-4 border-primary pr-3">
                  {category.name}
                </h3>
                <div className="space-y-3">
                  {category.questions.map(item => (
                    <div 
                      key={item.id} 
                      className="collapse collapse-arrow bg-base-200 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <input 
                        type="checkbox" 
                        checked={openItems[item.id] || false} 
                        onChange={() => toggleItem(item.id)}
                        className="min-h-[auto] peer" // Allow dynamic height
                      /> 
                      <div className="collapse-title text-base md:text-lg font-medium text-base-content peer-checked:text-primary flex items-center justify-between cursor-pointer py-3 sm:py-4">
                        {item.question}
                        {/* Chevron managed by collapse-arrow, or add custom one if needed */}
                      </div>
                      <div className="collapse-content text-base-content/80 bg-base-100/30 !pb-0"> {/* !pb-0 to remove extra padding if needed */}
                         <p className="pt-2 pb-4 text-sm md:text-base leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-10">
            <Search size={48} className="mx-auto text-base-content/30 mb-4" />
            <p className="text-xl text-base-content/70">
              {searchTerm ? "هیچ سوالی با عبارت جستجوی شما یافت نشد." : "سوالی برای نمایش وجود ندارد."}
            </p>
            {searchTerm && (
                 <button className="btn btn-link mt-2" onClick={() => setSearchTerm('')}>پاک کردن جستجو</button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;