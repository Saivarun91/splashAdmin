'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, FolderKanban, Users, Workflow, Image as ImageIcon } from 'lucide-react';
import { AdminWorkflowTab } from './AdminWorkflowTab';
import { AdminCollaboratorsTab } from './AdminCollaboratorsTab';
import { ProjectImagesView } from './image-analysis/ProjectImagesView';

// eslint-disable-next-line react/prop-types
export function ProjectDetailView({ project, collectionData, onClose }) {
  const [activeTab, setActiveTab] = useState('workflow');

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.about || 'No description'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b-0">
                <TabsTrigger
                  value="workflow"
                  className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                >
                  <Workflow size={18} className="mr-2" />
                  Workflow
                </TabsTrigger>
                <TabsTrigger
                  value="collaborators"
                  className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                >
                  <Users size={18} className="mr-2" />
                  Collaborators
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                >
                  <ImageIcon size={18} className="mr-2" />
                  Image Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="workflow" className="m-0 p-6">
                <AdminWorkflowTab project={project} collectionData={collectionData} />
              </TabsContent>

              <TabsContent value="collaborators" className="m-0 p-6">
                <AdminCollaboratorsTab project={project} />
              </TabsContent>

              <TabsContent value="images" className="m-0 p-6">
                <ProjectImagesView project={project} collectionData={collectionData} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

