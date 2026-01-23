'use client';

import { Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function AdminColorPalette({ collectionData }) {
  const item = collectionData?.items?.[0];

  if (!item) {
    return null;
  }

  const selectedColors = item.selected_colors || [];
  const pickedColors = item.picked_colors || [];
  const colorInstructions = item.color_instructions || '';
  const uploadedColorImages = item.uploaded_color_images || [];
  const suggestedColors = item.suggested_colors || [];

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
          <Palette className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Color Palette</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected colors and color instructions</p>
        </div>
      </div>

      {/* Selected Colors */}
      {selectedColors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Selected Colors</h4>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, idx) => (
              <Badge key={idx} variant="outline" className="border-yellow-300 text-yellow-700 dark:text-yellow-300">
                {color}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Picked Colors */}
      {pickedColors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Picked Colors</h4>
          <div className="flex flex-wrap gap-3">
            {pickedColors.map((color, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Color Images */}
      {uploadedColorImages.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Reference Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploadedColorImages.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <img
                  src={img.cloud_url || img.local_path || '/placeholder.jpg'}
                  alt={img.original_filename || `Color ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Instructions */}
      {colorInstructions && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Instructions</h4>
          <div className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
            {colorInstructions}
          </div>
        </div>
      )}

      {/* Suggestions (if no selections) */}
      {selectedColors.length === 0 && pickedColors.length === 0 && suggestedColors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">AI Color Suggestions</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedColors.slice(0, 10).map((color, idx) => (
              <Badge key={idx} variant="outline" className="border-gray-300 text-gray-600 dark:text-gray-400">
                {color}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedColors.length === 0 && pickedColors.length === 0 && uploadedColorImages.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">No colors selected</p>
      )}
    </div>
  );
}

