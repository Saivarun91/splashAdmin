'use client';

import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function PromptDisplay({ prompts, title = 'Prompts Used' }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!prompts || Object.keys(prompts).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="mx-auto mb-2 opacity-50" size={48} />
          <p>No prompts available</p>
        </div>
      </div>
    );
  }

  const promptTypes = {
    white_background: 'White Background',
    background_replace: 'Background Replace',
    model_image: 'Model Image',
    campaign_image: 'Campaign Image',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {Object.entries(prompts).map(([key, prompt], index) => (
          <div
            key={key}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {promptTypes[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <button
                onClick={() => copyToClipboard(prompt, index)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy prompt"
              >
                {copiedIndex === index ? (
                  <Check className="text-green-500" size={18} />
                ) : (
                  <Copy className="text-gray-400" size={18} />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg whitespace-pre-wrap">
              {prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

