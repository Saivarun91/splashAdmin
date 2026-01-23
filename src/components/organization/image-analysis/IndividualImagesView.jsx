'use client';

import { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageDetailView } from './ImageDetailView';

export function IndividualImagesView() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedType, setSelectedType] = useState('all');

  // Mock individual images - Replace with actual API call
  const individualImages = [
    {
      id: 'img-1',
      type: 'plain_background',
      imageUrl: 'https://example.com/individual/plain-bg-1.jpg',
      uploadedImageUrl: 'https://example.com/individual/upload-1.jpg',
      referenceImageUrl: null,
      userPrompt: 'Remove background and make it look professional',
      finalPrompt: 'Remove the background from this ornament. Change the background of this ornament. Remove the background from the product image and replace it with a clean, elegant white studio background.',
      created_at: '2024-03-20T10:30:00Z',
    },
    {
      id: 'img-2',
      type: 'themed_image',
      imageUrl: 'https://example.com/individual/themed-1.jpg',
      uploadedImageUrl: 'https://example.com/individual/upload-2.jpg',
      referenceImageUrl: 'https://example.com/individual/ref-2.jpg',
      userPrompt: 'Apply beach theme with ocean background',
      finalPrompt: 'Product on beach background with ocean and sunset, vibrant colors, maintaining product integrity. Use the provided ornament product image as the hero subject.',
      created_at: '2024-03-19T14:20:00Z',
    },
    {
      id: 'img-3',
      type: 'model_image',
      imageUrl: 'https://example.com/individual/model-1.jpg',
      uploadedImageUrl: 'https://example.com/individual/upload-3.jpg',
      referenceImageUrl: 'https://example.com/individual/model-ref-1.jpg',
      userPrompt: 'Show product on model with summer styling',
      finalPrompt: 'Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors. CRITICAL: Model must look EXACTLY the same with EXACT same facial structure.',
      created_at: '2024-03-18T09:15:00Z',
    },
    {
      id: 'img-4',
      type: 'campaign_image',
      imageUrl: 'https://example.com/individual/campaign-1.jpg',
      uploadedImageUrl: 'https://example.com/individual/upload-4.jpg',
      referenceImageUrl: 'https://example.com/individual/campaign-ref-1.jpg',
      userPrompt: 'Create a campaign shot with beach resort setting',
      finalPrompt: 'Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic, cohesive style. Model must look EXACTLY the same across ALL images.',
      created_at: '2024-03-17T16:45:00Z',
    },
    {
      id: 'img-5',
      type: 'plain_background',
      imageUrl: 'https://example.com/individual/plain-bg-2.jpg',
      uploadedImageUrl: 'https://example.com/individual/upload-5.jpg',
      referenceImageUrl: null,
      userPrompt: null,
      finalPrompt: 'Remove the background from the product image and replace it with a clean, elegant white studio background.',
      created_at: '2024-03-16T11:20:00Z',
    },
  ];

  const imageTypes = [
    { value: 'all', label: 'All Images' },
    { value: 'plain_background', label: 'Plain Background' },
    { value: 'themed_image', label: 'Themed Image' },
    { value: 'model_image', label: 'Model Image' },
    { value: 'campaign_image', label: 'Campaign Image' },
  ];

  const filteredImages = selectedType === 'all' 
    ? individualImages 
    : individualImages.filter(img => img.type === selectedType);

  const getImageTypeBadge = (type) => {
    const badges = {
      plain_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      themed_image: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      model_image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      campaign_image: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (selectedImage) {
    return (
      <ImageDetailView
        image={selectedImage}
        type="individual"
        onClose={() => setSelectedImage(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Type Filter */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Type
        </label>
        <div className="flex flex-wrap gap-2">
          {imageTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      {filteredImages.length > 0 ? (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedType === 'all' ? 'All Individual Images' : imageTypes.find(t => t.value === selectedType)?.label} ({filteredImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg group"
              >
                <img
                  src={image.imageUrl || '/placeholder.jpg'}
                  alt={`${image.type} image`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getImageTypeBadge(image.type)}>
                    {image.type?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No images found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            No individual images of this type available.
          </p>
        </div>
      )}
    </div>
  );
}

