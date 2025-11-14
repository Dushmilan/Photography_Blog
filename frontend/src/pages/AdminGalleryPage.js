import React, { useState, useEffect } from 'react';
import { FiImage, FiX, FiCheck, FiUser, FiLogOut } from 'react-icons/fi';
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

  // Functions to handle toggling slideshow and featured status
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

  const toggleFeaturedStatus = async (imageId, isFeatured) => {
    try {
      const response = await api.put(`/images/${imageId}/featured`, { isFeatured });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_featured: isFeatured } : img
        )
      );
    } catch (error) {
      console.error('Error updating featured status:', error);
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#001F3F] text-xl font-light">Loading gallery...</div>
          <p className="text-[#001F3F]/70">Preparing your admin experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-gallery-page">
      <div className="gallery-header">
        <h1 className="text-3xl">Admin Gallery</h1>
        <p className="text-[#001F3F]/80">Manage all your photography assets</p>
        <div className="flex items-center gap-6 mt-4 flex-wrap justify-center">
          <div className="flex items-center gap-2 text-[#001F3F]">
            <FiUser className="text-[#A8E6CF]" />
            <span>Logged in as: <span className="font-medium">{user?.username}</span></span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#FF6F61] hover:text-[#e56259] transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Admin Gallery - All Images with Rename and Delete Options */}
      <div className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FiImage className="text-[#001F3F] text-xl" />
              <h3 className="text-xl font-medium text-[#001F3F]">Admin Gallery</h3>
            </div>

            <div>
              <h4 className="text-lg font-medium text-[#001F3F] mb-4">All Photos</h4>
              <p className="text-[#001F3F]/70 text-sm mb-4">Manage all your photos - set public, featured, or slideshow status</p>

              {images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {images.map((image) => (
                    <div key={image.id} className="bg-white rounded-xl border border-[#708090]/30 shadow-sm overflow-hidden transition-transform hover:shadow-md">
                      <div className="aspect-square bg-[#FFF5E1] overflow-hidden">
                        <img
                          src={image.path || image.baseUrl}
                          alt={image.original_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-[#001F3F] truncate" title={image.original_name}>
                            {image.original_name}
                          </h5>
                        </div>

                        <div className="text-xs text-[#001F3F]/70 mt-2">
                          <p>{image.width}×{image.height}</p>
                          <p>{formatBytes(image.size)}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => togglePublicStatus(image.id, !image.is_public)}
                              className={`px-2 py-1 rounded text-xs ${
                                image.is_public
                                  ? 'bg-[#A8E6CF]/30 text-[#001F3F]'
                                  : 'bg-[#708090]/20 text-[#001F3F]'
                              }`}
                            >
                              {image.is_public ? 'Public ✓' : 'Private'}
                            </button>
                            <button
                              onClick={() => toggleFeaturedStatus(image.id, !image.is_featured)}
                              className={`px-2 py-1 rounded text-xs ${
                                image.is_featured
                                  ? 'bg-[#FFD700]/30 text-[#001F3F]'
                                  : 'bg-[#708090]/20 text-[#001F3F]'
                              }`}
                            >
                              {image.is_featured ? 'Featured ✓' : 'Featured'}
                            </button>
                            <button
                              onClick={() => toggleSlideshowStatus(image.id, !image.is_slideshow)}
                              className={`px-2 py-1 rounded text-xs ${
                                image.is_slideshow
                                  ? 'bg-[#FF6F61]/20 text-[#FF6F61]'
                                  : 'bg-[#708090]/20 text-[#001F3F]'
                              }`}
                            >
                              {image.is_slideshow ? 'Slideshow ✓' : 'Slideshow'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📷</div>
                  <h4 className="text-lg font-medium text-[#001F3F] mb-2">No Photos Available</h4>
                  <p className="text-[#001F3F]/70">No images in the system</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGalleryPage;