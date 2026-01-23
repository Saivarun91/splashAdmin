'use client';

import { User, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function AdminModelSelection({ collectionData }) {
  const item = collectionData?.items?.[0];
  const selectedModel = item?.selected_model;
  const uploadedModels = item?.uploaded_models || [];
  const aiModels = item?.ai_models || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Model Preview Selection</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Selected AI or real model for image generation</p>
        </div>
      </div>

      {/* Selected Model */}
      {selectedModel && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Selected Model</h4>
            <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                {selectedModel.cloud_url || selectedModel.local_url ? (
                  <img
                    src={selectedModel.cloud_url || selectedModel.local_url}
                    alt="Selected model"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300 mb-2">
                  {selectedModel.type || 'Unknown'} Model
                </Badge>
                {selectedModel.name && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <span className="font-medium">Name:</span> {selectedModel.name}
                  </p>
                )}
                {selectedModel.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedModel.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Models */}
      {uploadedModels.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Uploaded Models ({uploadedModels.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedModels.map((model, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <img
                  src={model.cloud_url || model.local_path || '/placeholder.jpg'}
                  alt={model.original_filename || `Model ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Models Available */}
      {aiModels.length > 0 && !selectedModel && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Available AI Models ({aiModels.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aiModels.slice(0, 8).map((model, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <img
                  src={model.cloud_url || model.local_path || '/placeholder.jpg'}
                  alt={model.name || `AI Model ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedModel && uploadedModels.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No model selected for this project.
        </div>
      )}
    </div>
  );
}

