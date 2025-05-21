import React, { useState, useEffect, useCallback } from 'react';
import { fetchContent } from '../utils/api';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        setIsLoading(true);
        const data = await fetchContent<GalleryItem[]>('gallery.json');
        // Filter images only (not videos)
        const imageItems = data.filter(item => 
          item.type === 'image' || (!item.url.endsWith('.mp4') && !item.type)
        );
        setImages(imageItems);
        setFilteredImages(imageItems);
      } catch (err) {
        console.error('Failed to load image gallery:', err);
        setError('خطا در بارگذاری تصاویر');
      } finally {
        setIsLoading(false);
      }
    };

    loadGallery();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? filteredImages.length - 1 : prevIndex - 1
    );
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        nextImage(); // Note: RTL so this is reversed
        break;
      case 'ArrowRight':
        prevImage(); // Note: RTL so this is reversed
        break;
      default:
        break;
    }
  }, [lightboxOpen, nextImage, prevImage, closeLightbox]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // If no images available, hide the section
  if ((images.length === 0 && !isLoading) || error) {
    return null;
  }

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-base-200 scroll-animate">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">گالری تصاویر</h2>
        
        {/* Filter Buttons */}
        <div className="flex justify-center mb-12">
          <div className="join">
            <button 
              className={`btn join-item ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('all')}
            >
              همه
            </button>
            <button 
              className={`btn join-item ${activeFilter === 'images' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('images')}
            >
              تصاویر
            </button>
          </div>
        </div>
        
        {/* Gallery Controls */}
        <div className="flex justify-between items-center mb-6">
          <button 
            id="gallery-btn-prev"
            className="btn btn-circle btn-sm"
            onClick={prevImage}
            aria-label="تصویر قبلی"
          >
            <ChevronRight size={18} />
          </button>
          
          <div id="gallery-dots" className="flex space-x-1 rtl:space-x-reverse">
            {filteredImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentImageIndex === index ? 'bg-primary' : 'bg-gray-400'
                }`}
                onClick={() => openLightbox(index)}
                aria-label={`تصویر ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            id="gallery-btn-next"
            className="btn btn-circle btn-sm"
            onClick={nextImage}
            aria-label="تصویر بعدی"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        
        {/* Image Grid (Masonry style) */}
        <div className="gallery-masonry grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <div 
              key={image.id} 
              className="relative overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={image.thumbnail || image.url} 
                alt={image.title}
                className="w-full h-auto object-cover transition-transform group-hover:scale-110"
                onError={(e) => {
                  // Fallback image
                  (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                }}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 bg-primary bg-opacity-90 rounded-full">
                  <ZoomIn size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && filteredImages.length > 0 && (
        <div 
          id="gallery-lightbox"
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-2 right-2 z-10 btn btn-circle btn-sm bg-base-100 bg-opacity-50"
              onClick={closeLightbox}
            >
              <X size={18} />
            </button>
            
            {/* Navigation buttons */}
            <button 
              className="absolute top-1/2 right-2 transform -translate-y-1/2 btn btn-circle bg-base-100 bg-opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronRight size={24} />
            </button>
            
            <button 
              className="absolute top-1/2 left-2 transform -translate-y-1/2 btn btn-circle bg-base-100 bg-opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronLeft size={24} />
            </button>
            
            {/* Image */}
            <img 
              id="lightbox-image"
              src={filteredImages[currentImageIndex].url} 
              alt={filteredImages[currentImageIndex].title}
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            
            {/* Caption */}
            <div className="text-center mt-4 text-white">
              <h3 className="text-lg font-bold">{filteredImages[currentImageIndex].title}</h3>
              <p className="text-sm opacity-80">{filteredImages[currentImageIndex].description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;