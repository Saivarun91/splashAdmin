'use client';

import { Sparkles, FileText, Upload, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function AdminMoodboardPrompt({ collectionData }) {
  const item = collectionData?.items?.[0];
  const generatedPrompts =
    item?.generated_prompts || collectionData?.generated_prompts || {};
  const finalMoodboardPrompt =
    item?.final_moodboard_prompt || collectionData?.final_moodboard_prompt || '';

  const selections = [
    { label: 'Themes', values: item?.selected_themes || [] },
    { label: 'Backgrounds', values: item?.selected_backgrounds || [] },
    { label: 'Poses', values: item?.selected_poses || [] },
    { label: 'Locations', values: item?.selected_locations || [] },
    { label: 'Colors', values: item?.selected_colors || [] },
  ];

  const uploadedCounts = [
    { label: 'Themes', count: item?.uploaded_theme_images?.length || 0 },
    { label: 'Backgrounds', count: item?.uploaded_background_images?.length || 0 },
    { label: 'Poses', count: item?.uploaded_pose_images?.length || 0 },
    { label: 'Locations', count: item?.uploaded_location_images?.length || 0 },
    { label: 'Colors', count: item?.uploaded_color_images?.length || 0 },
  ].filter((entry) => entry.count > 0);

  const hasSelections = selections.some((s) => s.values.length > 0);
  const hasGeneratedPrompts = Object.keys(generatedPrompts).length > 0;
  const hasAnyData = hasSelections || uploadedCounts.length > 0 || hasGeneratedPrompts || !!finalMoodboardPrompt;

  const getImageTypeBadge = (type) => {
    const badges = {
      white_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      background_replace: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      model_image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      campaign_image: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (!item && !hasAnyData) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No AI moodboard prompt available for this project yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">AI Moodboard Prompt</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compare what the user selected/uploaded with the prompts AI generated for project images
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User moodboard inputs */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <ListChecks size={16} />
            User Moodboard Input
          </h4>

          {hasSelections ? (
            <div className="space-y-3">
              {selections.map((selection) =>
                selection.values.length > 0 ? (
                  <div key={selection.label}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{selection.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selection.values.map((value, idx) => (
                        <Badge
                          key={`${selection.label}-${idx}`}
                          variant="outline"
                          className="border-blue-300 text-blue-700 dark:text-blue-300"
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No selections saved</p>
          )}

          {uploadedCounts.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                <Upload size={12} />
                Uploaded references
              </p>
              <div className="flex flex-wrap gap-1.5">
                {uploadedCounts.map((entry) => (
                  <Badge key={entry.label} variant="outline" className="border-gray-300 text-gray-700 dark:text-gray-300">
                    {entry.label}: {entry.count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(item?.global_instructions || item?.color_instructions) && (
            <div className="space-y-2">
              {item?.global_instructions && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Global instructions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {item.global_instructions}
                  </p>
                </div>
              )}
              {item?.color_instructions && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Color instructions</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {item.color_instructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI generated prompts */}
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <FileText size={16} />
            AI Generated Prompts
          </h4>

          {hasGeneratedPrompts ? (
            <div className="space-y-3">
              {Object.entries(generatedPrompts).map(([key, prompt]) => (
                <div
                  key={key}
                  className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/40"
                >
                  <Badge className={`${getImageTypeBadge(key)} mb-2`}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Badge>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{prompt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              AI has not generated moodboard prompts for this project yet.
            </p>
          )}
        </div>
      </div>

      {finalMoodboardPrompt && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            Moodboard Summary Prompt (sent to AI)
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {finalMoodboardPrompt}
          </p>
        </div>
      )}
    </div>
  );
}
