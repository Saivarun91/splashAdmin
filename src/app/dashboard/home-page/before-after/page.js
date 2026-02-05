'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

export default function BeforeAfterPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await homepageAPI.getAllBeforeAfterImages();
      if (response.success) {
        setImages(response.images || []);
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to load images' });
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load images. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type, file) => {
    if (file) {
      if (type === 'before') {
        setBeforeFile(file);
      } else {
        setAfterFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!beforeFile || !afterFile) {
      setMessage({ type: 'error', text: 'Please select both before and after images' });
      return;
    }

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });
      
      const response = await homepageAPI.uploadBeforeAfterImages(beforeFile, afterFile);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Images uploaded successfully!' });
        setBeforeFile(null);
        setAfterFile(null);
        // Reset file inputs
        document.getElementById('before-image-input').value = '';
        document.getElementById('after-image-input').value = '';
        fetchImages();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to upload images' });
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image pair?')) {
      return;
    }

    try {
      const response = await homepageAPI.deleteBeforeAfterImage(imageId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Image deleted successfully!' });
        fetchImages();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to delete image' });
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete. Please try again.' });
    }
  };

  const handleToggleActive = async (imageId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'true' ? 'false' : 'true';
      const response = await homepageAPI.updateBeforeAfterImage(imageId, { is_active: newStatus });
      if (response.success) {
        setMessage({ type: 'success', text: 'Image status updated!' });
        fetchImages();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to update image' });
      }
    } catch (error) {
      console.error('Failed to update image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update. Please try again.' });
    }
  };

  const handleReorder = async (imageId, direction) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const currentOrder = image.order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find the image that should swap positions
    const swapImage = images.find(img => img.order === newOrder);
    
    try {
      // Update both images' orders
      await homepageAPI.updateBeforeAfterImage(imageId, { order: newOrder });
      if (swapImage) {
        await homepageAPI.updateBeforeAfterImage(swapImage.id, { order: currentOrder });
      }
      fetchImages();
    } catch (error) {
      console.error('Failed to reorder image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to reorder. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Before After Images
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage before/after image pairs for the home page carousel
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload New Image Pair</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Before Image
            </label>
            <input
              id="before-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('before', e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {beforeFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {beforeFile.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              After Image
            </label>
            <input
              id="after-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('after', e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {afterFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {afterFile.name}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || !beforeFile || !afterFile}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Images
            </>
          )}
        </button>
      </div>

      {/* Images List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Image Pairs ({images.length})
        </h2>
        {images.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No images uploaded yet. Upload your first image pair above.
          </p>
        ) : (
          <div className="space-y-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`p-4 border rounded-lg ${
                  image.is_active === 'true'
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Before</p>
                      <img
                        src={image.before_image_url}
                        alt="Before"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">After</p>
                      <img
                        src={image.after_image_url}
                        alt="After"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReorder(image.id, 'up')}
                        disabled={index === 0}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => handleReorder(image.id, 'down')}
                        disabled={index === images.length - 1}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleActive(image.id, image.is_active)}
                      className={`p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        image.is_active === 'true'
                          ? 'border-green-300 dark:border-green-700 text-green-600 dark:text-green-400'
                          : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                      title={image.is_active === 'true' ? 'Hide from home page' : 'Show on home page'}
                    >
                      {image.is_active === 'true' ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Order: {image.order} | {image.is_active === 'true' ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
