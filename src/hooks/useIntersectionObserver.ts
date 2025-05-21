import { useCallback, useRef } from 'react';

export const useIntersectionObserver = () => {
  const observers = useRef<IntersectionObserver[]>([]);

  // Clean up any existing observers
  const cleanupObservers = useCallback(() => {
    observers.current.forEach(observer => {
      observer.disconnect();
    });
    observers.current = [];
  }, []);

  // Observe multiple elements with a selector
  const observeElements = useCallback((selector: string) => {
    // Clean up existing observers
    cleanupObservers();
    
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          
          // Add animation classes when element comes into view
          element.classList.add('animate-fade-in-up');
          
          // Unobserve after animation is applied
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px' // Trigger a bit before element is in view
    });
    
    elements.forEach(element => {
      observer.observe(element);
    });
    
    observers.current.push(observer);
    
    return () => {
      observer.disconnect();
    };
  }, [cleanupObservers]);

  // Observe a single element with a callback
  const observeElement = useCallback((
    element: HTMLElement,
    callback: (isIntersecting: boolean) => void
  ) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        callback(entry.isIntersecting);
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(element);
    observers.current.push(observer);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    observeElements,
    observeElement,
    cleanupObservers
  };
};