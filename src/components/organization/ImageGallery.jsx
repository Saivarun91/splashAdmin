'use client';

import { Image as ImageIcon, Download, Eye, FileImage, X } from 'lucide-react';
import { useState } from 'react';

export function ImageGallery({ images, title = 'Images' }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <ImageIcon className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-500 dark:text-gray-400">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedImage(image)}
            >
              {image.url || image.cloud_url || image.local_url ? (
                <img
                  src={image.url || image.cloud_url || image.local_url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileImage className="text-gray-400" size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Eye className="text-white" size={24} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="relative">
              <img
                src={selectedImage.url || selectedImage.cloud_url || selectedImage.local_url}
                alt="Selected"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X size={20} />
              </button>
            </div>
            {selectedImage.prompt && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Prompt Used:</p>
                <p className="text-gray-900 dark:text-white">{selectedImage.prompt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

