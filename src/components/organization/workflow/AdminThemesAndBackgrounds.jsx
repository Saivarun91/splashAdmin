'use client';

import { Palette, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function AdminThemesAndBackgrounds({ collectionData }) {
  const item = collectionData?.items?.[0];

  if (!item) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No moodboard data available for this project.
      </div>
    );
  }

  const categories = [
    {
      name: 'Themes',
      selected: item.selected_themes || [],
      uploaded: item.uploaded_theme_images || [],
      suggestions: item.suggested_themes || [],
    },
    {
      name: 'Backgrounds',
      selected: item.selected_backgrounds || [],
      uploaded: item.uploaded_background_images || [],
      suggestions: item.suggested_backgrounds || [],
    },
    {
      name: 'Poses',
      selected: item.selected_poses || [],
      uploaded: item.uploaded_pose_images || [],
      suggestions: item.suggested_poses || [],
    },
    {
      name: 'Locations',
      selected: item.selected_locations || [],
      uploaded: item.uploaded_location_images || [],
      suggestions: item.suggested_locations || [],
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Themes & Backgrounds</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected themes, backgrounds, poses, and locations</p>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category.name} className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{category.name}</h4>

          {/* Selected Items */}
          {category.selected.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Selected:</p>
              <div className="flex flex-wrap gap-2">
                {category.selected.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Images */}
          {category.uploaded.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Uploaded Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {category.uploaded.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <img
                      src={img.cloud_url || img.local_path || '/placeholder.jpg'}
                      alt={img.original_filename || `${category.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions (if any) */}
          {category.suggestions.length > 0 && category.selected.length === 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">AI Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {category.suggestions.slice(0, 5).map((suggestion, idx) => (
                  <Badge key={idx} variant="outline" className="border-gray-300 text-gray-600 dark:text-gray-400">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {category.selected.length === 0 && category.uploaded.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500 italic">No {category.name.toLowerCase()} selected</p>
          )}
        </div>
      ))}
    </div>
  );
}

