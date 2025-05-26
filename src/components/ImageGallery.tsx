import React, { useState, useEffect } from 'react';
import { fetchContent } from '../utils/api';
import { Image as ImageIconLucide, Maximize, Download } from 'lucide-react'; // Renamed ImageIcon to avoid conflict

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

const DEMO_MODE = false; // Enable to use hardcoded demo images

const DEMO_IMAGES: GalleryImage[] = [
  { 
    id: 'demo1', 
    src: 'https://images.unsplash.com/photo-1587614382346-4ec5e1ba3813?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
    thumbnailSrc: 'https://images.unsplash.com/photo-1587614382346-4ec5e1ba3813?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'همایش بلاکچین تهران', 
    description: 'نمایی از سالن اصلی همایش بلاکچین تهران با حضور پرشور شرکت‌کنندگان.',
    alt: 'سالن اصلی همایش بلاکچین تهران'
  },
  { 
    id: 'demo2', 
    src: 'https://images.unsplash.com/photo-1639755944936-55990d616cf6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
    thumbnailSrc: 'https://images.unsplash.com/photo-1639755944936-55990d616cf6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'کارگاه قراردادهای هوشمند', 
    description: 'شرکت‌کنندگان در حال یادگیری عملی توسعه قراردادهای هوشمند.',
    alt: 'کارگاه عملی قراردادهای هوشمند'
  },
  { 
    id: 'demo3', 
    src: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'شبکه‌سازی در رویداد', 
    description: 'فرصت‌های شبکه‌سازی و گفتگو بین متخصصان و علاقه‌مندان.',
    alt: 'شبکه‌سازی در رویداد بلاکچین'
  },
  { 
    id: 'demo4', 
    src: 'https://images.unsplash.com/photo-1642104790599-71a11cb74903?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1642104790599-71a11cb74903?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'ارائه کلیدی', 
    description: 'یکی از سخنرانان برجسته در حال ارائه مطلب در مورد آینده وب ۳.',
    alt: 'سخنرانی در مورد آینده وب ۳'
  },
   { 
    id: 'demo5', 
    src: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80', 
    thumbnailSrc: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'غرفه‌های نمایشگاهی', 
    description: 'بازدید از غرفه‌های شرکت‌های فعال در حوزه بلاکچین.',
    alt: 'غرفه‌های نمایشگاهی شرکت‌های بلاکچینی'
  },
  { 
    id: 'demo6', 
    src: 'https://images.unsplash.com/photo-1638913971316-a883170e3999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    thumbnailSrc: 'https://images.unsplash.com/photo-1638913971316-a883170e3999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=70',
    title: 'میت‌آپ جامعه توسعه‌دهندگان', 
    description: 'دورهمی صمیمانه توسعه‌دهندگان برای تبادل دانش و تجربه.',
    alt: 'میت‌آپ جامعه توسعه‌دهندگان بلاکچین'
  }
];


const ImageGallery: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setIsLoading(true);
        let dataToProcess: GalleryImage[];

        if (DEMO_MODE) {
          dataToProcess = DEMO_IMAGES;
        } else {
          const originalData = await fetchContent<OriginalGalleryItem[]>('gallery.json');
          const imageItems = originalData.filter(item => 
            item.type === 'image' || (!item.url?.endsWith('.mp4') && !item.type) // Basic filter for images
          );
          // Transform originalData to GalleryImage format
          dataToProcess = imageItems.map(item => ({
            id: item.id,
            src: item.url,
            thumbnailSrc: item.thumbnail || item.url, // Fallback to full url if thumbnail specific not present
            title: item.title,
            description: item.description,
            alt: item.title || item.description, // Use title or description as alt text
          }));
        }
        setGalleryImages(dataToProcess);
      } catch (err) {
        console.error('Failed to load image gallery:', err);
        setError('خطا در بارگذاری تصاویر گالری. لطفاً بعداً دوباره تلاش کنید.');
        if (DEMO_MODE) setGalleryImages(DEMO_IMAGES); // Fallback to demo data on error in demo mode
      } finally {
        setIsLoading(false);
      }
    };
    loadGalleryData();
  }, []);

  const openLightboxAtIndex = (index: number) => {
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
          <ImageIconLucide size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-xl text-base-content/70">گالری تصاویر در حال حاضر خالی است.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-16 md:py-24 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16 text-primary">
          <ImageIconLucide className="inline-block w-8 h-8 md:w-10 md:h-10 mr-3" />
          گالری تصاویر رویدادها
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {galleryImages.map((image, index) => (
            <div 
              key={image.id} 
              className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
              onClick={() => openLightboxAtIndex(index)}
            >
              <img 
                src={image.thumbnailSrc} 
                alt={image.alt || image.title || `Gallery image ${index + 1}`}
                loading="lazy" // Lazy loading for thumbnails
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; // More visible placeholder
                  (e.target as HTMLImageElement).classList.add('opacity-50');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                {image.title && <p className="text-white text-xs sm:text-sm font-semibold line-clamp-2">{image.title}</p>}
              </div>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-primary/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                  <Maximize size={16} className="text-primary-content" />
                </div>
            </div>
          ))}
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