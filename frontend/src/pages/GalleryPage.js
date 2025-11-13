import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiChevronLeft, FiChevronRight, FiShare2, FiDownload, FiInfo } from 'react-icons/fi';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      // First try to fetch from Google Photos
      const response = await axios.get('/google-photos/photos');
      // For now, using Google Photos API to get public images
      // In a real scenario, you might want to distinguish between public and private images
      setImages(response.data.photos || []);
      setLoading(false);
    } catch (err) {
      // If Google Photos fails, fallback to database images
      try {
        console.log('Google Photos failed, trying database images');
        const response = await axios.get('/images');
        setImages(response.data);
        setLoading(false);
      } catch (dbErr) {
        setError(dbErr.response?.data?.message || 'Failed to load images from both sources');
        setLoading(false);
      }
    }
  };

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setCurrentSlide(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (currentSlide === 0) {
      setCurrentSlide(images.length - 1);
    } else {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToNext = () => {
    if (currentSlide === images.length - 1) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // Auto-advance slideshow
  useEffect(() => {
    let interval = null;
    if (isSlideshow && images.length > 0) {
      interval = setInterval(() => {
        goToNext();
      }, 4000); // Change image every 4 seconds
    }
    return () => clearInterval(interval);
  }, [isSlideshow, images.length, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'Escape') {
        closeLightbox();
        setIsSlideshow(false);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ') { // Spacebar to toggle slideshow
        e.preventDefault();
        setIsSlideshow(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, currentSlide, images.length]);

  

  // Filter images based on search term 
  const filteredImages = images.filter(image => {
    const matchesSearch = image.original_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[#001F3F] text-xl font-light">Loading gallery...</div>
          <p className="text-[#001F3F]/70 mt-2">Preparing visual experiences</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
        <div className="text-center p-8 max-w-md">
          <div className="text-5xl mb-4 text-[#FF6F61]">⚠️</div>
          <h2 className="text-2xl font-light text-[#001F3F] mb-2">Oops! Something went wrong</h2>
          <p className="text-[#001F3F]/80 mb-6">{error}</p>
          <button 
            className="bg-[#FF6F61] hover:bg-[#e56259] text-white px-6 py-3 rounded-full font-medium transition-colors"
            onClick={fetchImages}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-header animate-slide-up">
       {/* Search and filter controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search photographs..."
              className="w-full px-4 py-3 pl-12 rounded-full border border-[#708090] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#708090]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {filteredImages.length > 0 ? (
        <div className="uniform-grid">
          {filteredImages.map((image, index) => (
            <div 
              key={image.id} 
              className="image-container group cursor-pointer relative overflow-hidden" 
              onClick={() => openLightbox(images.findIndex(img => img.id === image.id))}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openLightbox(images.findIndex(img => img.id === image.id));
                }
              }}
            >
              <img
                src={image.path || image.baseUrl}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                alt={image.original_name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Image info overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                <h3 className="font-medium truncate">{image.original_name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs">{image.width || image.mediaMetadata?.width}×{image.height || image.mediaMetadata?.height}</span>
                  <span className="text-xs">{Math.round((image.size || image.mediaMetadata?.photo?.imageFileSize || 0) / 1024)}KB</span>
                </div>
              </div>
              
              
              {/* View button */}
              <button
                className="absolute bottom-3 right-3 p-2 rounded-full bg-white/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl transform translate-y-2 group-hover:translate-y-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(images.findIndex(img => img.id === image.id));
                }}
                aria-label="View details"
              >
                <FiInfo size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-gallery">
          <div className="text-5xl mb-4 animate-float">📷</div>
          <h2 className="text-2xl font-light mb-2 text-[#001F3F]">
            {searchTerm ? 'No matching photos found' : 'No Photos Yet'}
          </h2>
          <p className="text-center text-[#001F3F]/80 max-w-md mx-auto">
            {searchTerm 
              ? `No photographs match your search for "${searchTerm}"` 
              : 'Check back later for new photographs'}
          </p>
          {searchTerm && (
            <button 
              className="mt-4 text-[#A8E6CF] hover:text-[#7fc9ae] underline"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedImageIndex !== null && images.length > 0 && (
        <div 
          className="lightbox-overlay"
          onClick={closeLightbox}
        >
          <div className="lightbox-content">
            <img
              src={images[currentSlide].path || images[currentSlide].baseUrl}
              alt={images[currentSlide].original_name}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              className="close-button"
              onClick={() => {
                closeLightbox();
                setIsSlideshow(false);
              }}
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
            
            {/* Image info panel */}
            <div className="absolute bottom-4 left-0 right-0 text-center bg-black/40 text-white py-3 px-4 rounded-lg max-w-md mx-auto backdrop-blur-sm transition-all duration-300">
              <div className="text-sm font-medium truncate mb-1">{images[currentSlide].original_name}</div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span>{images[currentSlide].width || images[currentSlide].mediaMetadata?.width}×{images[currentSlide].height || images[currentSlide].mediaMetadata?.height}</span>
                <span>{Math.round((images[currentSlide].size || images[currentSlide].mediaMetadata?.photo?.imageFileSize || 0) / 1024)}KB</span>
              </div>
              <div className="flex justify-center gap-3 mt-1">
                <span className="text-xs">({currentSlide + 1} of {images.length})</span>
                <button 
                  className="text-xs flex items-center text-white hover:text-[#A8E6CF] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality would go here
                  }}
                >
                  <FiShare2 className="mr-1" size={12} />
                  Share
                </button>
                <button 
                  className="text-xs flex items-center text-white hover:text-[#A8E6CF] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Download the image directly
                    const link = document.createElement('a');
                    link.href = images[currentSlide].path || images[currentSlide].baseUrl;
                    link.download = images[currentSlide].original_name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <FiDownload className="mr-1" size={12} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;