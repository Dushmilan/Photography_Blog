import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ENDPOINTS } from '../config/apiConfig';
import { FiUser, FiImage, FiHardDrive, FiLogOut, FiEye, FiSettings, FiX, FiCheck } from 'react-icons/fi';
import { handleApiError } from '../utils/errorHandler';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalPhotos: 0,
    storageUsed: '0 MB'
  });
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);


  useEffect(() => {
    document.title = 'Admin Dashboard | Cooked By Lens';
    // Get user info and images
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        // For admin view, fetch images from the database (they are now stored in our DB with ImageKit paths)
        const storedImagesResponse = await api.get('/images/my-images');
        const storedImages = storedImagesResponse.data;

        setImages(storedImages);
        calculateDashboardStats(storedImages);
      } catch (error) {
        const errorMessage = handleApiError(error, 'Failed to load data');
        setError(errorMessage);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDashboardStats = (images) => {
    // Calculate total photos
    const totalPhotos = images.length;

    // Calculate storage used (approximate)
    const totalSize = images.reduce((sum, image) => sum + (image.size || 0), 0);
    const storageUsed = formatBytes(totalSize);

    setDashboardData({
      totalPhotos,
      storageUsed
    });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleLogout = () => {
    // Clear both access and refresh tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  // Functions to handle toggling slideshow status
  const toggleSlideshowStatus = async (imageId, isSlideshow) => {
    try {
      const response = await api.put(`/imagekit/image/${imageId}`, { is_slideshow: isSlideshow });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_slideshow: isSlideshow } : img
        )
      );
    } catch (error) {
      console.error('Error updating slideshow status:', error);
    }
  };

  // Function to handle image renaming
  const handleImageRename = async (imageId, currentName) => {
    const newName = prompt('Enter new name for the image:', currentName);
    if (newName && newName.trim() !== currentName.trim()) {
      const success = await renameImage(imageId, newName.trim());
      if (!success) {
        alert('Failed to rename the image. Please try again.');
      } else {
        // Update the local state to reflect the new name
        setImages(prevImages =>
          prevImages.map(img =>
            img.id === imageId ? { ...img, original_name: newName.trim() } : img
          )
        );
      }
    }
  };

  // Rename image function
  const renameImage = async (imageId, newName) => {
    try {
      const response = await api.put(`/imagekit/image/${imageId}`, { original_name: newName });

      return true;
    } catch (error) {
      console.error('Error renaming image:', error);
      return false;
    }
  };

  // Function to handle image deletion
  const handleImageDelete = async (imageId, imageName) => {
    setConfirmDeleteId(imageId);
  };

  // Delete image function
  const deleteImage = async (imageId) => {
    try {
      // Delete from both ImageKit and database via the imagekit endpoint
      await api.delete(`/imagekit/image/${imageId}`);

      // Remove the image from the local state
      setImages(prevImages =>
        prevImages.filter(img => img.id !== imageId)
      );

      // Update dashboard stats
      const imagesResponse = await api.get('/images/my-images');
      calculateDashboardStats(imagesResponse.data);

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  // Confirm deletion
  const confirmDelete = async (imageId) => {
    const success = await deleteImage(imageId);
    if (!success) {
      alert('Failed to delete the image. Please try again.');
    }
    setConfirmDeleteId(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-light">Loading dashboard...</div>
          <p className="text-white/70">Preparing your admin experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 max-w-md">
          <div className="text-5xl mb-4 text-[#FF6F61]">⚠️</div>
          <h2 className="text-2xl font-light text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            className="bg-[#FF6F61] hover:bg-[#e56259] text-white px-6 py-3 rounded-full font-medium transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-header" style={{ backgroundColor: 'black' }}>
        <h1 className="text-3xl text-white">Admin Dashboard</h1>
        <p className="text-white/80">Manage your photography portfolio</p>
        <div className="flex items-center gap-6 mt-4 flex-wrap justify-center">
          <div className="flex items-center gap-2 text-white">
            <FiUser className="text-[#A8E6CF]" />
            <span>Logged in as: <span className="font-medium">{user?.username}</span></span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-[#A8E6CF] hover:text-[#7fc9ae] transition-colors"
          >
            <FiEye /> View Public Gallery
          </Link>
          <Link
            to="/admin/gallery"
            className="flex items-center gap-2 text-[#A8E6CF] hover:text-[#7fc9ae] transition-colors"
          >
            <FiImage /> Admin Gallery
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#FF6F61] hover:text-[#e56259] transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8" style={{ backgroundColor: 'black' }}>
        <div className="max-w-7xl mx-auto py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6F61] to-[#FF9933] flex items-center justify-center">
                  <FiImage className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Photos</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.totalPhotos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8E6CF] to-[#6B8C6B] flex items-center justify-center">
                  <FiHardDrive className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{dashboardData.storageUsed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ImageKit Upload Section */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <FiSettings className="text-white text-xl" />
              <h3 className="text-xl font-medium text-white">Image Management</h3>
            </div>

            <div className="bg-green-900/30 border border-green-800/50 rounded-xl p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-200">
                    Your portfolio now uses ImageKit for secure image storage, CDN delivery, and real-time transformations.
                    Upload and manage your photos directly from this admin panel.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Public Photos Section */}
      <div className="px-4 md:px-8" style={{ backgroundColor: 'black' }}>
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FiSettings className="text-white text-xl" />
              <h3 className="text-xl font-medium text-white">Public Photos</h3>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">Gallery Photos</h4>
              <p className="text-white/70 text-sm mb-4">Select which photos appear in the public gallery</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.filter(image => image.is_public).length > 0 ? images.filter(image => image.is_public).map((image) => (
                  <div key={image.id} className="relative group bg-gray-700/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={image.path || image.baseUrl}
                        alt={image.original_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iI2Q0ZDRkNCIvPgo8cGF0aCBkPSJNMyA2TDkgMTJMMyAxOEw5IDI0TDE2IDE3TDE5IDIwTDE1IDI0TDMgMTBaIiBzdHJva2U9IiM4ZTg1NzQiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTIwIDZMMTQgMTJMOSA3IiBzdHJva2U9IiM4ZTg1NzQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => {
                          // Call API to update public status
                          api.put(`/imagekit/image/${image.id}`, { is_public: !image.is_public })
                            .then(() => {
                              // Update local state to reflect the change
                              setImages(prevImages =>
                                prevImages.map(img =>
                                  img.id === image.id ? { ...img, is_public: !image.is_public } : img
                                )
                              );
                              // Update dashboard stats
                              const imagesResponse = api.get('/images/my-images');
                              imagesResponse.then(response => {
                                calculateDashboardStats(response.data);
                              });
                            })
                            .catch(error => {
                              console.error('Error updating public status:', error);
                              alert('Failed to update public status. Please try again.');
                            });
                        }}
                        className={`p-2 rounded-full shadow-lg transition-colors ${image.is_public
                          ? 'bg-[#FF6F61] text-white'
                          : 'bg-white text-black'
                          }`}
                        aria-label={image.is_public ? "Remove from public gallery" : "Add to public gallery"}
                      >
                        {image.is_public ? <FiX size={18} /> : <FiCheck size={18} />}
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs">
                      <p className="truncate">{image.original_name}</p>
                      {image.is_public && (
                        <p className="text-[#A8E6CF] text-xs">Public</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-white/70 col-span-full text-center py-8">No public photos yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



export default AdminPage;