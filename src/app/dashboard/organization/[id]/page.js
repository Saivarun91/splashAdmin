'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { OrganizationStats } from '@/components/organization/OrganizationStats';
import { ProjectsGrid } from '@/components/organization/ProjectsGrid';
import { ProjectDetailView } from '@/components/organization/ProjectDetailView';
import { IndividualImagesView } from '@/components/organization/image-analysis/IndividualImagesView';
import { OrganizationUsers } from '@/components/organization/OrganizationUsers';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { organizationAPI } from '@/lib/api';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setLoading(true);
      try {
        // Fetch organization details (includes projects)
        const orgData = await organizationAPI.getById(params.id);

        // Use projects directly from organization data
        const projects = orgData.projects || [];

        // Transform backend data to match frontend format
        const transformedOrg = {
          id: orgData.id,
          name: orgData.name,
          owner: {
            email: orgData.owner_email,
            // We'll need to fetch owner details separately if needed
          },
          owner_email: orgData.owner_email,
          credit_balance: orgData.credit_balance || 0,
          members: orgData.members || [],
          created_at: orgData.created_at,
          projects: projects,
          // Calculate stats from projects
          totalUsers: (orgData.members?.length || 0) + 1, // +1 for owner
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          draftProjects: projects.filter(p => p.status === 'draft').length,
          totalImages: projects.reduce((sum, p) => sum + (p.total_images || 0), 0),
        };

        setOrganization(transformedOrg);
      } catch (error) {
        console.error('Failed to fetch organization:', error);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrganizationData();
    }
  }, [params.id]);

  useEffect(() => {
    if (selectedProject) {
      // TODO: Fetch collection data for selected project
      // const fetchCollection = async () => {
      //   try {
      //     const data = await apiService.getCollection(selectedProject.collection_id);
      //     setCollectionData(data);
      //   } catch (error) {
      //     console.error('Failed to fetch collection:', error);
      //   }
      // };
      // fetchCollection();

      // Mock collection data - Based on Collection model from splash_backend
      // Structure matches what the components expect (items array)
      setCollectionData({
        id: selectedProject.collection_id,
        description: 'Summer collection featuring vibrant colors, beach themes, and modern fashion',
        target_audience: 'Young adults aged 18-35',
        campaign_season: 'Summer 2024',
        items: [
          {
            selected_themes: ['Beach', 'Tropical', 'Casual'],
            selected_backgrounds: ['Ocean', 'Beach', 'Sunset'],
            selected_poses: ['Standing', 'Walking', 'Sitting'],
            selected_locations: ['Beach', 'Resort', 'Outdoor'],
            selected_colors: ['Blue', 'Yellow', 'White'],
            picked_colors: ['#3B82F6', '#FBBF24', '#FFFFFF'],
            color_instructions: 'Use vibrant blues and yellows as primary colors',
            global_instructions: 'Maintain a fresh, energetic, and modern aesthetic throughout all images',
            selected_model: {
              type: 'ai',
              local_url: '/models/ai-model-1.jpg',
              cloud_url: 'https://example.com/models/ai-model-1.jpg',
            },
            product_images: [
              {
                uploaded_image_url: 'https://example.com/products/product-1.jpg',
                uploaded_image_path: 'https://example.com/products/product-1.jpg',
                generated_images: [
                  {
                    type: 'white_background',
                    image_url: 'https://example.com/generated/white-bg-1.jpg',
                    local_path: 'https://example.com/generated/white-bg-1.jpg',
                    cloud_url: 'https://example.com/generated/white-bg-1.jpg',
                    prompt: 'Professional white background product photography with sharp focus and studio lighting',
                  },
                  {
                    type: 'background_replace',
                    image_url: 'https://example.com/generated/bg-replace-1.jpg',
                    local_path: 'https://example.com/generated/bg-replace-1.jpg',
                    cloud_url: 'https://example.com/generated/bg-replace-1.jpg',
                    prompt: 'Product on beach background with ocean and sunset, vibrant colors',
                  },
                  {
                    type: 'model_image',
                    image_url: 'https://example.com/generated/model-1.jpg',
                    local_path: 'https://example.com/generated/model-1.jpg',
                    cloud_url: 'https://example.com/generated/model-1.jpg',
                    prompt: 'Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors',
                  },
                  {
                    type: 'campaign_image',
                    image_url: 'https://example.com/generated/campaign-1.jpg',
                    local_path: 'https://example.com/generated/campaign-1.jpg',
                    cloud_url: 'https://example.com/generated/campaign-1.jpg',
                    prompt: 'Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic',
                  },
                ],
              },
              {
                uploaded_image_url: 'https://example.com/products/product-2.jpg',
                uploaded_image_path: 'https://example.com/products/product-2.jpg',
                generated_images: [
                  {
                    type: 'white_background',
                    image_url: 'https://example.com/generated/white-bg-2.jpg',
                    local_path: 'https://example.com/generated/white-bg-2.jpg',
                    cloud_url: 'https://example.com/generated/white-bg-2.jpg',
                    prompt: 'Professional white background product photography with sharp focus and studio lighting',
                  },
                ],
              },
            ],
          },
        ],
        generated_prompts: {
          white_background: 'Professional white background product photography with sharp focus and studio lighting',
          background_replace: 'Product on beach background with ocean and sunset, vibrant colors, maintaining product integrity',
          model_image: 'Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors, exact same model appearance',
          campaign_image: 'Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic, cohesive style',
        },
      });
    }
  }, [selectedProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading organization...</div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Organization not found</p>
      </div>
    );
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
    // Load collection data for the selected project
    // This will be used for both the project detail view and image analysis
    if (project.collection_id) {
      // TODO: Replace with actual API call
      // Mock collection data - Based on Collection model from splash_backend
      setCollectionData({
        id: project.collection_id,
        description: 'Summer collection featuring vibrant colors, beach themes, and modern fashion',
        target_audience: 'Young adults aged 18-35',
        campaign_season: 'Summer 2024',
        items: [
          {
            selected_themes: ['Beach', 'Tropical', 'Casual'],
            selected_backgrounds: ['Ocean', 'Beach', 'Sunset'],
            selected_poses: ['Standing', 'Walking', 'Sitting'],
            selected_locations: ['Beach', 'Resort', 'Outdoor'],
            selected_colors: ['Blue', 'Yellow', 'White'],
            picked_colors: ['#3B82F6', '#FBBF24', '#FFFFFF'],
            color_instructions: 'Use vibrant blues and yellows as primary colors',
            global_instructions: 'Maintain a fresh, energetic, and modern aesthetic throughout all images',
            selected_model: {
              type: 'ai',
              local_url: '/models/ai-model-1.jpg',
              cloud_url: 'https://example.com/models/ai-model-1.jpg',
            },
            product_images: [
              {
                uploaded_image_url: 'https://example.com/products/product-1.jpg',
                uploaded_image_path: 'https://example.com/products/product-1.jpg',
                generated_images: [
                  {
                    type: 'white_background',
                    image_url: 'https://example.com/generated/white-bg-1.jpg',
                    local_path: 'https://example.com/generated/white-bg-1.jpg',
                    cloud_url: 'https://example.com/generated/white-bg-1.jpg',
                    prompt: 'Professional white background product photography with sharp focus and studio lighting',
                  },
                  {
                    type: 'background_replace',
                    image_url: 'https://example.com/generated/bg-replace-1.jpg',
                    local_path: 'https://example.com/generated/bg-replace-1.jpg',
                    cloud_url: 'https://example.com/generated/bg-replace-1.jpg',
                    prompt: 'Product on beach background with ocean and sunset, vibrant colors',
                  },
                  {
                    type: 'model_image',
                    image_url: 'https://example.com/generated/model-1.jpg',
                    local_path: 'https://example.com/generated/model-1.jpg',
                    cloud_url: 'https://example.com/generated/model-1.jpg',
                    prompt: 'Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors',
                  },
                  {
                    type: 'campaign_image',
                    image_url: 'https://example.com/generated/campaign-1.jpg',
                    local_path: 'https://example.com/generated/campaign-1.jpg',
                    cloud_url: 'https://example.com/generated/campaign-1.jpg',
                    prompt: 'Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic',
                  },
                ],
              },
              {
                uploaded_image_url: 'https://example.com/products/product-2.jpg',
                uploaded_image_path: 'https://example.com/products/product-2.jpg',
                generated_images: [
                  {
                    type: 'white_background',
                    image_url: 'https://example.com/generated/white-bg-2.jpg',
                    local_path: 'https://example.com/generated/white-bg-2.jpg',
                    cloud_url: 'https://example.com/generated/white-bg-2.jpg',
                    prompt: 'Professional white background product photography with sharp focus and studio lighting',
                  },
                ],
              },
            ],
          },
        ],
        generated_prompts: {
          white_background: 'Professional white background product photography with sharp focus and studio lighting',
          background_replace: 'Product on beach background with ocean and sunset, vibrant colors, maintaining product integrity',
          model_image: 'Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors, exact same model appearance',
          campaign_image: 'Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic, cohesive style',
        },
      });
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section with Organization Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/organization')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {organization.name}
              </h1>
              <p className="text-blue-100 text-sm">Organization Management Dashboard</p>
            </div>
          </div>
        </div>

        {/* Organization Details Card */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Organization Owner</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.owner_email || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{organization.owner_email || ''}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Credit Balance</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                  {organization.credit_balance?.toLocaleString() || 0} credits
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available credits</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.created_at ? new Date(organization.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member since</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <OrganizationStats organization={organization} />

      {/* Main Content Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-8">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b-0 gap-1">
              <TabsTrigger
                value="projects"
                className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm transition-all"
              >
                Projects
                {organization.projects?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {organization.projects.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm transition-all"
              >
                Team Members
                {organization.members?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {organization.members.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="image-analysis"
                className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm transition-all"
              >
                Image Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="m-0 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Projects Overview</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage and monitor all projects within this organization</p>
            </div>
            <ProjectsGrid
              projects={organization.projects || []}
              onSelectProject={handleProjectSelect}
              selectedProjectId={selectedProject?.id}
            />
          </TabsContent>

          <TabsContent value="users" className="m-0 p-8">
            <OrganizationUsers
              organization={organization}
              onUserAdded={() => {
                // Refresh organization data when user is added
                const fetchOrg = async () => {
                  try {
                    const orgData = await organizationAPI.getById(params.id);
                    setOrganization(prev => ({
                      ...prev,
                      members: orgData.members || [],
                      totalUsers: (orgData.members?.length || 0) + 1,
                    }));
                  } catch (error) {
                    console.error('Failed to refresh organization:', error);
                  }
                };
                fetchOrg();
              }}
            />
          </TabsContent>

          <TabsContent value="image-analysis" className="m-0 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Image Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">Analyze and review generated images across all projects</p>
            </div>
            <IndividualImagesView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Detail View Modal */}
      {showProjectDetail && selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          collectionData={collectionData}
          onClose={() => {
            setShowProjectDetail(false);
            setSelectedProject(null);
            setCollectionData(null);
          }}
        />
      )}
    </div>
  );
}

