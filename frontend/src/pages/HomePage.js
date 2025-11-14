import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiShare2 } from 'react-icons/fi';
import api from '../utils/api';

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const imageRefs = useRef([]);

  const addToRefs = (index) => (el) => {
    if (el && imageRefs.current) {
      imageRefs.current[index] = el;
    }
  };

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

  const selectImage = (index) => {
    setCurrentIndex(index);
  };

  // Scroll to the current image when currentIndex changes
  useEffect(() => {
    if (imageRefs.current[currentIndex]) {
      imageRefs.current[currentIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentIndex]);

  if (loading || images.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'black' }}>
        <section className="slideshow-container flex-1" style={{ backgroundColor: 'black' }}>
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-white text-xl font-light">Discovering visual stories...</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: 'black' }}>
      {/* Main column of centered hero images in the remaining 90% */}
      <div
        className="absolute left-8 top-40 w-[93%] h-[80%] p-4 overflow-y-auto rounded-lg"
        style={{
          backgroundColor: 'black',
          right: '7%',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
        onScroll={(e) => {
          // Calculate which image is currently in view
          const container = e.target;
          const scrollPosition = container.scrollTop;
          // Calculate based on the container's height (80vh) instead of full viewport
          const containerHeight = container.clientHeight;
          const imageHeight = 0.6 * containerHeight; // 60% of the container height
          const spacing = 40 * 4; // 40 * 4px = 160px (mb-40 in Tailwind)
          const elementHeight = imageHeight + spacing;
          const index = Math.floor(scrollPosition / elementHeight);
          if (index >= 0 && index < images.length && index !== currentIndex) {
            setCurrentIndex(index);
          }
        }}
      >
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px; /* Reduced width of scrollbar */
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #1F2937; /* Dark background for scrollbar track */
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #4B5563; /* Scrollbar thumb color */
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #6B7280; /* Scrollbar thumb hover color */
          }
        `}</style>
        <div className="max-w-4xl mx-auto pt-8">
          {images.map((image, index) => (
            <div
              ref={addToRefs(index)}
              key={image.id}
              className="relative mx-auto mb-40" /* 40 * 4px = 160px spacing between images */
              style={{ width: '100%', height: '60vh' }}
            >
              <img
                src={image.path || image.baseUrl}
                alt={image.original_name}
                className="w-full h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail preview section starting from vertical center of the page */}
      <div className="absolute top-1/2 right-8 w-[7%] h-[80%] bg-black bg-opacity-50 p-1 overflow-y-auto rounded-lg transform -translate-y-1/2">
        <div className="flex flex-col gap-1">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`cursor-pointer rounded overflow-hidden border transition-all duration-300 ${index === currentIndex ? 'border-white scale-100 opacity-100' : 'border-gray-600 opacity-50'}`}
              onClick={() => {
                selectImage(index);
              }}
            >
              <img
                src={image.path || image.baseUrl}
                alt={image.original_name}
                className="w-full h-12 object-cover" /* Reduced height further */
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;