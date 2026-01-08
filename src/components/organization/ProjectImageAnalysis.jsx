'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Box, Image as ImageIcon } from 'lucide-react';
import { ProjectImagesView } from './image-analysis/ProjectImagesView';
import { IndividualImagesView } from './image-analysis/IndividualImagesView';

// eslint-disable-next-line react/prop-types
export function ProjectImageAnalysis({ project, collectionData }) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Image Generation Analysis</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed analysis of project and individual image generation with prompts and references
        </p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Box size={18} />
            Projects
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <ImageIcon size={18} />
            Individual Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <ProjectImagesView project={project} collectionData={collectionData} />
        </TabsContent>

        <TabsContent value="individual" className="mt-6">
          <IndividualImagesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
