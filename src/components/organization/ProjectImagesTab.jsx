'use client';

import { useState } from 'react';
import { Image as ImageIcon, Palette, User, Box, FileText, ZoomIn, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function ProjectImagesTab({ project, collectionData }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  if (!collectionData || !collectionData.items?.[0]?.product_images) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No project images found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          This project has no product images or generated images yet.
        </p>
      </div>
    );
  }

  const item = collectionData.items[0];
  const productImages = item.product_images || [];

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
      {/* Moodboard References Section */}
      {item && (
        <Card className="p-6 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Moodboard References</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {item.selected_themes?.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Themes:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.selected_themes.map((theme, idx) => (
                    <Badge key={idx} variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {item.selected_backgrounds?.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Backgrounds:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.selected_backgrounds.map((bg, idx) => (
                    <Badge key={idx} variant="outline" className="border-green-300 text-green-700 dark:text-green-300">
                      {bg}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {item.selected_poses?.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Poses:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.selected_poses.map((pose, idx) => (
                    <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
                      {pose}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {item.selected_colors?.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Colors:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.selected_colors.map((color, idx) => (
                    <Badge key={idx} variant="outline" className="border-yellow-300 text-yellow-700 dark:text-yellow-300">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {item.picked_colors?.length > 0 && (
              <div className="md:col-span-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Picked Colors:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.picked_colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-700"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {item.global_instructions && (
              <div className="md:col-span-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Global Instructions:</span>
                <p className="mt-1 text-gray-900 dark:text-white">{item.global_instructions}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Model Selection Section */}
      {item?.selected_model && (
        <Card className="p-6 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Model</h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {item.selected_model.cloud_url || item.selected_model.local_url ? (
                <img
                  src={item.selected_model.cloud_url || item.selected_model.local_url}
                  alt="Selected model"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 mb-2">
                {item.selected_model.type || 'Unknown'} Model
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Model selected for image generation
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Product Images and Generated Images */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Product Images & Generated Results
        </h4>

        {productImages.map((product, productIdx) => (
          <Card key={productIdx} className="p-6 border-gray-200 dark:border-gray-800">
            {/* Product Image */}
            <div className="mb-6">
              <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-500" />
                Product Image {productIdx + 1}
              </h5>
              <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={product.uploaded_image_url || product.uploaded_image_path || '/placeholder-product.jpg'}
                  alt={`Product ${productIdx + 1}`}
                  className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => setZoomedImage(product.uploaded_image_url || product.uploaded_image_path)}
                />
                <button
                  onClick={() => setZoomedImage(product.uploaded_image_url || product.uploaded_image_path)}
                  className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <ZoomIn size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Generated Images */}
            {product.generated_images && product.generated_images.length > 0 ? (
              <div>
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Generated Images</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.generated_images.map((genImage, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedImage(genImage)}
                    >
                      <div className="relative aspect-square">
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
                      <div className="p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {genImage.prompt || 'No prompt available'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No generated images for this product yet.
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Generated Prompts Section */}
      {collectionData.generated_prompts && (
        <Card className="p-6 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Prompts</h4>
          </div>
          <div className="space-y-4">
            {Object.entries(collectionData.generated_prompts).map(([key, prompt]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <Badge className={`${getImageTypeBadge(key)} mb-2`}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                </Badge>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{prompt}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Details</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <img
                  src={selectedImage.image_url || selectedImage.local_path || selectedImage.cloud_url}
                  alt="Generated image"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800"
                />
              </div>
              <div>
                <Badge className={getImageTypeBadge(selectedImage.type)} mb-2>
                  {selectedImage.type?.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                </Badge>
                <h4 className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">Prompt Used:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {selectedImage.prompt || 'No prompt available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
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

