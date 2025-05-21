import React, { useState, useEffect } from 'react';
import { fetchContent } from '../utils/api';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<FAQItem[]>('faq.json');
        setFaqItems(data);
      } catch (err) {
        console.error('Failed to load FAQ:', err);
        setError('خطا در بارگذاری سوالات متداول');
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQ();
  }, []);

  // If no FAQ items, hide the section
  if ((faqItems.length === 0 && !isLoading) || error) {
    return null;
  }

  if (isLoading) {
    return (
      <section id="faq" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-20 bg-base-200 scroll-animate">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">سوالات متداول</h2>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <div 
              key={item.id} 
              className="collapse collapse-plus bg-base-100 mb-4 rounded-lg"
              tabIndex={0}
            >
              <input type="radio" name="faq-accordion" defaultChecked={index === 0} /> 
              <div className="collapse-title text-xl font-medium">
                {item.question}
              </div>
              <div className="collapse-content">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;