'use client';

import { useState } from 'react';
import { Image as ImageIcon, FileText, Upload, ImagePlus, X, ZoomIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function IndividualImagesTab({ project }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Mock data - Replace with actual API call
  // Individual images are not part of projects, they're standalone image operations
  const individualImages = [
    {
      id: 'img-1',
      uploaded_image_url: 'https://example.com/individual/upload-1.jpg',
      reference_image_url: 'https://example.com/individual/ref-1.jpg',
      user_prompt: 'Remove background and make it look professional',
      final_prompt: 'Remove the background from this ornament. Change the background of this ornament. Remove the background from the product image and replace it with a clean, elegant white studio background. Do NOT modify, alter, or redesign the ornament in any way.',
      image_type: 'background_removal',
      generated_image_url: 'https://example.com/individual/generated-1.jpg',
      created_at: '2024-03-20T10:30:00Z',
    },
    {
      id: 'img-2',
      uploaded_image_url: 'https://example.com/individual/upload-2.jpg',
      reference_image_url: null,
      user_prompt: 'Enhance colors and add professional lighting',
      final_prompt: 'Enhance the colors of this product image with professional studio lighting, balanced highlights, and natural shadows. Maintain product integrity.',
      image_type: 'enhancement',
      generated_image_url: 'https://example.com/individual/generated-2.jpg',
      created_at: '2024-03-19T14:20:00Z',
    },
    {
      id: 'img-3',
      uploaded_image_url: 'https://example.com/individual/upload-3.jpg',
      reference_image_url: 'https://example.com/individual/ref-3.jpg',
      user_prompt: null,
      final_prompt: 'Replace the background using the uploaded background image. Change the background of this ornament. The ornament must remain EXACTLY identical to the uploaded ornament image.',
      image_type: 'background_replace',
      generated_image_url: 'https://example.com/individual/generated-3.jpg',
      created_at: '2024-03-18T09:15:00Z',
    },
  ];

  const getImageTypeBadge = (type) => {
    const badges = {
      background_removal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      background_replace: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      enhancement: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      color_change: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getImageTypeLabel = (type) => {
    const labels = {
      background_removal: 'Background Removal',
      background_replace: 'Background Replace',
      enhancement: 'Image Enhancement',
      color_change: 'Color Change',
    };
    return labels[type] || type;
  };

  if (individualImages.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No individual images found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          This organization has no individual image operations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {individualImages.map((image) => (
        <Card key={image.id} className="p-6 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={getImageTypeBadge(image.image_type)}>
                {getImageTypeLabel(image.image_type)}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(image.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Uploaded Image */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Upload size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Image</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <img
                  src={image.uploaded_image_url || '/placeholder.jpg'}
                  alt="Uploaded"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setZoomedImage(image.uploaded_image_url)}
                />
                <button
                  onClick={() => setZoomedImage(image.uploaded_image_url)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <ZoomIn size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Reference Image (if any) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImagePlus size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reference Image</span>
              </div>
              {image.reference_image_url ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={image.reference_image_url}
                    alt="Reference"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setZoomedImage(image.reference_image_url)}
                  />
                  <button
                    onClick={() => setZoomedImage(image.reference_image_url)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ZoomIn size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No reference</span>
                </div>
              )}
            </div>

            {/* Generated Image */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Image</span>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-700 bg-gray-50 dark:bg-gray-900">
                <img
                  src={image.generated_image_url || '/placeholder.jpg'}
                  alt="Generated"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedImage(image);
                    setZoomedImage(image.generated_image_url);
                  }}
                />
                <button
                  onClick={() => {
                    setSelectedImage(image);
                    setZoomedImage(image.generated_image_url);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <ZoomIn size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Prompts Section */}
          <div className="mt-6 space-y-4">
            {image.user_prompt && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">User Prompt</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{image.user_prompt}</p>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-900 dark:text-green-300">Final Prompt Used</span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">{image.final_prompt}</p>
            </div>
          </div>
        </Card>
      ))}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Details</h3>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setZoomedImage(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <img
                  src={selectedImage.generated_image_url}
                  alt="Generated image"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedImage.uploaded_image_url && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Uploaded Image</h4>
                    <img
                      src={selectedImage.uploaded_image_url}
                      alt="Uploaded"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800"
                    />
                  </div>
                )}
                {selectedImage.reference_image_url && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Reference Image</h4>
                    <img
                      src={selectedImage.reference_image_url}
                      alt="Reference"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-800"
                    />
                  </div>
                )}
              </div>

              {selectedImage.user_prompt && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">User Prompt</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                    {selectedImage.user_prompt}
                  </p>
                </div>
              )}

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Final Prompt Used</h4>
                <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {selectedImage.final_prompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && !selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}

