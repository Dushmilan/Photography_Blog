import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiImage, FiHardDrive, FiLogOut, FiUpload, FiEye, FiSettings, FiX, FiCheck } from 'react-icons/fi';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalPhotos: 0,
    storageUsed: '0 MB'
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  

  useEffect(() => {
    // Get user info and images
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('/auth/me');
        setUser(userResponse.data);
        
        const imagesResponse = await axios.get('/images/my-images'); // Fetch user's images only
        setImages(imagesResponse.data);
        
        // Calculate dashboard stats
        calculateDashboardStats(imagesResponse.data);
      } catch (error) {
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

  // Upload functionality
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Filter out non-image files and validate size
    const imageFiles = selectedFiles.filter(file => {
      return file.type.startsWith('image/') && file.size <= 25 * 1024 * 1024; // Max 25MB
    });
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      if (response.status === 201) {
        setUploadSuccess(true);
        setFiles([]);
        // Refresh dashboard stats
        calculateDashboardStats(response.data.images);
        setImages(response.data.images);
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
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

          {/* Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#708090]/30 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <FiUpload className="text-[#001F3F] text-xl" />
              <h3 className="text-xl font-medium text-[#001F3F]">Upload Photos</h3>
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 border border-red-200 flex items-center animate-pulse">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {error}
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 flex items-center border border-green-200">
                <FiCheck className="mr-2" /> Upload successful!
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[#001F3F] text-sm font-medium mb-2">
                Select Images to Upload
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#708090]/50 rounded-2xl cursor-pointer bg-cream-100 hover:bg-cream-200 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-10 h-10 mb-3 text-[#708090]" />
                    <p className="text-[#001F3F]/70 mb-2 text-sm">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-[#001F3F]/60">Max 25MB each</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    multiple 
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {/* Selected Files Preview */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-[#001F3F]">
                    Selected Images ({files.length})
                  </h4>
                  <button
                    onClick={clearAll}
                    className="text-[#A8E6CF] hover:text-[#7fc9ae] text-sm"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {files.map((file, index) => (
                    <div key={index} className="relative group bg-white/50 rounded-xl overflow-hidden shadow-sm">
                      <div className="aspect-square bg-[#FFF5E1] rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removeFile(index)}
                          className="bg-white text-[#001F3F] rounded-full p-2 shadow-lg hover:bg-[#FF6F61] hover:text-white transition-colors"
                          aria-label="Remove image"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs truncate">
                        <p className="truncate">{file.name}</p>
                        <p className="text-[#A8E6CF] text-xs">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 ${
                      uploading
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#FF6F61] via-[#FF9933] to-[#A8E6CF] hover:from-[#e56259] hover:via-[#ff8a14] hover:to-[#7fc9ae] shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading {files.length} image{files.length !== 1 ? 's' : ''}... {uploadProgress}%
                      </div>
                    ) : (
                      `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`
                    )}
                  </button>
                </div>
              </div>
            )}
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
                        src={`http://localhost:5000${image.path}`}
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
                        src={`http://localhost:5000${image.path}`}
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
                          src={`http://localhost:5000${image.path}`}
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
                  <h4 className="text-lg font-medium text-[#001F3F] mb-2">No Photos Uploaded</h4>
                  <p className="text-[#001F3F]/70">Upload some images to get started</p>
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