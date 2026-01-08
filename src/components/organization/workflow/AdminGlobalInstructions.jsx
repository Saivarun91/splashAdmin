'use client';

import { FileText } from 'lucide-react';

// eslint-disable-next-line react/prop-types
export function AdminGlobalInstructions({ collectionData }) {
  const item = collectionData?.items?.[0];
  const globalInstructions = item?.global_instructions || '';

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Global Instructions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overall styling and aesthetic guidelines</p>
        </div>
      </div>

      {globalInstructions ? (
        <div className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white whitespace-pre-wrap">
          {globalInstructions}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">No global instructions provided</p>
      )}
    </div>
  );
}

