import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiShare2 } from 'react-icons/fi';
import api from '../utils/api';

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slideshowActive, setSlideshowActive] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      // Fetch slideshow images
      const slideshowResponse = await api.get('/images/slideshow');

      // Use slideshow images for the slideshow
      setImages(slideshowResponse.data);

      // If no slideshow images, fetch all images as fallback
      if (slideshowResponse.data.length === 0) {
        const allImagesResponse = await api.get('/images/public');
        setImages(allImagesResponse.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load images:', err);
      setLoading(false);
    }
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length === 0 || !slideshowActive) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length, slideshowActive]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setSlideshowActive(false); // Pause slideshow when user interacts
  };


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setShowLightbox(false);
      } else if (e.key === ' ') { // Spacebar to toggle slideshow
        e.preventDefault();
        setSlideshowActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading || images.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF5E1' }}>
        {/* Header section */}
        <header className="pt-20 pb-10 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-light text-[#001F3F] mb-4 tracking-tight">
              Capturing Life's
              <span className="block bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">
                Beautiful Moments
              </span>
            </h1>
          </div>
        </header>

        {/* Loading section for slideshow */}
        <section className="slideshow-container flex-1" style={{ backgroundColor: '#FFF5E1' }}>
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#001F3F] text-xl font-light">Discovering visual stories...</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF5E1' }}>
      {/* Header section */}
      <header className="pt-20 pb-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-light text-[#001F3F] mb-4 tracking-tight">
            Capturing Life's
            <span className="block bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">
              Beautiful Moments
            </span>
          </h1>
        </div>
      </header>

      {/* Hero Slideshow */}
      <section className="relative w-[90%] h-[70vh] mx-auto overflow-hidden rounded-3xl shadow-lg">
        {/* Slideshow slides */}
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute top-0 left-0 w-full h-full ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{
              transition: 'opacity 1.2s ease-in-out',
            }}
          >
            <img
              src={image.path || image.baseUrl}
              alt={image.original_name}
              className="w-full h-full object-cover rounded-3xl"
              onClick={() => setShowLightbox(true)}
            />

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl md:text-2xl font-light mb-1">{image.original_name}</h3>

              </div>
            </div>
          </div>
        ))}

        {/* Slideshow controls */}
        <div className="absolute inset-y-0 flex items-center justify-between w-full px-4">
          <button
            className="slideshow-control-btn group"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <FiChevronLeft className="group-hover:scale-125 transition-transform" />
          </button>
          <button
            className="slideshow-control-btn group"
            onClick={goToNext}
            aria-label="Next image"
          >
            <FiChevronRight className="group-hover:scale-125 transition-transform" />
          </button>
        </div>

        {/* Slideshow navigation dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-gradient-to-r from-[#A8E6CF] to-[#6B8C6B] scale-125 shadow-[0_0_8px_rgba(168,230,207,0.5)]' : 'bg-white/50'}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>

        {/* Slideshow status indicator */}
        <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-20">
          {currentIndex + 1} / {images.length}
          <span className={`ml-2 w-2 h-2 rounded-full inline-block ${slideshowActive ? 'bg-[#A8E6CF] animate-pulse' : 'bg-gray-400'}`}></span>
        </div>
      </section>

      {/* Lightbox for slideshow image */}
      {showLightbox && images.length > 0 && (
        <div
          className="lightbox-overlay"
          onClick={() => setShowLightbox(false)}
        >
          <div className="lightbox-content">
            <img
              src={images[currentIndex].path || images[currentIndex].baseUrl}
              alt={images[currentIndex].original_name}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="close-button"
              onClick={() => setShowLightbox(false)}
              aria-label="Close lightbox"
            >
              <FiX />
            </button>

            <div className="lightbox-nav">
              <button
                className="nav-button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="Previous image"
              >
                <FiChevronLeft />
              </button>
              <button
                className="nav-button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next image"
              >
                <FiChevronRight />
              </button>
            </div>

            <div className="absolute top-4 left-0 right-0 text-center text-sm text-white bg-black/40 py-2 px-4 rounded-full max-w-xs mx-auto">
              {currentIndex + 1} of {images.length}
              <button
                className="ml-3 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality would go here
                }}
              >
                <FiShare2 className="inline mr-1" size={14} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;