'use client';

import { FolderKanban, Calendar, Users, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function ProjectSelector({ projects, onSelectProject, selectedProjectId }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Projects</h3>
      <div className="space-y-3">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedProjectId === project.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FolderKanban className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.about || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <ImageIcon size={14} />
                        <span>{project.totalImages || 0} images</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{project.members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`text-gray-400 ${selectedProjectId === project.id ? 'text-blue-500' : ''}`} size={20} />
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FolderKanban className="mx-auto mb-2 opacity-50" size={48} />
            <p>No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}

