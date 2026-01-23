'use client';

import { FileText } from 'lucide-react';

// eslint-disable-next-line react/prop-types
export function AdminBriefAndConcept({ collectionData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Brief & Concept</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Project vision and inspiration</p>
        </div>
      </div>

      <div className="space-y-6">
        {collectionData?.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Description
            </label>
            <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
              {collectionData.description}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {collectionData?.target_audience && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                {collectionData.target_audience}
              </div>
            </div>
          )}

          {collectionData?.campaign_season && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Season
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                {collectionData.campaign_season}
              </div>
            </div>
          )}
        </div>

        {!collectionData?.description && !collectionData?.target_audience && !collectionData?.campaign_season && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No brief information available for this project.
          </div>
        )}
      </div>
    </div>
  );
}

