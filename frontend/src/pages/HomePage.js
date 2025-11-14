import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiShare2 } from 'react-icons/fi';
import api from '../utils/api';

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') { // Spacebar to toggle slideshow
        e.preventDefault();
        setSlideshowActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading || images.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'black' }}>
        {/* Loading section for slideshow - only the loading indicator without header */}
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'black' }}>
      {/* Hero Slideshow - Only the slideshow without any other elements */}
      <section className="relative w-full h-[100vh] overflow-hidden">
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
              className="w-full h-full object-cover"
            />

          </div>
        ))}


        {/* Slideshow status indicator */}
        <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-20">
          {currentIndex + 1} / {images.length}
          <span className={`ml-2 w-2 h-2 rounded-full inline-block ${slideshowActive ? 'bg-[#A8E6CF] animate-pulse' : 'bg-gray-400'}`}></span>
        </div>
      </section>

    </div>
  );
};

export default HomePage;