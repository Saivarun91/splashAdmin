'use client';

import { Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function AdminImageGeneration({ collectionData }) {
  const item = collectionData?.items?.[0];
  const productImages = item?.product_images || [];
  const generatedPrompts = collectionData?.generated_prompts || {};

  const getImageTypeBadge = (type) => {
    const badges = {
      white_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      background_replace: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      model_image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      campaign_image: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Final Image Generation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Generated images and prompts</p>
        </div>
      </div>

      {/* Generated Prompts */}
      {Object.keys(generatedPrompts).length > 0 && (
        <div className="space-y-4 mb-8">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileText size={16} />
            Generated Prompts
          </h4>
          <div className="space-y-3">
            {Object.entries(generatedPrompts).map(([key, prompt]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <Badge className={`${getImageTypeBadge(key)} mb-2`}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                </Badge>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Images by Product */}
      {productImages.length > 0 && (
        <div className="space-y-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <ImageIcon size={16} />
            Generated Images
          </h4>
          {productImages.map((product, productIdx) => (
            <div key={productIdx} className="space-y-4">
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Product {productIdx + 1} - {product.generated_images?.length || 0} generated image(s)
              </h5>
              {product.generated_images && product.generated_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.generated_images.map((genImage, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={genImage.image_url || genImage.local_path || genImage.cloud_url || '/placeholder.jpg'}
                          alt={`Generated ${genImage.type || 'image'}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={getImageTypeBadge(genImage.type)}>
                            {genImage.type?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">No images generated for this product yet</p>
              )}
            </div>
          ))}
        </div>
      )}

      {Object.keys(generatedPrompts).length === 0 && productImages.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No images generated for this project yet.</p>
        </div>
      )}
    </div>
  );
}

