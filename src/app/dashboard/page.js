'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Building2, Image as ImageIcon, TrendingUp, Users, Activity, Zap, DollarSign, BarChart3 } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
// import { useEffect } from 'react';

// All data is now fetched dynamically from the backend

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('day');
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalImages: 0,
    totalUsers: 0,
    growthRate: 0,
    totalCredits: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const statsResponse = await dashboardAPI.getStats();
        if (statsResponse.success && statsResponse.stats) {
          setStats({
            totalOrganizations: statsResponse.stats.totalOrganizations || 0,
            totalImages: statsResponse.stats.totalImages || 0,
            totalUsers: statsResponse.stats.totalUsers || 0,
            growthRate: statsResponse.stats.growthRate || 0,
            totalCredits: statsResponse.stats.totalCredits || 0,
            activeSubscriptions: statsResponse.stats.activeSubscriptions || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch chart data when component mounts and when timeRange changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch all three chart types in parallel
        const [dailyResponse, weeklyResponse, monthlyResponse] = await Promise.all([
          dashboardAPI.getImageGenerationData('day'),
          dashboardAPI.getImageGenerationData('week'),
          dashboardAPI.getImageGenerationData('month')
        ]);

        if (dailyResponse.success && dailyResponse.data) {
          setChartData(dailyResponse.data);
        }
        if (weeklyResponse.success && weeklyResponse.data) {
          setWeeklyData(weeklyResponse.data);
        }
        if (monthlyResponse.success && monthlyResponse.data) {
          setMonthlyData(monthlyResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };
    fetchChartData();
  }, []); // Only run once on mount

  // Update main chart when timeRange changes
  useEffect(() => {
    if (isInitialLoad) {
      return; // Skip on initial load
    }

    const fetchChartData = async () => {
      try {
        const data = await dashboardAPI.getImageGenerationData(timeRange);
        if (data.success && data.data && data.data.length > 0) {
          setChartData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };
    fetchChartData();
  }, [timeRange, isInitialLoad]);

  const getChartData = () => {
    // Return empty array if no data to prevent chart errors
    if (!chartData || chartData.length === 0) {
      return [];
    }
    return chartData;
  };

  const getWeeklyData = () => {
    return weeklyData && weeklyData.length > 0 ? weeklyData : [];
  };

  const getMonthlyData = () => {
    return monthlyData && monthlyData.length > 0 ? monthlyData : [];
  };

  const getXAxisKey = () => {
    switch (timeRange) {
      case 'day':
        return 'date';
      case 'week':
        return 'week';
      case 'month':
        return 'month';
      default:
        return 'date';
    }
  };

  const getYAxisLabel = () => {
    return timeRange === 'day' ? 'Images Generated' : 'Total Images';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Comprehensive overview of your platform analytics
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Activity className="text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Live Data</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Organizations"
            value={stats.totalOrganizations}
            icon={Building2}
            trend={stats.growthRate}
            gradient="from-blue-500 to-blue-600"
            bgGradient="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
          />
          <StatCard
            title="Images Generated"
            value={stats.totalImages.toLocaleString()}
            icon={ImageIcon}
            trend={stats.growthRate}
            gradient="from-purple-500 to-purple-600"
            bgGradient="from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            trend={stats.growthRate}
            gradient="from-green-500 to-green-600"
            bgGradient="from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
          />
          <StatCard
            title="Growth Rate"
            value={`${stats.growthRate}%`}
            icon={TrendingUp}
            trend={stats.growthRate}
            gradient="from-orange-500 to-orange-600"
            bgGradient="from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
          />
          <StatCard
            title="Total Credits"
            value={stats.totalCredits.toLocaleString()}
            icon={Zap}
            trend={null}
            gradient="from-yellow-500 to-yellow-600"
            bgGradient="from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
          />
          <StatCard
            title="Active Plans"
            value={stats.activeSubscriptions}
            icon={DollarSign}
            trend={null}
            gradient="from-indigo-500 to-indigo-600"
            bgGradient="from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20"
          />
        </div>

        {/* Charts Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 lg:p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Image Generation Analytics
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track image generation trends over time
              </p>
            </div>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setTimeRange('day')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeRange === 'day'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeRange === 'week'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeRange === 'month'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            {getChartData().length > 0 ? (
              <AreaChart data={getChartData()}>
              <defs>
                <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis
                dataKey={getXAxisKey()}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                stroke="currentColor"
              />
              <YAxis
                label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                stroke="currentColor"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
              <Legend />
              {getChartData().length > 0 && (
                <Area
                  type="monotone"
                  dataKey={timeRange === 'day' ? 'count' : 'images'}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorImages)"
                  name="Images Generated"
                />
              )}
            </AreaChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Images by Week
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Weekly generation breakdown</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getWeeklyData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis
                  dataKey="week"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  stroke="currentColor"
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  stroke="currentColor"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                {getWeeklyData().length > 0 && (
                  <Bar dataKey="images" fill="url(#colorBlue)" radius={[8, 8, 0, 0]} />
                )}
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Monthly Overview
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly generation trends</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis
                  dataKey="month"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  stroke="currentColor"
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  stroke="currentColor"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                {getMonthlyData().length > 0 && (
                  <Bar dataKey="images" fill="url(#colorGreen)" radius={[8, 8, 0, 0]} />
                )}
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * StatCard component for displaying statistics
 * @param {string} title - The title of the stat card
 * @param {string|number} value - The value to display
 * @param {React.ComponentType} icon - The icon component to display
 * @param {number} [trend] - Optional trend percentage to display
 * @param {string} gradient - Gradient colors for icon background
 * @param {string} bgGradient - Gradient colors for card background
 */
// eslint-disable-next-line react/prop-types
function StatCard({ title, value, icon: Icon, trend, gradient = 'from-blue-500 to-blue-600', bgGradient = 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' }) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl shadow-md border border-gray-200/50 dark:border-gray-800/50 p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-md`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
      {trend !== null && trend !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center text-xs">
          <TrendingUp className="text-green-600 dark:text-green-400 mr-1" size={14} />
          <span className="text-green-600 dark:text-green-400 font-semibold">
            +{trend}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
}

