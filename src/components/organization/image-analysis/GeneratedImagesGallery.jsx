'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageDetailView } from './ImageDetailView';
import GeneratedSmartImage from '@/components/images/GeneratedSmartImage';
import { organizationAPI, individualUserAPI } from '@/lib/api';

const PAGE_SIZE = 20;

const IMAGE_TYPE_FILTERS = [
  { value: 'all', label: 'All Images' },
  { value: 'white_background', label: 'Plain Background' },
  { value: 'background_change', label: 'Themed / Background' },
  { value: 'model_with_ornament', label: 'Model Image' },
  { value: 'real_model_with_ornament', label: 'Real Model' },
  { value: 'campaign_shot_advanced', label: 'Campaign Image' },
];

const TYPE_BADGES = {
  white_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  background_change: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  background_replace: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  model_with_ornament: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  real_model_with_ornament: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  model_image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  campaign_shot_advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  campaign_image: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  plain_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  themed_image: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
};

function formatTypeLabel(type) {
  if (!type) return 'Image';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function GeneratedImagesGallery({ organizationId, userId }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState({ total: 0, individual: 0 });

  useEffect(() => {
    setPage(0);
  }, [selectedType, organizationId, userId]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!organizationId && !userId) return;
      setLoading(true);
      setError('');
      try {
        const params = {
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          standalone_only: '1',
        };
        if (selectedType !== 'all') {
          params.image_type = selectedType;
        }

        const data = organizationId
          ? await organizationAPI.getImages(organizationId, params)
          : await individualUserAPI.getImages(userId, params);

        const normalized = (data.images || []).map((img) => ({
          id: img.id,
          type: img.image_type || img.type,
          imageUrl: img.image_url,
          imageLocalPath: img.generated_image_path || img.metadata?.generated_image_path || null,
          uploadedImageUrl: img.metadata?.uploaded_image_url || null,
          uploadedImagePath: img.metadata?.uploaded_image_path || null,
          uploadedOrnamentUrls: img.metadata?.uploaded_ornament_urls || [],
          referenceImageUrl: img.metadata?.model_image_url || null,
          referenceImagePath: img.metadata?.model_image_path || null,
          referenceAnalysis: img.reference_analysis || img.metadata?.reference_analysis || '',
          dressAnalysis: img.dress || img.metadata?.dress || '',
          userPrompt: img.original_prompt || null,
          finalPrompt: img.prompt || '',
          created_at: img.created_at,
          source: img.source,
          project_id: img.project_id,
        }));

        setImages(normalized);
        setCounts({
          total: data.total_count || normalized.length,
          individual: data.individual_images_count || normalized.length,
        });
      } catch (err) {
        console.error('Failed to fetch images:', err);
        setError('Failed to load generated images.');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [organizationId, userId, selectedType, page]);

  const totalPages = Math.max(1, Math.ceil(counts.total / PAGE_SIZE));
  const canGoPrev = page > 0;
  const canGoNext = (page + 1) * PAGE_SIZE < counts.total;

  if (selectedImage) {
    return (
      <ImageDetailView
        image={selectedImage}
        type={selectedImage.source === 'project' ? 'project' : 'individual'}
        onClose={() => setSelectedImage(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">Standalone Generator Images</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{counts.total}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300">On This Page</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{images.length}</p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Type
        </label>
        <div className="flex flex-wrap gap-2">
          {IMAGE_TYPE_FILTERS.map((type) => (
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {images.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Images ({counts.total})
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canGoPrev}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!canGoNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg group"
              >
                <GeneratedSmartImage
                  image={{ local_path: image.imageLocalPath, image_url: image.imageUrl, id: image.id }}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  alt={`${image.type} image`}
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <Badge className={TYPE_BADGES[image.type] || 'bg-gray-100 text-gray-800'}>
                    {formatTypeLabel(image.type)}
                  </Badge>
                  <Badge className="bg-black/60 text-white text-[10px]">
                    Standalone
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
            No standalone generated images match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
