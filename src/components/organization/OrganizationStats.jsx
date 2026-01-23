'use client';

import { Users, Image as ImageIcon, FolderKanban, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function OrganizationStats({ organization }) {
  const stats = [
    {
      title: 'Total Users',
      value: organization.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    {
      title: 'Images Generated',
      value: organization.totalImages || 0,
      icon: ImageIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
    {
      title: 'Total Projects',
      value: organization.totalProjects || 0,
      icon: FolderKanban,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    },
    {
      title: 'Growth Rate',
      value: `${organization.growthRate || 0}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    },
  ];

  // Mock data for charts
  const monthlyImageData = [
    { month: 'Jan', images: 1200 },
    { month: 'Feb', images: 1500 },
    { month: 'Mar', images: 1800 },
    { month: 'Apr', images: 2100 },
    { month: 'May', images: 2400 },
  ];

  const projectTypeData = [
    { name: 'Active', value: organization.activeProjects || 0, color: '#10b981' },
    { name: 'Completed', value: organization.completedProjects || 0, color: '#3b82f6' },
    { name: 'Draft', value: organization.draftProjects || 0, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{stat.title}</p>
                <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-lg shadow-sm`}>
                  <Icon className="text-white" size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-3"></div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Images Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Monthly Image Generation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track image generation trends over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyImageData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis 
                dataKey="month" 
                className="text-gray-600 dark:text-gray-400" 
                tick={{ fill: 'currentColor', fontSize: 12 }} 
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400" 
                tick={{ fill: 'currentColor', fontSize: 12 }} 
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar dataKey="images" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Types Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Projects by Status</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Distribution of project statuses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {projectTypeData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

