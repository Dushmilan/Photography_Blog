import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiImage, FiHardDrive, FiLogOut, FiEye, FiSettings, FiX, FiCheck } from 'react-icons/fi';

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
    // Get user info and images
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('/auth/me');
        setUser(userResponse.data);

        // For admin view, fetch all photos from Google Photos
        const googlePhotosResponse = await axios.get('/google-photos/photos');
        const googlePhotos = googlePhotosResponse.data.photos || [];
        
        // Also fetch our stored image settings (public/featured/slideshow)
        const storedImagesResponse = await axios.get('/images/my-images');
        const storedImages = storedImagesResponse.data;
        
        // Merge the Google Photos with stored settings and ensure all images are in DB
        const mergedImages = await Promise.all(googlePhotos.map(async (googlePhoto) => {
          const storedImage = storedImages.find(stored => stored.id === googlePhoto.id);
          
          // If the image doesn't exist in our DB, create it
          if (!storedImage) {
            try {
              await axios.post('/images', {
                id: googlePhoto.id,
                filename: googlePhoto.filename,
                original_name: googlePhoto.original_name,
                path: googlePhoto.path,
                thumbnail_path: googlePhoto.thumbnail_path,
                small_path: googlePhoto.small_path,
                medium_path: googlePhoto.medium_path,
                size: googlePhoto.size,
                mimetype: googlePhoto.mimetype,
                width: googlePhoto.width,
                height: googlePhoto.height,
                photographer_id: googlePhoto.photographer_id,
                is_featured: googlePhoto.is_featured,
                is_slideshow: googlePhoto.is_slideshow,
                is_public: googlePhoto.is_public
              });
            } catch (err) {
              // Image might already exist, continue
              console.log('Image may already exist in DB:', err.message);
            }
            
            return {
              ...googlePhoto,
              is_featured: googlePhoto.is_featured || false,
              is_slideshow: googlePhoto.is_slideshow || false,
              is_public: googlePhoto.is_public || false,
            };
          }
          
          return {
            ...googlePhoto,
            is_featured: storedImage?.is_featured || googlePhoto.is_featured || false,
            is_slideshow: storedImage?.is_slideshow || googlePhoto.is_slideshow || false,
            is_public: storedImage?.is_public || googlePhoto.is_public || false,
          };
        }));
        
        setImages(mergedImages);
        calculateDashboardStats(mergedImages);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load data');
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
    const totalSize = images.reduce((sum, image) => sum + image.size, 0);
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
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  // Functions to handle toggling slideshow and featured status
  const toggleSlideshowStatus = async (imageId, isSlideshow) => {
    try {
      const response = await axios.put(`/images/${imageId}/slideshow`, { isSlideshow });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_slideshow: isSlideshow } : img
        )
      );

      // Update dashboard stats
      const imagesResponse = await axios.get('/images/my-images');
      calculateDashboardStats(imagesResponse.data);
    } catch (error) {
      console.error('Error updating slideshow status:', error);
      // Optionally show an error message to the user
    }
  };

  const toggleFeaturedStatus = async (imageId, isFeatured) => {
    try {
      const response = await axios.put(`/images/${imageId}/featured`, { isFeatured });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_featured: isFeatured } : img
        )
      );

      // Update dashboard stats
      const imagesResponse = await axios.get('/images/my-images');
      calculateDashboardStats(imagesResponse.data);
    } catch (error) {
      console.error('Error updating featured status:', error);
      // Optionally show an error message to the user
    }
  };

  const togglePublicStatus = async (imageId, isPublic) => {
    try {
      const response = await axios.put(`/images/${imageId}/public`, { isPublic });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, is_public: isPublic } : img
        )
      );

      // Update dashboard stats
      const imagesResponse = await axios.get('/images/my-images');
      calculateDashboardStats(imagesResponse.data);
    } catch (error) {
      console.error('Error updating public status:', error);
      // Optionally show an error message to the user
    }
  };

  const renameImage = async (imageId, newName) => {
    try {
      const response = await axios.put(`/images/${imageId}/rename`, { newName });

      // Update the image in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, original_name: response.data.image.original_name } : img
        )
      );

      // Update dashboard stats
      const imagesResponse = await axios.get('/images/my-images');
      calculateDashboardStats(imagesResponse.data);

      return true;
    } catch (error) {
      console.error('Error renaming image:', error);
      return false;
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await axios.delete(`/images/${imageId}`);

      // Remove the image from the local state
      setImages(prevImages =>
        prevImages.filter(img => img.id !== imageId)
      );

      // Update dashboard stats
      const imagesResponse = await axios.get('/images/my-images');
      calculateDashboardStats(imagesResponse.data);

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  // Function to handle image renaming
  const handleImageRename = async (imageId, currentName) => {
    const newName = prompt('Enter new name for the image:', currentName);
    if (newName && newName.trim() !== currentName.trim()) {
      const success = await renameImage(imageId, newName.trim());
      if (!success) {
        alert('Failed to rename the image. Please try again.');
      }
    }
  };

  // Function to handle image deletion
  const handleImageDelete = async (imageId, imageName) => {
    setConfirmDeleteId(imageId);
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#001F3F] text-xl font-light">Loading dashboard...</div>
          <p className="text-[#001F3F]/70">Preparing your admin experience</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-header">
        <h1 className="text-3xl">Admin Dashboard</h1>
        <p className="text-[#001F3F]/80">Manage your photography portfolio</p>
        <div className="flex items-center gap-6 mt-4 flex-wrap justify-center">
          <div className="flex items-center gap-2 text-[#001F3F]">
            <FiUser className="text-[#A8E6CF]" />
            <span>Logged in as: <span className="font-medium">{user?.username}</span></span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-[#A8E6CF] hover:text-[#7fc9ae] transition-colors"
          >
            <FiEye /> View Public Gallery
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#FF6F61] hover:text-[#e56259] transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6F61] to-[#FF9933] flex items-center justify-center">
                  <FiImage className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-[#001F3F]/70 text-sm">Total Photos</p>
                  <p className="text-2xl font-bold text-[#001F3F]">{dashboardData.totalPhotos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8E6CF] to-[#6B8C6B] flex items-center justify-center">
                  <FiHardDrive className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-[#001F3F]/70 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-[#001F3F]">{dashboardData.storageUsed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Photos Integration Notice - Instead of upload section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <FiSettings className="text-[#001F3F] text-xl" />
              <h3 className="text-xl font-medium text-[#001F3F]">Google Photos Integration</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    This portfolio now connects to your Google Photos library. 
                    Configure your Google Photos API credentials to start managing your photos.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Manage Photos Section - Slideshow and Featured Selection */}
      <div className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FiSettings className="text-[#001F3F] text-xl" />
              <h3 className="text-xl font-medium text-[#001F3F]">Manage Photos</h3>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-medium text-[#001F3F] mb-4">Slideshow Photos</h4>
              <p className="text-[#001F3F]/70 text-sm mb-4">Select which photos appear in the homepage slideshow (1 will be used)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.filter(image => image.is_slideshow).length > 0 ? images.filter(image => image.is_slideshow).map((image) => (
                  <div key={image.id} className="relative group bg-white/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-[#FFF5E1] rounded-lg overflow-hidden">
                      <img
                        src={image.path || image.baseUrl}
                        alt={image.original_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => toggleSlideshowStatus(image.id, !image.is_slideshow)}
                        className={`p-2 rounded-full shadow-lg transition-colors ${
                          image.is_slideshow
                            ? 'bg-[#FF6F61] text-white'
                            : 'bg-white text-[#001F3F]'
                        }`}
                        aria-label={image.is_slideshow ? "Remove from slideshow" : "Add to slideshow"}
                      >
                        {image.is_slideshow ? <FiX size={18} /> : <FiCheck size={18} />}
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs">
                      <p className="truncate">{image.original_name}</p>
                      {image.is_slideshow && (
                        <p className="text-[#A8E6CF] text-xs">In Slideshow</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-[#001F3F]/70 col-span-full text-center py-8">No slideshow photos yet</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-[#001F3F] mb-4">Featured Photos</h4>
              <p className="text-[#001F3F]/70 text-sm mb-4">Select which photos appear in the featured gallery (up to 6 photos)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.filter(image => image.is_featured).length > 0 ? images.filter(image => image.is_featured).map((image) => (
                  <div key={image.id} className="relative group bg-white/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-[#FFF5E1] rounded-lg overflow-hidden">
                      <img
                        src={image.path || image.baseUrl}
                        alt={image.original_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => toggleFeaturedStatus(image.id, !image.is_featured)}
                        className={`p-2 rounded-full shadow-lg transition-colors ${
                          image.is_featured
                            ? 'bg-[#FF6F61] text-white'
                            : 'bg-white text-[#001F3F]'
                        }`}
                        aria-label={image.is_featured ? "Remove from featured" : "Add to featured"}
                      >
                        {image.is_featured ? <FiX size={18} /> : <FiCheck size={18} />}
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs">
                      <p className="truncate">{image.original_name}</p>
                      {image.is_featured && (
                        <p className="text-[#A8E6CF] text-xs">Featured</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-[#001F3F]/70 col-span-full text-center py-8">No featured photos yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Photos Section */}
      <div className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FiSettings className="text-[#001F3F] text-xl" />
              <h3 className="text-xl font-medium text-[#001F3F]">Public Photos</h3>
            </div>

            <div>
              <h4 className="text-lg font-medium text-[#001F3F] mb-4">Gallery Photos</h4>
              <p className="text-[#001F3F]/70 text-sm mb-4">Select which photos appear in the public gallery</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.filter(image => image.is_public).length > 0 ? images.filter(image => image.is_public).map((image) => (
                  <div key={image.id} className="relative group bg-white/50 rounded-xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-[#FFF5E1] rounded-lg overflow-hidden">
                      <img
                        src={image.path || image.baseUrl}
                        alt={image.original_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => togglePublicStatus(image.id, !image.is_public)}
                        className={`p-2 rounded-full shadow-lg transition-colors ${
                          image.is_public
                            ? 'bg-[#FF6F61] text-white'
                            : 'bg-white text-[#001F3F]'
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
                  <p className="text-[#001F3F]/70 col-span-full text-center py-8">No public photos yet</p>
                )}
              </div>
            </div>
          </div>
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
              <p className="text-[#001F3F]/70 text-sm mb-4">Manage all your photos - rename or delete as needed</p>

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
                          <h5 className="font-medium text-[#001F3F] truncate flex-grow mr-2" title={image.original_name}>
                            {image.original_name}
                          </h5>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleImageRename(image.id, image.original_name)}
                              className="p-1.5 rounded-md bg-[#A8E6CF]/20 text-[#001F3F] hover:bg-[#A8E6CF]/40 transition-colors"
                              aria-label="Rename image"
                              title="Rename"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleImageDelete(image.id, image.original_name)}
                              className="p-1.5 rounded-md bg-[#FF6F61]/20 text-[#FF6F61] hover:bg-[#FF6F61]/40 transition-colors"
                              aria-label="Delete image"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-[#001F3F]/70 mt-2">
                          <p>{image.width}×{image.height}</p>
                          <p>{formatBytes(image.size)}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => togglePublicStatus(image.id, !image.is_public)}
                              className={`px-2 py-1 rounded text-xs ${
                                image.is_public
                                  ? 'bg-[#A8E6CF]/40 text-[#001F3F]'
                                  : 'bg-[#708090]/20 text-[#001F3F]'
                              }`}
                            >
                              {image.is_public ? 'Public' : 'Private'}
                            </button>
                            {image.is_slideshow && (
                              <span className="inline-block px-2 py-1 bg-[#FF6F61]/20 text-[#FF6F61] rounded text-xs">
                                Slideshow
                              </span>
                            )}
                            {image.is_featured && (
                              <span className="inline-block px-2 py-1 bg-[#A8E6CF]/20 text-[#001F3F] rounded text-xs">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Confirmation Dialog */}
                      {confirmDeleteId === image.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                            <h3 className="text-lg font-medium text-[#001F3F] mb-2">Confirm Delete</h3>
                            <p className="text-[#001F3F]/80 mb-6">Are you sure you want to delete "{image.original_name}"? This action cannot be undone.</p>

                            <div className="flex justify-end gap-3">
                              <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-[#001F3F] hover:bg-[#A8E6CF]/20 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => confirmDelete(image.id)}
                                className="px-4 py-2 bg-[#FF6F61] text-white hover:bg-[#e56259] rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📷</div>
                  <h4 className="text-lg font-medium text-[#001F3F] mb-2">No Photos Available</h4>
                  <p className="text-[#001F3F]/70">Connect to Google Photos to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



export default AdminPage;