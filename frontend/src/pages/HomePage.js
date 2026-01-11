import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs for DOM manipulation
  const containerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const imageRefs = useRef([]);
  const isAutoScrolling = useRef(false);
  const rafId = useRef(null);

  // Mobile carousel refs
  const mobileCarouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Helper to collect refs
  const addToRefs = (index) => (el) => {
    if (el) imageRefs.current[index] = el;
  };

  useEffect(() => {
    document.title = 'Home | Cooked By Lens';
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      // 1. Try Slideshow endpoint
      const slideshowResponse = await api.get('/images/slideshow');
      let data = slideshowResponse.data;

      // Handle array vs object response
      if (!Array.isArray(data)) data = data?.images || [];

      // 2. Fallback to public images if slideshow is empty
      if (data.length === 0) {
        const publicResponse = await api.get('/images/public');
        let publicData = publicResponse.data;
        if (!Array.isArray(publicData)) publicData = publicData?.images || [];
        data = publicData;
      }

      setImages(data);
    } catch (err) {
      console.error('Failed to load images:', err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // --- NAVIGATION LOGIC ---

  const scrollToImage = useCallback((index) => {
    if (!imageRefs.current[index] || !containerRef.current) return;

    setCurrentIndex(index);
    isAutoScrolling.current = true;

    // Scroll the MAIN container to the specific image
    imageRefs.current[index].scrollIntoView({
      behavior: 'smooth',
      block: 'center', // This ensures the main image is vertically centered
    });

    // Release the "auto scroll" lock after animation completes
    setTimeout(() => {
      isAutoScrolling.current = false;
    }, 800);
  }, []);

  // --- SYNCHRONIZATION LOGIC (The Core Magic) ---

  useEffect(() => {
    const mainContainer = containerRef.current;
    const thumbContainer = thumbnailContainerRef.current;

    if (!mainContainer || !thumbContainer || images.length === 0) return;

    const handleScroll = () => {
      // Cancel previous frame to prevent stacking
      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        // 1. Calculate Main Scroll Progress (0.0 to 1.0)
        const mainScrollTop = mainContainer.scrollTop;
        const mainScrollHeight = mainContainer.scrollHeight - mainContainer.clientHeight;

        // Prevent division by zero
        if (mainScrollHeight <= 0) return;

        const scrollRatio = mainScrollTop / mainScrollHeight;

        // 2. Apply Ratio to Thumbnail Container
        const thumbScrollHeight = thumbContainer.scrollHeight - thumbContainer.clientHeight;
        const targetThumbScroll = scrollRatio * thumbScrollHeight;

        // 3. Move Thumbnail Container
        thumbContainer.scrollTop = targetThumbScroll;
      });
    };

    // Listen to the MAIN container's scroll event
    mainContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mainContainer.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [loading, images.length]);

  // --- INTERSECTION OBSERVER (Updates Active State on Manual Scroll) ---

  useEffect(() => {
    if (loading || images.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Only update state if we aren't currently auto-scrolling (clicked/keyboard)
        if (isAutoScrolling.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.55, // Trigger when >55% of image is visible
      }
    );

    imageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, images.length]);

  // --- KEYBOARD CONTROLS ---

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        scrollToImage(nextIndex);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        scrollToImage(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, scrollToImage]);

  // --- MOBILE AND TAB CAROUSEL LOGIC ---

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;

    // If the difference is greater than 50, consider it a swipe
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left - go to next image
        goToNextImage();
      } else {
        // Swiped right - go to previous image
        goToPreviousImage();
      }
    }
  };

  const goToNextImage = () => {
    if (images.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    if (images.length === 0) return;
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  // Auto-advance for mobile carousel
  useEffect(() => {
    if (window.innerWidth >= 1024 || images.length <= 1) return; // Only on mobile and tablets

    const interval = setInterval(() => {
      goToNextImage();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white font-light text-sm tracking-widest animate-pulse">LOADING GALLERY</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden select-none">
      {/* Mobile Horizontal Carousel */}
      <div className="lg:hidden w-full h-[100dvh] relative bg-black">
        {/* Infinite Loop Carousel */}
        <div
          ref={mobileCarouselRef}
          className="w-full h-full flex overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((image, index) => {
            // Calculate position relative to current index for infinite loop effect
            let position = index - currentIndex;

            // Handle edge cases for infinite loop
            if (position < -images.length / 2) {
              position += images.length;
            } else if (position > images.length / 2) {
              position -= images.length;
            }

            return (
              <div
                key={`mobile-${image.id}-${index}`}
                className={`flex-shrink-0 w-full h-full absolute top-0 left-0 transition-transform duration-500 ease-in-out flex items-center justify-center ${
                  Math.abs(position) <= 1 ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transform: `translateX(${position * 100}%)`,
                }}
              >
                <img
                  src={image.path || image.baseUrl}
                  alt={image.original_name}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  className="max-h-[50vh] max-w-[95vw] object-contain p-4"
                />
              </div>
            );
          })}
        </div>

        {/* Mobile Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {images.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`w-1 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white opacity-100 h-0.5 ' : 'bg-gray-500 opacity-25'
              }`}
              style={{ width: index === currentIndex ? '1rem' : '0.5rem' ,
            height: index === currentIndex ? '0.5rem' : '0.5rem' }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Version - Hidden on Mobile */}
      <div className="hidden lg:block">
        {/* MAIN SCROLL CONTAINER
          - Occupies full screen
          - Scroll Snap for nice feel
          - Hide scrollbars
        */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full overflow-y-auto outline-none"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          <style>{`
            /* Hide scrollbar for Chrome/Safari */
            div::-webkit-scrollbar { display: none; }
          `}</style>

          {/* Main Container Padding Logic:
            To center a 60vh image in a 100vh viewport, we need 20vh top and 20vh bottom space.
          */}
          <div className="max-w-6xl mx-auto px-4 py-[20vh]">
            {images.map((image, index) => (
              <div
                key={image.id}
                ref={addToRefs(index)}
                data-index={index}
                className="w-full h-[60vh] mb-[20vh] last:mb-0 flex items-center justify-center snap-center"
              >
                <img
                  src={image.path || image.baseUrl}
                  alt={image.original_name}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  className="max-h-full w-auto object-contain rounded-sm shadow-2xl transition-transform duration-700 ease-out"
                  style={{
                    // Subtle scale effect when active
                    transform: index === currentIndex ? 'scale(1)' : 'scale(0.95)',
                    opacity: index === currentIndex ? 1 : 0.5,
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* THUMBNAIL SIDEBAR
          - Fixed position on right
          - Vertically centered
          - No pointer events on container (so click-through works),
            but yes pointer events on images.
        */}
        <div
          className="absolute top-1/2 right-4 md:right-8 w-20 md:w-28 h-[60vh] -translate-y-1/2 pointer-events-none z-50 overflow-hidden"
        >
          {/* Inner Scroll Container */}
          <div
            ref={thumbnailContainerRef}
            className="w-full h-full overflow-y-auto pr-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* THUMBNAIL PADDING LOGIC (Crucial for Center Line Sync):
               Container Height = 60vh.
               Thumbnail Height = 6rem (h-24).
               To center the first thumbnail at scroll 0:
               Padding Top = (ContainerHeight / 2) - (ThumbHeight / 2).
               Padding = calc(30vh - 3rem).
            */}
            <div className="py-[calc(30vh-3rem)]">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => scrollToImage(index)}
                  className={`
                    relative w-full h-24 mb-4 rounded cursor-pointer
                    transition-all duration-300 ease-out pointer-events-auto
                    overflow-hidden border-2
                    ${index === currentIndex
                      ? 'border-white opacity-100 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'border-transparent opacity-30 hover:opacity-60 grayscale scale-95'}
                  `}
                >
                  <img
                    src={image.path || image.baseUrl}
                    alt={`Thumbnail ${index}`}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optional: Mobile Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs animate-bounce md:hidden pointer-events-none">
          SCROLL
        </div>
      </div>
    </div>
  );
};

export default HomePage;