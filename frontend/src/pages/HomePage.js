import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX, FiStar, FiEye, FiShare2, FiMail, FiInstagram, FiFacebook, FiCamera, FiAward, FiHeart } from 'react-icons/fi';
import axios from 'axios';

const HomePage = () => {
  const [images, setImages] = useState([]);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slideshowActive, setSlideshowActive] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      // Fetch slideshow and featured images separately
      const [slideshowResponse, featuredResponse] = await Promise.all([
        axios.get('/images/slideshow'),
        axios.get('/images/featured')
      ]);
      
      // Use slideshow images for the slideshow
      setImages(slideshowResponse.data);
      // Use featured images for the featured section (max 6)
      setFeaturedImages(featuredResponse.data.slice(0, 6));
      
      // If no slideshow images, fetch all images as fallback
      if (slideshowResponse.data.length === 0) {
        const allImagesResponse = await axios.get('/images');
        setImages(allImagesResponse.data);
      }
      
      // If no featured images, fetch all images as fallback
      if (featuredResponse.data.length === 0) {
        const allImagesResponse = await axios.get('/images');
        setFeaturedImages(allImagesResponse.data.slice(0, 6));
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
            <p className="text-xl text-[#001F3F] max-w-2xl mx-auto opacity-90">
              Explore my portfolio of artistic photography, where each image tells a unique story
            </p>
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
          <p className="text-xl text-[#001F3F] max-w-2xl mx-auto opacity-90 mb-8">
            Explore my portfolio of artistic photography, where each image tells a unique story
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => window.location.href = '/gallery'}
              className="px-6 py-3 bg-gradient-to-r from-[#FF6F61] to-[#FF9933] text-white rounded-full font-medium hover:from-[#FF5F51] hover:to-[#E58929] transition-all shadow-lg hover:shadow-xl"
            >
              View Gallery
            </button>
            <button 
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm text-[#001F3F] border border-[#708090]/30 rounded-full font-medium hover:bg-white/100 transition-all shadow-lg hover:shadow-xl"
            >
              Contact Me
            </button>
          </div>
        </div>
      </header>

      {/* Hero Slideshow */}
      <section className="relative w-full h-[70vh] overflow-hidden">
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
              src={`http://localhost:5000${image.path}`}
              alt={image.original_name}
              className="w-full h-full object-cover"
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

      {/* Featured Gallery Section */}
      <section id="featured" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-[#001F3F] mb-4">
              Featured <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Photography</span>
            </h2>
            <p className="text-lg text-[#001F3F] max-w-2xl mx-auto opacity-80">
              A curated selection of my most compelling work
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredImages.map((image, index) => (
              <div 
                key={image.id} 
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <img
                  src={`http://localhost:5000${image.path}`}
                  alt={image.original_name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-medium text-lg">{image.original_name}</h3>
                    <p className="text-sm opacity-80">Photography Collection</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button 
              onClick={() => window.location.href = '/gallery'}
              className="px-8 py-3 bg-gradient-to-r from-[#001F3F] to-[#2C3E50] text-white rounded-full font-medium hover:from-[#1a365d] hover:to-[#1c2833] transition-all shadow-lg hover:shadow-xl"
            >
              View Full Gallery
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(to bottom, #FFF5E1 0%, #F7F9F7 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[#001F3F] mb-6">
            About <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Me</span>
          </h2>
          <p className="text-lg text-[#001F3F] mb-6 opacity-90 leading-relaxed">
            With over 10 years of experience in photography, I specialize in capturing the essence of life's precious moments. 
            My work combines technical precision with emotional storytelling, creating images that resonate with viewers on a 
            deeper level.
          </p>
          <p className="text-lg text-[#001F3F] opacity-80 leading-relaxed">
            From intimate portraits to breathtaking landscapes, I am passionate about showcasing the beauty that surrounds us 
            every day. My approach is to blend artistic vision with the latest photography techniques to deliver unforgettable 
            visual experiences.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4" style={{ backgroundColor: '#F7F9F7' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-[#001F3F] mb-4">
              Get In <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-lg text-[#001F3F] max-w-2xl mx-auto opacity-80">
              Have a project in mind? Let's create something amazing together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-medium text-[#001F3F] mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiMail className="text-[#FF6F61] mt-1 mr-3 text-xl" />
                  <div>
                    <h4 className="font-medium text-[#001F3F]">Email</h4>
                    <p className="text-[#001F3F] opacity-80">hello@photography.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiInstagram className="text-[#FF6F61] mt-1 mr-3 text-xl" />
                  <div>
                    <h4 className="font-medium text-[#001F3F]">Instagram</h4>
                    <p className="text-[#001F3F] opacity-80">@photographer</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiFacebook className="text-[#FF6F61] mt-1 mr-3 text-xl" />
                  <div>
                    <h4 className="font-medium text-[#001F3F]">Facebook</h4>
                    <p className="text-[#001F3F] opacity-80">Photographer Page</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium text-[#001F3F] mb-4">Send a Message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-[#708090]/30 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 rounded-lg border border-[#708090]/30 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <textarea
                    rows="4"
                    placeholder="Your Message"
                    className="w-full px-4 py-3 rounded-lg border border-[#708090]/30 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-white/80 backdrop-blur-sm"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#FF6F61] to-[#FF9933] text-white rounded-lg font-medium hover:from-[#FF5F51] hover:to-[#E58929] transition-all shadow-lg hover:shadow-xl"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
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
              src={`http://localhost:5000${images[currentIndex].path}`}
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