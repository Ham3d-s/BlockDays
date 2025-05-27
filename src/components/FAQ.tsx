import React, { useState, useEffect, useMemo } from 'react';
import { fetchContent } from '../utils/api';
import { Search } from 'lucide-react'; // Removed HelpCircle, ChevronDown, ChevronUp

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  // No 'active' or 'tags' needed here as per current FAQItem usage in this file.
}

interface FAQPageData {
  title: string;
  items: FAQItem[];
}


const DEMO_MODE = false; // Enable to use hardcoded demo FAQs

// DEMO_FAQS will be transformed into a flat FAQItem[] if used as fallback
const DEMO_FAQ_DATA: FAQPageData = {
  title: "سوالات متداول (پیش‌فرض)",
  items: [
    { id: 'gen1', question: 'بلاک دیز چیست؟', answer: 'بلاک دیز یک پلتفرم جامع برای کشف، سازماندهی و شرکت در رویدادهای مرتبط با بلاکچین در ایران و منطقه فارسی‌زبان است. هدف ما ایجاد جامعه‌ای پویا و آگاه از آخرین تحولات این حوزه است.' },
    { id: 'gen2', question: 'چگونه می‌توانم در بلاک دیز ثبت نام کنم؟', answer: 'برای ثبت نام کافیست به صفحه عضویت مراجعه کرده و فرم مربوطه را تکمیل نمایید. پس از آن می‌توانید از تمامی امکانات پلتفرم بهره‌مند شوید.' },
    { id: 'gen3', question: 'آیا استفاده از خدمات بلاک دیز هزینه‌ای دارد؟', answer: 'ثبت نام و استفاده از بسیاری از خدمات بلاک دیز رایگان است. برخی رویدادها یا خدمات ویژه ممکن است شامل هزینه باشند که به طور شفاف اطلاع‌رسانی خواهد شد.' },
    { id: 'evt1', question: 'چگونه می‌توانم یک رویداد جدید ثبت کنم؟', answer: 'پس از ورود به حساب کاربری خود، به بخش "ثبت رویداد جدید" مراجعه کرده و اطلاعات کامل رویداد خود را وارد نمایید. تیم ما پس از بررسی، رویداد شما را منتشر خواهد کرد.' },
    { id: 'evt2', question: 'چگونه می‌توانم برای شرکت در یک رویداد ثبت نام کنم؟', answer: 'در صفحه هر رویداد، دکمه "ثبت نام" یا لینک مربوط به آن قرار داده شده است. با کلیک بر روی آن و طی کردن مراحل، ثبت نام شما نهایی می‌شود.' },
  ]
};

// Helper to flatten demo data if used as fallback - No longer needed as structure is already flat.
// const getDemoFaqItems = (): FAQItem[] => {
//   return DEMO_CATEGORIZED_FAQS.reduce((acc, category) => acc.concat(category.questions), [] as FAQItem[]);
// };


const FAQ: React.FC = () => {
  const [faqPageData, setFaqPageData] = useState<FAQPageData>(DEMO_MODE ? DEMO_FAQ_DATA : { title: "سوالات متداول", items: [] });
  const [isLoading, setIsLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;

    const loadFAQs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<FAQPageData>('faq.json');
        setFaqPageData({
          title: data?.title || "سوالات متداول",
          items: data?.items || []
        });
      } catch (err) {
        console.error('Failed to load FAQ:', err);
        setError('خطا در بارگذاری سوالات متداول. لطفاً بعداً دوباره تلاش کنید.');
        setFaqPageData({ title: "سوالات متداول (خطا)", items: getDemoFaqItems() }); // Fallback to demo items on error
      } finally {
        setIsLoading(false);
      }
    };
    loadFAQs();
  }, []);
  
  // Helper to get demo items if needed for fallback (especially if initial fetch fails)
  // This can be used if you want to ensure some content is always available even if fetch fails.
  const getDemoFaqItems = (): FAQItem[] => {
    return DEMO_FAQ_DATA.items;
  };


  const toggleItem = (id: string) => {
    setOpenItemId(prevOpenId => (prevOpenId === id ? null : id));
  };

  const filteredFaqItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqPageData.items;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return faqPageData.items.filter(
      item =>
        item.question.toLowerCase().includes(lowerSearchTerm) ||
        item.answer.toLowerCase().includes(lowerSearchTerm)
    );
  }, [faqPageData.items, searchTerm]);


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
  
  if (error && faqPageData.items.length === 0 && !DEMO_MODE) {
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
          {faqPageData.title}
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
        
        {filteredFaqItems.length > 0 ? (
          <div className="space-y-3 max-w-3xl mx-auto">
            {filteredFaqItems.map(item => (
              <div 
                key={item.id} 
                className="collapse collapse-arrow bg-base-200 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <input 
                  type="checkbox" 
                  checked={openItemId === item.id}
                  onChange={() => toggleItem(item.id)}
                  className="min-h-[auto] peer"
                /> 
                <div className="collapse-title text-base md:text-lg font-medium text-base-content peer-checked:text-primary flex items-center justify-between cursor-pointer py-3 sm:py-4">
                  {item.question}
                </div>
                <div className="collapse-content text-base-content/80 bg-base-100/30 
                      overflow-hidden 
                      transition-all duration-500 ease-in-out 
                      max-h-0 opacity-0 
                      peer-checked:max-h-[1000px] 
                      peer-checked:opacity-100 
                      peer-checked:py-4">
                   <p className="text-sm md:text-base leading-relaxed">{item.answer}</p>
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
