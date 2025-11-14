import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { FiX, FiChevronLeft, FiChevronRight, FiShare2, FiDownload, FiInfo } from 'react-icons/fi';
import { handleApiError, handleUnexpectedError } from '../utils/errorHandler';
import { getImageUrl, formatFileSize, getImageDimensions, getAspectRatio, preloadImages } from '../utils/imageUtils';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setErrorType('');

      // Fetch public images from the database
      const response = await api.get('/images/public');
      setImages(response.data || []);
    } catch (err) {
      const errorInfo = handleApiError(err, 'Failed to load public images');
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Preload images when images list changes
  useEffect(() => {
    if (images.length > 0 && !loading) {
      const imageUrls = images.slice(0, 10).map(img => getImageUrl(img, 'medium')); // Preload first 10 images
      preloadImages(imageUrls).catch(error => {
        console.warn('Error preloading images:', error);
      });
    }
  }, [images, loading]);

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setCurrentSlide(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    setIsSlideshow(false);
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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSlideshow, images.length, currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsSlideshow(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, currentSlide, images.length]);

  // Filter images based on search term
  const filteredImages = images.filter(image => {
    const matchesSearch = image.original_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate grid layout based on aspect ratios
  const getGridClass = () => {
    if (filteredImages.length === 1) return 'grid-cols-1';
    if (filteredImages.length === 2) return 'grid-cols-2';
    if (filteredImages.length >= 3) return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-cols-1';
    return 'grid-cols-1';
  };

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

          {errorType === 'network' && (
            <p className="text-[#001F3F]/60 mb-6">Please check your internet connection and try again.</p>
          )}

          <div className="space-y-3">
            <button
              className="bg-[#FF6F61] hover:bg-[#e56259] text-white px-6 py-3 rounded-full font-medium transition-colors w-full"
              onClick={fetchImages}
            >
              Try Again
            </button>
            <button
              className="text-[#708090] hover:text-[#001F3F] px-6 py-2 rounded-full font-medium transition-colors w-full"
              onClick={() => {
                setError('');
                setErrorType('');
              }}
            >
              Dismiss Error
            </button>
          </div>
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
        <div className={`uniform-grid grid ${getGridClass()} gap-4 p-4`}>
          {filteredImages.map((image, index) => {
            const imageUrl = getImageUrl(image, 'medium');
            const { width, height } = getImageDimensions(image);
            const fileSize = formatFileSize(image.size || image.mediaMetadata?.photo?.imageFileSize || 0);

            return (
              <div
                key={image.id}
                className="image-container group cursor-pointer relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
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
                  src={imageUrl}
                  alt={image.original_name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iI2Q0ZDRkNCIvPgo8cGF0aCBkPSJNMyA2TDkgMTJMMyAxOEw5IDI0TDE2IDE3TDE5IDIwTDE1IDI0TDMgMTBaIiBzdHJva2U9IiM4ZTg1NzQiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTIwIDZMMTQgMTJMOSA3IiBzdHJva2U9IiM4ZTg1NzQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                  }}
                />

                {/* Image info overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <h3 className="font-medium truncate">{image.original_name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs">{width || image.mediaMetadata?.width}×{height || image.mediaMetadata?.height}</span>
                    <span className="text-xs">{fileSize}</span>
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
            );
          })}
        </div>
      ) : (
        <div className="empty-gallery flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="text-5xl mb-4 animate-float">📷</div>
          <h2 className="text-2xl font-light mb-2 text-[#001F3F]">
            {debouncedSearchTerm ? 'No matching photos found' : 'No Photos Yet'}
          </h2>
          <p className="text-center text-[#001F3F]/80 max-w-md mx-auto">
            {debouncedSearchTerm
              ? `No photographs match your search for "${debouncedSearchTerm}"`
              : 'Check back later for new photographs'}
          </p>
          {debouncedSearchTerm && (
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
          className="lightbox-overlay fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="lightbox-content relative max-w-6xl max-h-[90vh] w-full">
            <img
              src={getImageUrl(images[currentSlide], 'large')}
              alt={images[currentSlide].original_name}
              className="lightbox-image max-h-[80vh] w-auto mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNkNGQ0ZDQiLz4KPHBhdGggZD0iTTMgNkw5IDEyTDMgMThMOSAyNEwxNiAxN0wxOSAyMEwxNSAyNEwzIDE2WiIgc3Ryb2tlPSIjOGU4NTc0IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0yMCA2TDE0IDEyTDkgNyIgc3Ryb2tlPSIjOGU4NTc0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
              }}
            />

            <button
              className="close-button absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <FiX size={24} />
            </button>

            <div className="lightbox-nav absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-4">
              <button
                className="nav-button p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="Previous image"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                className="nav-button p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next image"
              >
                <FiChevronRight size={24} />
              </button>
            </div>

            {/* Image info panel */}
            <div className="absolute bottom-4 left-0 right-0 text-center bg-black/40 text-white py-3 px-4 rounded-lg max-w-md mx-auto backdrop-blur-sm transition-all duration-300">
              <div className="text-sm font-medium truncate mb-1">{images[currentSlide].original_name}</div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span>{images[currentSlide].width || images[currentSlide].mediaMetadata?.width}×{images[currentSlide].height || images[currentSlide].mediaMetadata?.height}</span>
                <span>{formatFileSize(images[currentSlide].size || images[currentSlide].mediaMetadata?.photo?.imageFileSize || 0)}</span>
              </div>
              <div className="flex justify-center gap-3 mt-1">
                <span className="text-xs">({currentSlide + 1} of {images.length})</span>
                <button
                  className="text-xs flex items-center text-white hover:text-[#A8E6CF] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality would go here
                    alert('Share functionality would be implemented here');
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
                    link.href = getImageUrl(images[currentSlide], 'original');
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

            {/* Slideshow toggle */}
            <div className="absolute top-4 left-4 flex items-center">
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSlideshow
                    ? 'bg-[#A8E6CF] text-[#001F3F]'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSlideshow(!isSlideshow);
                }}
              >
                {isSlideshow ? 'Stop Slideshow' : 'Start Slideshow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;