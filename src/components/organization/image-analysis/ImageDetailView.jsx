'use client';

import { X, FileText, Upload, Image as ImageIcon, Palette, User, Box, Sparkles, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// eslint-disable-next-line react/prop-types
export function ImageDetailView({ image, type, onClose, collectionData }) {
  const getImageTypeBadge = (imgType) => {
    const badges = {
      white_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      background_replace: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      model_image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      campaign_image: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      plain_background: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      themed_image: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    };
    return badges[imgType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  // For project images, get workflow steps from collectionData
  const getWorkflowSteps = () => {
    if (type !== 'project' || !collectionData) return null;
    
    const item = collectionData.items?.[0];
    if (!item) return null;

    const steps = [];

    // Step 1: Brief & Concept
    if (collectionData.description || collectionData.target_audience || collectionData.campaign_season) {
      steps.push({
        number: 1,
        title: 'Brief & Concept',
        icon: FileText,
        completed: true,
        details: {
          description: collectionData.description,
          targetAudience: collectionData.target_audience,
          campaignSeason: collectionData.campaign_season,
        },
      });
    }

    // Step 2: Moodboard Setup
    if (item.selected_themes?.length > 0 || item.selected_backgrounds?.length > 0 || 
        item.selected_poses?.length > 0 || item.selected_locations?.length > 0 ||
        item.selected_colors?.length > 0 || item.picked_colors?.length > 0) {
      steps.push({
        number: 2,
        title: 'Moodboard Setup',
        icon: Palette,
        completed: true,
        details: {
          themes: item.selected_themes || [],
          backgrounds: item.selected_backgrounds || [],
          poses: item.selected_poses || [],
          locations: item.selected_locations || [],
          colors: item.selected_colors || [],
          pickedColors: item.picked_colors || [],
          globalInstructions: item.global_instructions,
        },
      });
    }

    // Step 3: Model Selection
    if (item.selected_model) {
      steps.push({
        number: 3,
        title: 'Model Preview Selection',
        icon: User,
        completed: true,
        details: {
          model: item.selected_model,
        },
      });
    }

    // Step 4: Product Upload
    if (item.product_images?.length > 0) {
      steps.push({
        number: 4,
        title: 'Product Upload',
        icon: Box,
        completed: true,
        details: {
          productCount: item.product_images.length,
        },
      });
    }

    // Step 5: Image Generation
    if (collectionData.generated_prompts) {
      steps.push({
        number: 5,
        title: 'Final Image Generation',
        icon: Sparkles,
        completed: true,
        details: {
          prompts: collectionData.generated_prompts,
        },
      });
    }

    return steps;
  };

  const workflowSteps = getWorkflowSteps();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Badge className={getImageTypeBadge(image.type)}>
              {image.type?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
            </Badge>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {type === 'project' ? 'Project Image Details' : 'Individual Image Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Image */}
            <div className="space-y-4">
              <div className="sticky top-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Image</h3>
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={image.imageUrl || '/placeholder.jpg'}
                    alt="Generated image"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {type === 'project' ? (
                <>
                  {/* Workflow Steps */}
                  {workflowSteps && workflowSteps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Sparkles size={18} />
                        Workflow Steps Used
                      </h3>
                      <div className="space-y-4">
                        {workflowSteps.map((step) => {
                          const Icon = step.icon;
                          return (
                            <div
                              key={step.number}
                              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon size={18} className="text-gray-600 dark:text-gray-400" />
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Step {step.number}: {step.title}
                                  </h4>
                                </div>
                              </div>
                              <div className="ml-11 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                {step.details.description && (
                                  <p><span className="font-medium">Description:</span> {step.details.description}</p>
                                )}
                                {step.details.targetAudience && (
                                  <p><span className="font-medium">Target Audience:</span> {step.details.targetAudience}</p>
                                )}
                                {step.details.campaignSeason && (
                                  <p><span className="font-medium">Campaign Season:</span> {step.details.campaignSeason}</p>
                                )}
                                {step.details.themes?.length > 0 && (
                                  <p><span className="font-medium">Themes:</span> {step.details.themes.join(', ')}</p>
                                )}
                                {step.details.backgrounds?.length > 0 && (
                                  <p><span className="font-medium">Backgrounds:</span> {step.details.backgrounds.join(', ')}</p>
                                )}
                                {step.details.colors?.length > 0 && (
                                  <p><span className="font-medium">Colors:</span> {step.details.colors.join(', ')}</p>
                                )}
                                {step.details.globalInstructions && (
                                  <p><span className="font-medium">Global Instructions:</span> {step.details.globalInstructions}</p>
                                )}
                                {step.details.model && (
                                  <p><span className="font-medium">Model Type:</span> {step.details.model.type || 'Unknown'}</p>
                                )}
                                {step.details.productCount && (
                                  <p><span className="font-medium">Products:</span> {step.details.productCount}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Final Prompt */}
                  {image.prompt && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={18} />
                        Final Prompt Used
                      </h3>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                          {image.prompt}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Uploaded Image */}
                  {image.uploadedImageUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Upload size={18} />
                        Uploaded Image
                      </h3>
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <img
                          src={image.uploadedImageUrl}
                          alt="Uploaded image"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* User Prompt */}
                  {image.userPrompt && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={18} />
                        Prompt Given by User
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {image.userPrompt}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reference Images */}
                  {image.referenceImageUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={18} />
                        Reference Image
                      </h3>
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <img
                          src={image.referenceImageUrl}
                          alt="Reference image"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Final Prompt */}
                  {image.finalPrompt && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText size={18} />
                        Final Prompt Used
                      </h3>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                          {image.finalPrompt}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

