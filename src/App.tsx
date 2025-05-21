import { useEffect, lazy, Suspense } from 'react';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy loaded page components
const Header = lazy(() => import('./components/Header'));
const Hero = lazy(() => import('./components/Hero'));
const UpcomingEvent = lazy(() => import('./components/UpcomingEvent'));
const Stats = lazy(() => import('./components/Stats'));
const PastEvents = lazy(() => import('./components/PastEvents'));
// const VideoGallery = lazy(() => import('./components/VideoGallery')); // Temporarily disabled
const ImageGallery = lazy(() => import('./components/ImageGallery'));
const Sponsors = lazy(() => import('./components/Sponsors'));
const FAQ = lazy(() => import('./components/FAQ'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const Footer = lazy(() => import('./components/Footer'));

// Non-lazy loaded UI components (small size)
import Toast from './components/ui/Toast';
const AdminCMS = lazy(() => import('./components/AdminCMS'));

// Error boundary component
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  // Initialize intersection observer for scroll animations
  const { observeElements, cleanupObservers } = useIntersectionObserver();

  useEffect(() => {
    // Initialize scroll animations
    observeElements('.scroll-animate');
    return () => {
      cleanupObservers();
    };
  }, [observeElements, cleanupObservers]);

  // Simple router: if URL contains /admin, show AdminCMS
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/admin');

  if (isAdmin) {
    return <AdminCMS />;
  }

  return (
    <ThemeProvider>
      <div className="font-vazirmatn" dir="rtl">
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center text-error">
            خطای بحرانی! لطفاً صفحه را مجدداً بارگذاری کنید
          </div>
        }>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>}>
            <Header />
            <main>
              <Hero />
              <UpcomingEvent />
              <Stats />
              <PastEvents />
              {/* VideoGallery component temporarily disabled */}
              <ImageGallery />
              <Sponsors />
              <FAQ />
              <ContactForm />
            </main>
            <Footer />
            <Toast />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;
