'use client';

import { Check, Lock } from 'lucide-react';
import { useState } from 'react';

export function WorkflowStepsViewer({ project, collectionData }) {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { number: 1, title: 'Brief & Concept', completed: !!collectionData?.description },
    { number: 2, title: 'Moodboard Setup', completed: !!(collectionData?.selected_themes?.length || collectionData?.selected_backgrounds?.length) },
    { number: 3, title: 'Model Preview Selection', completed: !!collectionData?.selected_model },
    { number: 4, title: 'Product Upload', completed: !!(collectionData?.product_images?.length > 0) },
    { number: 5, title: 'Final Image Generation', completed: !!(collectionData?.product_images?.some(p => p.generated_images?.length > 0)) },
  ];

  const getStepContent = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return {
          title: 'Brief & Concept',
          data: {
            description: collectionData?.description || 'No description provided',
            targetAudience: collectionData?.target_audience || 'N/A',
            campaignSeason: collectionData?.campaign_season || 'N/A',
          },
        };
      case 2:
        return {
          title: 'Moodboard Setup',
          data: {
            themes: collectionData?.selected_themes || [],
            backgrounds: collectionData?.selected_backgrounds || [],
            poses: collectionData?.selected_poses || [],
            locations: collectionData?.selected_locations || [],
            colors: collectionData?.selected_colors || [],
            pickedColors: collectionData?.picked_colors || [],
            colorInstructions: collectionData?.color_instructions || '',
            globalInstructions: collectionData?.global_instructions || '',
          },
        };
      case 3:
        return {
          title: 'Model Preview Selection',
          data: {
            selectedModel: collectionData?.selected_model || null,
            modelImages: collectionData?.generated_model_images || [],
          },
        };
      case 4:
        return {
          title: 'Product Upload',
          data: {
            products: collectionData?.product_images || [],
          },
        };
      case 5:
        return {
          title: 'Final Image Generation',
          data: {
            generatedImages: collectionData?.product_images || [],
          },
        };
      default:
        return null;
    }
  };

  const stepContent = getStepContent(activeStep);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Workflow Steps</h3>

      {/* Steps Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.number === activeStep;
            const isCompleted = step.completed;
            const isUnlocked = step.number === 1 || steps[step.number - 2]?.completed;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => isUnlocked && setActiveStep(step.number)}
                    disabled={!isUnlocked}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-md'
                        : isActive
                        ? 'bg-blue-500 text-white border-2 border-blue-300'
                        : isUnlocked
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                    } ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-700 dark:text-gray-300 max-w-[100px]">
                    {step.title}
                  </p>
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {stepContent && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{stepContent.title}</h4>
          <div className="space-y-4">
            {activeStep === 1 && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {stepContent.data.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Target Audience</p>
                    <p className="text-gray-900 dark:text-white">{stepContent.data.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Campaign Season</p>
                    <p className="text-gray-900 dark:text-white">{stepContent.data.campaignSeason}</p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                {stepContent.data.themes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Selected Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {stepContent.data.themes.map((theme, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {stepContent.data.globalInstructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Global Instructions</p>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {stepContent.data.globalInstructions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeStep === 3 && stepContent.data.selectedModel && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Selected Model</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white">Type: {stepContent.data.selectedModel.type || 'N/A'}</p>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Products Uploaded: {stepContent.data.products.length}
                </p>
              </div>
            )}

            {activeStep === 5 && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Generated Images: {stepContent.data.generatedImages.reduce((sum, p) => sum + (p.generated_images?.length || 0), 0)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

