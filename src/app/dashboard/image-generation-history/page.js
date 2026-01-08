'use client';

import { Image as ImageIcon, Calendar, User, Search, Filter, Download, Eye, ExternalLink, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { imageHistoryAPI } from '@/lib/api';

export default function ImageGenerationHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [imageHistory, setImageHistory] = useState([]);

  useEffect(() => {
    const fetchImageHistory = async () => {
      setLoading(true);
      try {
        const data = await imageHistoryAPI.getAll({ type: filterType, search: searchQuery });
        if (Array.isArray(data)) {
          // Transform backend data to match frontend format
          const transformed = data.map((item, index) => ({
            id: item.id || index + 1,
            imageUrl: item.image_url || item.image || '/placeholder-image.jpg',
            prompt: item.prompt || item.description || 'No prompt',
            organization: item.organization_name || item.organization || 'Unknown',
            organizationId: item.organization_id || '',
            user: item.user_name || item.user || 'Unknown',
            userId: item.user_id || '',
            generatedAt: item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A',
            type: item.type || item.category || 'Image Generation',
            credits: item.credits_used || item.credits || 0,
            status: item.status || 'completed',
          }));
          setImageHistory(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch image history:', error);
        setImageHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImageHistory();
  }, [filterType, searchQuery]);

  // Mock data fallback
  const mockImageHistory = [
    {
      id: 1,
      imageUrl: '/placeholder-image.jpg',
      prompt: 'A beautiful sunset over mountains with vibrant colors',
      organization: 'Acme Corporation',
      organizationId: 'org-1',
      user: 'John Doe',
      userId: 'user-1',
      generatedAt: '2024-01-15 10:30 AM',
      type: 'Background Removal',
      credits: 5,
      status: 'completed',
    },
    {
      id: 2,
      imageUrl: '/placeholder-image.jpg',
      prompt: 'Modern office interior design with natural lighting',
      organization: 'Tech Solutions Inc',
      organizationId: 'org-2',
      user: 'Jane Smith',
      userId: 'user-2',
      generatedAt: '2024-01-15 09:15 AM',
      type: 'Image Enhancement',
      credits: 3,
      status: 'completed',
    },
    {
      id: 3,
      imageUrl: '/placeholder-image.jpg',
      prompt: 'Product photography with white background and professional lighting',
      organization: 'Creative Studio',
      organizationId: 'org-3',
      user: 'Bob Johnson',
      userId: 'user-3',
      generatedAt: '2024-01-14 04:45 PM',
      type: 'Background Change',
      credits: 7,
      status: 'completed',
    },
    {
      id: 4,
      imageUrl: '/placeholder-image.jpg',
      prompt: 'Elegant product showcase with minimalist design',
      organization: 'Design Co',
      organizationId: 'org-4',
      user: 'Alice Williams',
      userId: 'user-4',
      generatedAt: '2024-01-14 02:20 PM',
      type: 'Image Enhancement',
      credits: 4,
      status: 'completed',
    },
  ];

  const displayHistory = imageHistory.length > 0 ? imageHistory : mockImageHistory;
  const filteredHistory = displayHistory.filter(item => {
    const matchesSearch = 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'background removal':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'image enhancement':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'background change':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading image history...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Image Generation History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              View and manage all generated images across the platform
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by prompt, organization, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="background removal">Background Removal</option>
                  <option value="image enhancement">Image Enhancement</option>
                  <option value="background change">Background Change</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Images</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{displayHistory.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Total Credits Used</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {displayHistory.reduce((sum, item) => sum + item.credits, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-300">Organizations</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
              {new Set(displayHistory.map(item => item.organization)).size}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Avg Credits/Image</p>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
              {displayHistory.length > 0 ? (displayHistory.reduce((sum, item) => sum + item.credits, 0) / displayHistory.length).toFixed(1) : 0}
            </p>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="text-gray-400 group-hover:scale-110 transition-transform" size={48} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <Eye className="text-gray-900 dark:text-white" size={20} />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {item.prompt}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User size={14} />
                    <span className="font-medium">{item.user}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{item.organization}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                    <Calendar size={14} />
                    <span>{item.generatedAt}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-800">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                    <Zap size={14} className="text-yellow-500" />
                    <span>{item.credits} credits</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No images found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </>
  );
}

