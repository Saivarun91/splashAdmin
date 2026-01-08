'use client';

import { FileText, Plus, Edit, Trash2, Search, Filter, TrendingUp, Sparkles, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { promptAPI } from '@/lib/api';

export default function PromptMasterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const data = await promptAPI.getAll();
        if (Array.isArray(data)) {
          // Transform backend data to match frontend format
          const transformed = data.map((prompt, index) => ({
            id: prompt.id || index + 1,
            name: prompt.name || prompt.prompt_key || 'Unnamed Prompt',
            prompt: prompt.prompt_text || prompt.prompt || '',
            category: prompt.category || 'General',
            usageCount: prompt.usage_count || 0,
            createdAt: prompt.created_at ? new Date(prompt.created_at).toISOString().split('T')[0] : 'N/A',
            lastUsed: prompt.last_used ? new Date(prompt.last_used).toISOString().split('T')[0] : 'N/A',
            status: prompt.is_active !== false ? 'active' : 'inactive',
          }));
          setPrompts(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
        setPrompts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  // Mock data fallback
  const mockPrompts = [
    {
      id: 1,
      name: 'Background Removal',
      prompt: 'Remove the background from the image and make it transparent with clean edges',
      category: 'Background',
      usageCount: 1250,
      createdAt: '2024-01-10',
      lastUsed: '2024-04-15',
      status: 'active',
    },
    {
      id: 2,
      name: 'Image Enhancement',
      prompt: 'Enhance the image quality, improve colors, sharpness, and overall visual appeal',
      category: 'Enhancement',
      usageCount: 890,
      createdAt: '2024-01-15',
      lastUsed: '2024-04-14',
      status: 'active',
    },
    {
      id: 3,
      name: 'Product Photography',
      prompt: 'Create professional product photography with white background and optimal lighting',
      category: 'Product',
      usageCount: 2100,
      createdAt: '2024-02-01',
      lastUsed: '2024-04-16',
      status: 'active',
    },
    {
      id: 4,
      name: 'Color Correction',
      prompt: 'Correct colors and adjust brightness, contrast, and saturation for optimal results',
      category: 'Enhancement',
      usageCount: 650,
      createdAt: '2024-02-15',
      lastUsed: '2024-04-13',
      status: 'active',
    },
    {
      id: 5,
      name: 'Background Replacement',
      prompt: 'Replace the background with a new scene while maintaining subject quality',
      category: 'Background',
      usageCount: 980,
      createdAt: '2024-03-01',
      lastUsed: '2024-04-12',
      status: 'active',
    },
  ];

  const displayPrompts = prompts.length > 0 ? prompts : mockPrompts;
  const filteredPrompts = displayPrompts.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'background':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'enhancement':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'product':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const totalUsage = displayPrompts.reduce((sum, p) => sum + p.usageCount, 0);
  const categories = [...new Set(displayPrompts.map(p => p.category))];

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading prompts...</div>
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
              Prompt Master
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Manage and organize AI prompts for image generation
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium">
            <Plus size={18} />
            Add Prompt
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Prompts</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{displayPrompts.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Total Usage</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{totalUsage.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-300">Categories</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{categories.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search prompts by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <FileText className="text-white" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {prompt.name}
                    </h3>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(prompt.category)}`}>
                      {prompt.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                {prompt.prompt}
              </p>
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="font-semibold">{prompt.usageCount.toLocaleString()}</span>
                    <span>uses</span>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all">
                    <Eye size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Created: {prompt.createdAt}</span>
                  <span>Last used: {prompt.lastUsed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Sparkles className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No prompts found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </>
  );
}

