'use client';

import { Box, Image as ImageIcon } from 'lucide-react';

// eslint-disable-next-line react/prop-types
export function AdminProductUpload({ collectionData }) {
  const item = collectionData?.items?.[0];
  const productImages = item?.product_images || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
          <Box className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Product Upload</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Product images uploaded for generation ({productImages.length} products)
          </p>
        </div>
      </div>

      {productImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productImages.map((product, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
            >
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-900">
                <img
                  src={product.uploaded_image_url || product.uploaded_image_path || '/placeholder.jpg'}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product {idx + 1}
                </p>
                {product.generated_images && product.generated_images.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {product.generated_images.length} generated image(s)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Box className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No product images uploaded for this project.</p>
        </div>
      )}
    </div>
  );
}

