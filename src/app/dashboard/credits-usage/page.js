'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Coins, TrendingUp, TrendingDown, Activity, Zap, Download, Filter, X, Calendar, Settings, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { creditsAPI } from '@/lib/api';

export default function CreditsUsagePage() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    start_date: '',
    end_date: ''
  });
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'debit', 'credit'
  const [creditSettings, setCreditSettings] = useState({
    credits_per_image_generation: 2,
    credits_per_regeneration: 1,
    default_image_model_name: 'gemini-3-pro-image-preview',
    credit_reminder_threshold_1: 20,
    credit_reminder_threshold_2: 10,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [error, setError] = useState(null);
  const [monthlyUsage, setMonthlyUsage] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    // Fetch both API calls in parallel for better performance
    const fetchData = async () => {
      setLoading(true);
      setSettingsLoading(true);
      
      try {
        // Make both API calls in parallel
        const [usageData, settingsData] = await Promise.all([
          creditsAPI.getAllOrganizationsUsage({ summary_only: 'true' }),
          creditsAPI.getSettings()
        ]);

        // Process usage data
        if (usageData.organizations) {
          // Transform backend data to match frontend format
          const transformed = usageData.organizations.map(org => {
            const totalDebits = org.summary?.total_debits || 0;
            const currentBalance = org.organization?.current_balance || 0;
            const totalCredits = currentBalance + totalDebits; // Approximate total

            return {
              organization: org.organization?.name || 'Unknown',
              organizationId: org.organization?.id || '',
              creditsUsed: totalDebits,
              creditsRemaining: currentBalance,
              totalCredits: totalCredits || currentBalance,
              usagePercent: totalCredits > 0 ? Math.round((totalDebits / totalCredits) * 100) : 0,
            };
          });
          setUsageData(transformed);
        }

        // Process settings data
        if (settingsData.success && settingsData.settings) {
          setCreditSettings({
            credits_per_image_generation: settingsData.settings.credits_per_image_generation ?? 2,
            credits_per_regeneration: settingsData.settings.credits_per_regeneration ?? 1,
            default_image_model_name: settingsData.settings.default_image_model_name || 'gemini-3-pro-image-preview',
            credit_reminder_threshold_1: settingsData.settings.credit_reminder_threshold_1 ?? 20,
            credit_reminder_threshold_2: settingsData.settings.credit_reminder_threshold_2 ?? 10,
          });
        }
        setError(null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error.message || 'Failed to load credits usage data. Please try again.');
        setUsageData([]);
      } finally {
        setLoading(false);
        setSettingsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await creditsAPI.updateSettings(creditSettings);
      if (response.success) {
        alert('Credit settings updated successfully!');
        setShowSettingsModal(false);
      } else {
        alert('Failed to update credit settings: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update credit settings:', error);
      alert('Failed to update credit settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Mock data fallback
  const mockUsageData = [
    { organization: 'Acme Corp', organizationId: 'org-1', creditsUsed: 8500, creditsRemaining: 1500, totalCredits: 10000, usagePercent: 85 },
    { organization: 'Tech Solutions', organizationId: 'org-2', creditsUsed: 3200, creditsRemaining: 1800, totalCredits: 5000, usagePercent: 64 },
    { organization: 'Creative Studio', organizationId: 'org-3', creditsUsed: 12000, creditsRemaining: 3000, totalCredits: 15000, usagePercent: 80 },
    { organization: 'Design Co', organizationId: 'org-4', creditsUsed: 4500, creditsRemaining: 500, totalCredits: 5000, usagePercent: 90 },
  ];

  // Fetch usage statistics for chart
  useEffect(() => {
    const fetchUsageStatistics = async () => {
      setChartLoading(true);
      try {
        const periodCount = timeRange === 'month' ? 6 : timeRange === 'week' ? 8 : 7;
        const response = await creditsAPI.getUsageStatistics(timeRange, periodCount);
        if (response.success && response.data) {
          // Transform data for chart
          const transformed = response.data.map(item => ({
            month: item.period,
            credits: item.total,
            debit: item.debit,
            credit: item.credit
          }));
          setMonthlyUsage(transformed);
        } else {
          // Fallback to empty data
          setMonthlyUsage([]);
        }
      } catch (error) {
        console.error('Failed to fetch usage statistics:', error);
        setMonthlyUsage([]);
      } finally {
        setChartLoading(false);
      }
    };
    
    fetchUsageStatistics();
  }, [timeRange]);

  const displayData = usageData.length > 0 ? usageData : mockUsageData;
  const totalCreditsUsed = displayData.reduce((sum, org) => sum + org.creditsUsed, 0);
  const totalCreditsRemaining = displayData.reduce((sum, org) => sum + org.creditsRemaining, 0);
  const totalCredits = displayData.reduce((sum, org) => sum + org.totalCredits, 0);
  const averageUsage = displayData.length > 0 ? Math.round(totalCreditsUsed / displayData.length) : 0;

  // Fetch transaction history for selected organization
  const fetchTransactionHistory = async (orgId, filters = {}) => {
    setHistoryLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.change_type && filters.change_type !== 'all') params.change_type = filters.change_type;

      const data = await creditsAPI.getOrganizationUsage(orgId, params);
      if (data.usage_data) {
        setTransactionHistory(data.usage_data);
      } else {
        setTransactionHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      setTransactionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle organization click
  const handleOrganizationClick = async (org) => {
    setSelectedOrg(org);
    setShowHistoryModal(true);
    const filters = {
      start_date: dateFilters.start_date ? `${dateFilters.start_date}T00:00:00Z` : '',
      end_date: dateFilters.end_date ? `${dateFilters.end_date}T23:59:59Z` : '',
      change_type: typeFilter
    };
    await fetchTransactionHistory(org.organizationId, filters);
  };

  // Handle filter changes - use useEffect to trigger when filters change
  useEffect(() => {
    if (selectedOrg && showHistoryModal) {
      const timeoutId = setTimeout(() => {
        const filters = {
          start_date: dateFilters.start_date ? `${dateFilters.start_date}T00:00:00Z` : '',
          end_date: dateFilters.end_date ? `${dateFilters.end_date}T23:59:59Z` : '',
          change_type: typeFilter
        };
        fetchTransactionHistory(selectedOrg.organizationId, filters);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilters.start_date, dateFilters.end_date, typeFilter, selectedOrg, showHistoryModal]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading credits usage...</div>
          </div>
        </div>
      </>
    );
  }

  if (error && usageData.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold">Error Loading Data</div>
            <div className="text-gray-600 dark:text-gray-400">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
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
              Credits Usage
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Monitor and analyze credits consumption across all organizations
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <Filter size={18} />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Credits Used</p>
              <Coins className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalCreditsUsed.toLocaleString()}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {((totalCreditsUsed / totalCredits) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Average Usage</p>
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{averageUsage.toLocaleString()}</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Per organization</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Remaining Credits</p>
              <TrendingDown className="text-yellow-600 dark:text-yellow-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{totalCreditsRemaining.toLocaleString()}</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              {((totalCreditsRemaining / totalCredits) * 100).toFixed(1)}% remaining
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Total Allocated</p>
              <Zap className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalCredits.toLocaleString()}</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Across all orgs</p>
          </div>
        </div>

        {/* Credit Deduction Settings and Monthly Usage Chart - Side by Side */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Credit Deduction Settings - 30% */}
          <div className="w-full lg:w-[30%] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex flex-col mb-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Settings className="text-blue-600 dark:text-blue-400" size={20} />
                  Credit Deduction Settings
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Configure credit deduction values
                </p>
              </div>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full"
              >
                <Settings size={16} />
                Edit Settings
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-blue-600 dark:text-blue-400" size={18} />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Per Image Generation</p>
                </div>
                {settingsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {creditSettings.credits_per_image_generation}{creditSettings.credits_per_image_generation > 1 ? ' Credits' : ' Credit'}
                  </p>
                )}
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Deducted for each new image generation
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-purple-600 dark:text-purple-400" size={18} />
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Per Regeneration</p>
                </div>
                {settingsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                ) : (
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {creditSettings.credits_per_regeneration}{creditSettings.credits_per_regeneration > 1 ? ' Credits' : ' Credit'}
                  </p>
                )}
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Deducted for each image regeneration
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Usage Chart - 70% */}
          <div className="w-full lg:w-[70%] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 lg:p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Monthly Credits Usage
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track credits consumption trends over time
              </p>
            </div>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {['month', 'week', 'day'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {chartLoading ? (
            <div className="flex items-center justify-center h-[350px]">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Loading chart data...</div>
              </div>
            </div>
          ) : monthlyUsage.length === 0 ? (
            <div className="flex items-center justify-center h-[350px]">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">No usage data available for the selected period</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyUsage}>
                <defs>
                  <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Legend />
                <Area type="monotone" dataKey="debit" stackId="1" stroke="#ef4444" fill="url(#colorDebit)" name="Debits" />
                <Area type="monotone" dataKey="credit" stackId="1" stroke="#10b981" fill="url(#colorCredit)" name="Credits" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          </div>
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings size={24} />
                  Edit Credit & Model Settings
                </h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credits per Image Generation *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={creditSettings.credits_per_image_generation}
                    onChange={(e) => setCreditSettings({
                      ...creditSettings,
                      credits_per_image_generation: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of credits deducted for each new image generation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credits per Regeneration *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={creditSettings.credits_per_regeneration}
                    onChange={(e) => setCreditSettings({
                      ...creditSettings,
                      credits_per_regeneration: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of credits deducted for each image regeneration
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Model for Image Generation
                  </label>
                  <select
                    value={creditSettings.default_image_model_name}
                    onChange={(e) => setCreditSettings({
                      ...creditSettings,
                      default_image_model_name: e.target.value,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="gemini-3-pro-image-preview">
                      Gemini 3 Pro (Image Preview)
                    </option>
                    <option value="gemini-2.5-flash-image">
                      Gemini 2.5 Flash (Image)
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Global Gemini model used for background removal, model shots, and campaign images.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credit reminder threshold 1
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={creditSettings.credit_reminder_threshold_1 ?? 20}
                    onChange={(e) => setCreditSettings({
                      ...creditSettings,
                      credit_reminder_threshold_1: parseInt(e.target.value, 10) || 0,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Send &quot;credits running low&quot; email when balance is at or below this (e.g. 20).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credit reminder threshold 2
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={creditSettings.credit_reminder_threshold_2 ?? 10}
                    onChange={(e) => setCreditSettings({
                      ...creditSettings,
                      credit_reminder_threshold_2: parseInt(e.target.value, 10) || 0,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Second reminder when balance is at or below this (e.g. 10).
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Usage Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Activity className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Credits Usage by Organization
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Detailed breakdown of credits consumption per organization
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Credits Used
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Credits Remaining
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Total Credits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Usage %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {displayData.map((org, index) => {
                  const usagePercent = ((org.creditsUsed / org.totalCredits) * 100).toFixed(1);
                  const isHighUsage = usagePercent > 80;
                  const isMediumUsage = usagePercent > 50 && usagePercent <= 80;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => handleOrganizationClick(org)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Coins className="text-blue-600 dark:text-blue-400" size={18} />
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {org.organization}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {org.creditsUsed.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {org.creditsRemaining.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {org.totalCredits.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 min-w-[100px]">
                            <div
                              className={`h-2.5 rounded-full transition-all ${isHighUsage ? 'bg-green-500' : isMediumUsage ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold w-14 text-right ${isHighUsage ? 'text-green-600 dark:text-green-400' :
                              isMediumUsage ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }`}>
                            {usagePercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${isHighUsage
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                              : isMediumUsage
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            }`}
                        >
                          {isHighUsage ? 'high' : isMediumUsage ? 'medium' : 'low'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction History Modal */}
      {showHistoryModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Credit Transaction History
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedOrg.organization}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedOrg(null);
                  setTransactionHistory([]);
                  setDateFilters({ start_date: '', end_date: '' });
                  setTypeFilter('all');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateFilters.start_date}
                    onChange={(e) => {
                      setDateFilters({ ...dateFilters, start_date: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateFilters.end_date}
                    onChange={(e) => {
                      setDateFilters({ ...dateFilters, end_date: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="flex-1 overflow-auto p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-gray-500 dark:text-gray-400">Loading transaction history...</div>
                  </div>
                </div>
              ) : transactionHistory.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Coins className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Balance After
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {transactionHistory.map((transaction, index) => {
                        const isDebit = transaction.change_type === 'debit';
                        const amount = isDebit ? -Math.abs(transaction.credits_changed) : Math.abs(transaction.credits_changed);
                        return (
                          <tr key={transaction.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-6 h-4 rounded ${isDebit
                                    ? 'bg-red-100 dark:bg-red-900/30'
                                    : 'bg-green-100 dark:bg-green-900/30'
                                  } flex items-center justify-center`}>
                                  <div className={`w-3 h-0.5 ${isDebit
                                      ? 'bg-red-600 dark:bg-red-400'
                                      : 'bg-green-600 dark:bg-green-400'
                                    }`}></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-sm font-semibold ${isDebit
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                                }`}>
                                {amount}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.balance_after}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {transaction.reason || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

