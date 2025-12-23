import React, { useState, useEffect } from 'react';
import { FiImage, FiX, FiCheck, FiUser, FiLogOut, FiActivity, FiEye, FiEyeOff, FiPlay, FiBriefcase, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';
import { ENDPOINTS } from '../config/apiConfig';

const AdminGalleryPage = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user info and images
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        // For admin view, fetch all images from the database
        const storedImagesResponse = await api.get('/images/admin-gallery');
        const storedImages = storedImagesResponse.data;

        setImages(storedImages);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    // Clear both access and refresh tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  // Function to handle toggling slideshow status
  const toggleSlideshowStatus = async (imageId, isSlideshow) => {
    try {
      const response = await api.put(`/images/${imageId}/slideshow`, { isSlideshow });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_slideshow: isSlideshow } : img
        )
      );
    } catch (error) {
      console.error('Error updating slideshow status:', error);
      // Optionally show an error message to the user
    }
  };

  // Update togglePublicStatus to use correct API endpoint
  const togglePublicStatus = async (imageId, isPublic) => {
    try {
      const response = await api.put(`/images/${imageId}/public`, { isPublic });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_public: isPublic } : img
        )
      );
    } catch (error) {
      console.error('Error updating public status:', error);
      // Optionally show an error message to the user
    }
  };

  // Handle deleting an image
  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/images/${imageId}`);

      // Remove the image from local state
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  // Helper function to format bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Loading Ambient Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6F61]/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A8E6CF]/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 border-2 border-white/10 border-t-[#FF6F61] rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-light text-white tracking-widest uppercase">Admin Portal</h2>
          <p className="text-white/50 mt-2 text-sm">Securely loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-[#FF6F61] selection:text-white">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#001F3F]/30 to-transparent pointer-events-none" />
      <div className="fixed top-20 right-20 w-[500px] h-[500px] bg-[#FF6F61]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6F61] to-[#A8E6CF] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6F61]/20">
              <FiBriefcase className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white tracking-wide">Admin Dashboard</h1>
              <p className="text-xs text-white/50">Asset Management Console</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#A8E6CF] animate-pulse"></div>
              <span className="text-sm text-white/80">
                Logged in as <span className="text-white font-medium">{user?.username}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/60 hover:text-[#FF6F61] transition-colors text-sm font-medium tracking-wide group"
            >
              <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Stats / Controls Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-fade-in">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-2">Gallery Assets</h2>
              <p className="text-white/60 font-light flex items-center gap-2">
                <FiActivity className="text-[#A8E6CF]" />
                Managing {images.length} total items
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {images.length > 0 ? (
              images.map((image) => (
                <div key={image.id} className="group relative bg-[#0a0a0a] rounded-2xl border border-white/10 hover:border-[#A8E6CF]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#A8E6CF]/5 hover:-translate-y-1 overflow-hidden">

                  {/* Image Container */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-white/5">
                    <img
                      src={image.path || image.baseUrl}
                      alt={image.original_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {image.is_public && (
                        <span className="px-2 py-1 rounded-md bg-[#A8E6CF]/20 border border-[#A8E6CF]/30 backdrop-blur-md text-[10px] font-bold text-[#A8E6CF] uppercase tracking-wider flex items-center gap-1">
                          <FiEye className="w-3 h-3" /> Public
                        </span>
                      )}
                      {image.is_slideshow && (
                        <span className="px-2 py-1 rounded-md bg-[#FF6F61]/20 border border-[#FF6F61]/30 backdrop-blur-md text-[10px] font-bold text-[#FF6F61] uppercase tracking-wider flex items-center gap-1">
                          <FiPlay className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h5 className="text-white font-medium truncate mb-1 text-sm" title={image.original_name}>
                      {image.original_name}
                    </h5>
                    <div className="flex items-center gap-3 text-[10px] text-white/50 uppercase tracking-wider mb-4 font-medium">
                      <span>{image.width}×{image.height}</span>
                      <span>•</span>
                      <span>{formatBytes(image.size)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      <button
                        onClick={() => togglePublicStatus(image.id, !image.is_public)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${image.is_public
                          ? 'bg-white text-black hover:bg-[#A8E6CF]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                      >
                        {image.is_public ? <FiEyeOff /> : <FiEye />}
                        {image.is_public ? 'Hide' : 'Publish'}
                      </button>

                      <button
                        onClick={() => toggleSlideshowStatus(image.id, !image.is_slideshow)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${image.is_slideshow
                          ? 'bg-[#FF6F61] text-white hover:bg-[#ff857a]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                      >
                        {image.is_slideshow ? <FiCheck /> : <FiPlay />}
                        Slideshow
                      </button>

                      <button
                        onClick={() => handleDelete(image.id)}
                        className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white mt-1"
                      >
                        <FiTrash2 />
                        Delete Asset
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <FiImage className="text-4xl text-white/20" />
                </div>
                <h3 className="text-xl font-light text-white mb-2">Gallery Empty</h3>
                <p className="text-white/40 max-w-sm">
                  Your portfolio is currently empty. Upload images to get started managing your collection.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminGalleryPage;