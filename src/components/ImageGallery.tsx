import React, { useState, useEffect, useRef, useMemo, MouseEvent, TouchEvent as ReactTouchEvent } from 'react'; // Added useMemo, ReactTouchEvent
import { fetchContent } from '../utils/api';
import { Maximize, Download } from 'lucide-react';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";


// Interface for original data structure from gallery.json (if different)
interface OriginalGalleryItem {
  id: string;
  title: string;
  description: string; // Used as caption
  date?: string;
  category?: string;
  type?: 'video' | 'image';
  url: string;
  thumbnail: string;
}

// Interface for what yet-another-react-lightbox expects (a "Slide")
// and what we'll use internally
interface GalleryImage {
  id: string;
  src: string;         // main image URL
  thumbnailSrc: string; // thumbnail image URL
  title?: string;       // for lightbox title (optional)
  description?: string; // for lightbox caption
  alt?: string;
  width?: number;       // Optional: for better layout if known
  height?: number;      // Optional: for better layout if known
}

interface GalleryPageData {
  title: string;
  items: OriginalGalleryItem[]; // Original items from JSON
}

const DEMO_MODE = false; // Enable to use hardcoded demo images

const DEMO_GALLERY_DATA: GalleryPageData = {
  title: "گالری تصاویر (پیش‌فرض)",
  items: [
  { 
    id: 'demo1', 
    url: 'https://images.unsplash.com/photo-1587614382346-4ec5e1ba3813?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
    thumbnail: 'https://images.unsplash.com/photo-1587614382346-4ec5e1ba3813?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'همایش بلاکچین تهران', 
    description: 'نمایی از سالن اصلی همایش بلاکچین تهران با حضور پرشور شرکت‌کنندگان.',
    type: 'image'
  },
  { 
    id: 'demo2', 
    url: 'https://images.unsplash.com/photo-1639755944936-55990d616cf6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
    thumbnail: 'https://images.unsplash.com/photo-1639755944936-55990d616cf6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'کارگاه قراردادهای هوشمند', 
    description: 'شرکت‌کنندگان در حال یادگیری عملی توسعه قراردادهای هوشمند.',
    type: 'image'
  },
  { 
    id: 'demo3', 
    url: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'شبکه‌سازی در رویداد', 
    description: 'فرصت‌های شبکه‌سازی و گفتگو بین متخصصان و علاقه‌مندان.',
    type: 'image'
  },
  { 
    id: 'demo4', 
    url: 'https://images.unsplash.com/photo-1642104790599-71a11cb74903?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1642104790599-71a11cb74903?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'ارائه کلیدی', 
    description: 'یکی از سخنرانان برجسته در حال ارائه مطلب در مورد آینده وب ۳.',
    type: 'image'
  },
   { 
    id: 'demo5', 
    url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
    thumbnail: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'غرفه‌های نمایشگاهی', 
    description: 'بازدید از غرفه‌های شرکت‌های فعال در حوزه بلاکچین.',
    type: 'image'
  },
  { 
    id: 'demo6', 
    url: 'https://images.unsplash.com/photo-1638913971316-a883170e3999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1638913971316-a883170e3999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'میت‌آپ جامعه توسعه‌دهندگان', 
    description: 'دورهمی صمیمانه توسعه‌دهندگان برای تبادل دانش و تجربه.',
    type: 'image'
  }]
};

// Helper to transform OriginalGalleryItem[] from DEMO_GALLERY_DATA.items to GalleryImage[]
const transformToGalleryImages = (items: OriginalGalleryItem[]): GalleryImage[] => {
  return items
    .filter(item => item.type === 'image' || (!item.url?.endsWith('.mp4') && !item.type))
    .map(item => ({
      id: item.id,
      src: item.url,
      thumbnailSrc: item.thumbnail || item.url,
      title: item.title,
      description: item.description,
      alt: item.title || item.description,
  }));
};


const ImageGallery: React.FC = () => {
  const [galleryPageData, setGalleryPageData] = useState<GalleryPageData>(DEMO_MODE ? DEMO_GALLERY_DATA : { title: "گالری تصاویر رویدادها", items: [] });
  const [isLoading, setIsLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState('');
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Refs and state for drag scrolling
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const dragOccurred = useRef(false); // Ref to track if a drag actually happened


  useEffect(() => {
    if (DEMO_MODE) return;

    const loadGalleryData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<GalleryPageData>('gallery.json');
        setGalleryPageData({
          title: data?.title || "گالری تصاویر رویدادها",
          items: data?.items || []
        });
      } catch (err) {
        console.error('Failed to load image gallery:', err);
        setError('خطا در بارگذاری تصاویر گالری. لطفاً بعداً دوباره تلاش کنید.');
        setGalleryPageData({ title: "گالری تصاویر (خطا)", items: DEMO_GALLERY_DATA.items }); // Fallback to demo data
      } finally {
        setIsLoading(false);
      }
    };
    loadGalleryData();
  }, []);

  const galleryImages = useMemo(() => transformToGalleryImages(galleryPageData.items), [galleryPageData.items]);

  useEffect(() => {
    if (trackRef.current && galleryImages.length > 0 && !isLoading) {
        const trackWidth = trackRef.current.scrollWidth;
        const containerWidth = trackRef.current.offsetWidth;
        setEnableAnimation(trackWidth > containerWidth && galleryImages.length > 3);
    } else {
        setEnableAnimation(false);
    }
  }, [galleryImages, isLoading]);

  // Unified drag start logic
  const unifiedDragStart = (clientX: number) => {
    if (!trackRef.current) return;
    if (enableAnimation && trackRef.current.style.animationPlayState !== 'paused') { // Ensure animation is paused only if it was running
        trackRef.current.style.animationPlayState = 'paused';
    }
    setIsDragging(true);
    setStartX(clientX - trackRef.current.offsetLeft);
    setScrollLeftStart(trackRef.current.scrollLeft);
    dragOccurred.current = false; 
  };

  // Unified drag move logic
  const unifiedDragMove = (clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const x = clientX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    trackRef.current.scrollLeft = scrollLeftStart - walk;
    if (Math.abs(walk) > 5) { 
       dragOccurred.current = true;
    }
  };

  // Unified drag end logic
  const unifiedDragEnd = () => {
    if (!isDragging) return; 
    setIsDragging(false);
    // Animation remains paused after user interaction
  };

  // Mouse handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    unifiedDragStart(e.pageX);
  };
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return; 
    unifiedDragMove(e.pageX);
  };
  const handleMouseUp = () => { 
    unifiedDragEnd();
    if (dragOccurred.current) { // Reset only if a drag actually occurred
      setTimeout(() => { dragOccurred.current = false; }, 0);
    }
  };
  const handleMouseLeave = () => { 
       if (isDragging) { 
          unifiedDragEnd();
          if (dragOccurred.current) {
            setTimeout(() => { dragOccurred.current = false; }, 0);
          }
       }
  };

  // Touch handlers
  const handleTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) { 
      // e.preventDefault(); // Consider if this is needed based on testing scroll behavior
      unifiedDragStart(e.touches[0].clientX);
    }
  };
  const handleTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // e.preventDefault(); // Consider if this is needed
    if (e.touches.length === 1) {
      unifiedDragMove(e.touches[0].clientX);
    }
  };
  const handleTouchEnd = () => {
    unifiedDragEnd();
    if (dragOccurred.current) {
      setTimeout(() => { dragOccurred.current = false; }, 0);
    }
  };
  
  const openLightboxAtIndex = (index: number) => {
    if (dragOccurred.current) { // If a drag happened, don't open lightbox
      dragOccurred.current = false; // Reset for next interaction
      return;
    }
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // Prepare slides for yet-another-react-lightbox
  const slides = galleryImages.map(img => ({
      src: img.src,
      title: img.title,
      description: img.description,
      alt: img.alt || img.title,
      // For yet-another-react-lightbox, you can pass custom slide attributes
      // Or use render functions for more complex slides
  }));

  if (isLoading) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-lg text-primary"></div>
          <p className="mt-4">در حال بارگذاری گالری تصاویر...</p>
        </div>
      </section>
    );
  }
  
  if (error && galleryImages.length === 0 && !DEMO_MODE) {
     return (
      <section id="gallery" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
           <p className="text-error text-lg">{error}</p>
        </div>
      </section>
    );
  }

  if (galleryImages.length === 0) {
    return (
      <section id="gallery" className="py-16 md:py-24 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          {/* ImageIconLucide for empty state is fine if we keep the import, otherwise change to a generic one or text */}
          <Maximize size={48} className="mx-auto text-base-content/30 mb-4" /> 
          <p className="text-xl text-base-content/70">گالری تصاویر در حال حاضر خالی است.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 md:py-24 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          {/* ImageIconLucide removed from title */}
          {galleryPageData.title}
        </h2>
        
        <div className="gallery-container w-full overflow-hidden relative py-4">
           <div
            ref={trackRef}
            className={`gallery-track flex items-center ${enableAnimation ? 'animate-scroll-gallery-rtl' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
                userSelect: isDragging ? 'none' : 'auto',
                touchAction: 'pan-y', // Allow vertical page scroll on touch devices
                // animationPlayState will be controlled via JS on interaction
            }}
          >
            {(enableAnimation ? [...galleryImages, ...galleryImages] : galleryImages).map((image, index) => (
              <div 
                key={image.id ? `${image.id}-${index}` : index} 
                className="gallery-image-wrapper flex-shrink-0 px-2 cursor-pointer group relative" // Added group and relative for overlay elements
                onClick={() => openLightboxAtIndex(index)} 
              >
                <img
                  src={image.thumbnailSrc}
                  alt={image.alt || image.title || `Gallery image ${index + 1}`}
                  loading="lazy"
                  className="h-40 sm:h-48 md:h-56 object-contain rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" // Group hover effect
                  draggable="false"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    (e.target as HTMLImageElement).classList.add('opacity-50');
                  }}
                />
                {/* Overlay elements from original design can be re-added here if needed */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-3">
                  {image.title && <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1 sm:line-clamp-2">{image.title}</p>}
                </div>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-primary/70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                    <Maximize size={16} className="text-primary-content" />
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentImageIndex}
        slides={slides}
        plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
        captions={{
          showToggle: true,
          descriptionTextAlign: "center",
          descriptionMaxLines: 3,
        }}
        thumbnails={{
            position: "bottom",
            width: 100,
            height: 80,
            border: 1,
            borderRadius: 4,
            padding: 4,
            gap: 16,
            imageFit: "cover",
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
          doubleClickDelay: 500,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        styles={{ 
          container: { backgroundColor: "rgba(10, 10, 10, .9)" },
          captionsTitle: { fontFamily: "inherit", fontSize: "1.1rem", fontWeight: "bold" },
          captionsDescription: { fontFamily: "inherit", fontSize: "0.9rem", fontStyle: "italic"},
          thumbnailsContainer: { backgroundColor: "rgba(15, 15, 15, .8)"},
          thumbnail: { opacity: 0.7, "&:hover": { opacity: 1 } },
          thumbnailActive: { opacity: 1, borderColor: "hsl(var(--p))" }, // Primary color for active thumbnail
        }}
        // Custom toolbar button for download
        toolbar={{
          buttons: [
            <button
              key="download-button"
              type="button"
              className="yarl__button"
              title="دانلود تصویر"
              onClick={() => {
                const currentSlide = slides[currentImageIndex];
                if (currentSlide && currentSlide.src) {
                  const link = document.createElement("a");
                  link.href = currentSlide.src;
                  link.download = currentSlide.title || "gallery-image";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <Download size={20} />
            </button>,
            "close",
          ],
        }}
        on={{
            view: ({ index: currentIndex }) => setCurrentImageIndex(currentIndex),
        }}
      />
    </section>
  );
};

export default ImageGallery;