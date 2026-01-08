'use client';

import { FolderKanban, Clock, Users, Eye, MoreVertical } from 'lucide-react';
import { useState } from 'react';

// eslint-disable-next-line react/prop-types
export function ProjectsGrid({ projects, onSelectProject, selectedProjectId }) {
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'progress':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No projects found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">This organization has no projects yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const isSelected = selectedProjectId === project.id;
        const updatedAt = project.updated_at || project.created_at;
        const imageCount = project.totalImages || 0;
        const collaborators = project.members || project.team_members || [];

        return (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`group bg-white dark:bg-gray-900 rounded-xl p-6 border cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              isSelected
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <FolderKanban className="w-7 h-7 text-white" />
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(project.status || 'draft')}`}>
                {getStatusText(project.status || 'draft')}
              </span>
            </div>

            {/* Project Title and Description */}
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
              {project.about && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {project.about}
                </p>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Images</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{imageCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Updated</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{getTimeAgo(updatedAt)}</p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {collaborators.length > 0 ? (
                  <>
                    <div className="flex -space-x-2">
                      {collaborators.slice(0, 3).map((member, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-xs font-semibold text-white border-2 border-white dark:border-gray-900 shadow-sm"
                          title={member.full_name || member.user_name || member.email || 'Member'}
                        >
                          {(member.full_name || member.user_name || member.email || 'A')[0].toUpperCase()}
                        </div>
                      ))}
                    </div>
                    {collaborators.length > 3 && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
                        +{collaborators.length - 3} more
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">No collaborators</span>
                )}
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                <Eye size={16} />
                View Details
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

