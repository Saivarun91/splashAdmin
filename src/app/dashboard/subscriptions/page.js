'use client';

<<<<<<< HEAD
import { CreditCard, TrendingUp, Zap, Building2, Download } from 'lucide-react';
import { PlanCard } from '@/components/subscriptions/PlanCard';

export default function SubscriptionsPage() {

  // Mock data - Replace with actual API call
  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchSubscriptions = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await subscriptionAPI.getAll();
  //       setSubscriptions(data);
  //     } catch (error) {
  //       console.error('Failed to fetch subscriptions:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchSubscriptions();
  // }, []);

  // Mock pricing plans - Based on Plan model from splash_backend
  const pricingPlans = [
    {
      id: 'premium',
      name: 'Premium',
      description: 'Advanced features for large teams',
      price: 99,
      originalPrice: 129,
      billingCycle: 'monthly',
      credits_per_month: 10000,
      max_projects: 50,
      ai_features_enabled: true,
      features: [
        'Unlimited image generations',
        'Priority support',
        'Advanced AI models',
        'Custom integrations',
        'Team collaboration tools',
        'Analytics dashboard'
      ],
      isActive: true,
      isPopular: true,
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Perfect for growing businesses',
      price: 49,
      billingCycle: 'monthly',
      credits_per_month: 5000,
      max_projects: 20,
      ai_features_enabled: true,
      features: [
        'Standard image generations',
        'Email support',
        'Standard AI models',
        'Basic integrations',
        'Team collaboration',
        'Usage analytics'
      ],
      isActive: true,
      isPopular: false,
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential features for small teams',
      price: 29,
      billingCycle: 'monthly',
      credits_per_month: 2000,
      max_projects: 10,
      ai_features_enabled: true,
      features: [
        'Limited image generations',
        'Community support',
        'Basic AI models',
        'Standard features'
      ],
      isActive: true,
      isPopular: false,
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Entry-level plan for individuals',
      price: 15,
      billingCycle: 'monthly',
      credits_per_month: 1000,
      max_projects: 5,
      ai_features_enabled: false,
      features: [
        'Basic image generations',
        'Community support',
        'Limited features'
      ],
      isActive: false,
      isPopular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for enterprises',
      price: 299,
      billingCycle: 'monthly',
      credits_per_month: 50000,
      max_projects: 200,
      ai_features_enabled: true,
      features: [
        'Unlimited everything',
        'Dedicated support',
        'Custom AI models',
        'White-label options',
        'SLA guarantee',
        'Custom integrations'
      ],
      isActive: false,
      isPopular: false,
    },
  ];

  const activePlans = pricingPlans.filter(plan => plan.isActive);
  const inactivePlans = pricingPlans.filter(plan => !plan.isActive);
  const totalRevenue = activePlans.reduce((sum, plan) => sum + plan.price, 0);
  const totalCredits = activePlans.reduce((sum, plan) => sum + plan.credits_per_month, 0);
=======
import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Zap, Building2, Download, Plus, Edit, Trash2, X, Save, DollarSign, Loader2 } from 'lucide-react';
import { PlanCard } from '@/components/subscriptions/PlanCard';
import { subscriptionAPI, paymentAPI } from '@/lib/api';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    monthly_revenue: 0,
    total_revenue: 0,
    growth_percentage: 0,
    monthly_transactions: 0,
    total_transactions: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    currency: 'USD',
    billing_cycle: 'monthly',
    credits_per_month: 1000,
    max_projects: 10,
    ai_features_enabled: true,
    features: [''],
    is_active: true,
    is_popular: false,
  });

  // Fetch plans and revenue from API
  useEffect(() => {
    fetchPlans();
    fetchRevenueStats();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await subscriptionAPI.getAll();
      if (response.success && response.plans) {
        setPlans(response.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async () => {
    setRevenueLoading(true);
    try {
      const response = await paymentAPI.getRevenue();
      if (response.success) {
        setRevenueData({
          monthly_revenue: response.monthly_revenue || 0,
          total_revenue: response.total_revenue || 0,
          growth_percentage: response.growth_percentage || 0,
          monthly_transactions: response.monthly_transactions || 0,
          total_transactions: response.total_transactions || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      currency: 'USD',
      billing_cycle: 'monthly',
      credits_per_month: 1000,
      max_projects: 10,
      ai_features_enabled: true,
      features: [''],
      is_active: true,
      is_popular: false,
    });
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || '',
      original_price: plan.original_price || '',
      currency: plan.currency || 'USD',
      billing_cycle: plan.billing_cycle || 'monthly',
      credits_per_month: plan.credits_per_month || 1000,
      max_projects: plan.max_projects || 10,
      ai_features_enabled: plan.ai_features_enabled !== undefined ? plan.ai_features_enabled : true,
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      is_popular: plan.is_popular || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      await subscriptionAPI.delete(planId);
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        credits_per_month: parseInt(formData.credits_per_month),
        max_projects: parseInt(formData.max_projects),
        features: formData.features.filter(f => f.trim() !== ''),
      };

      if (editingPlan) {
        await subscriptionAPI.update(editingPlan.id, submitData);
      } else {
        await subscriptionAPI.create(submitData);
      }
      
      setShowModal(false);
      fetchPlans();
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert(`Failed to ${editingPlan ? 'update' : 'create'} plan. Please try again.`);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] });
  };

  const activePlans = plans.filter(plan => plan.is_active);
  const inactivePlans = plans.filter(plan => !plan.is_active);
  const totalCredits = activePlans.reduce((sum, plan) => sum + (plan.credits_per_month || 0), 0);

  // Transform plan data for PlanCard component
  const transformPlanForCard = (plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    originalPrice: plan.original_price,
    currency: plan.currency || 'USD',
    billingCycle: plan.billing_cycle,
    credits_per_month: plan.credits_per_month,
    max_projects: plan.max_projects,
    ai_features_enabled: plan.ai_features_enabled,
    features: plan.features || [],
    isActive: plan.is_active,
    isPopular: plan.is_popular,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
>>>>>>> feature-admin

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
<<<<<<< HEAD
              Subscriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Manage organization subscriptions and billing plans
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <Download size={18} />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium">
              <CreditCard size={18} />
              New Subscription
=======
              Plan Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Create and manage subscription plans
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Plus size={18} />
              Create Plan
>>>>>>> feature-admin
            </button>
          </div>
        </div>

        {/* Summary Cards */}
<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Subscriptions</p>
              <CreditCard className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{pricingPlans.length}</p>
=======
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Plans</p>
              <CreditCard className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{plans.length}</p>
>>>>>>> feature-admin
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{activePlans.length} active</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Monthly Revenue</p>
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
<<<<<<< HEAD
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">${totalRevenue}</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">From active plans</p>
=======
            {revenueLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
            ) : (
              <>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  ₹{revenueData.monthly_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {revenueData.monthly_transactions} transactions
                  </p>
                  {revenueData.growth_percentage !== 0 && (
                    <span className={`text-xs font-medium ${
                      revenueData.growth_percentage > 0 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {revenueData.growth_percentage > 0 ? '↑' : '↓'} {Math.abs(revenueData.growth_percentage).toFixed(1)}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Total Revenue</p>
              <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            {revenueLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            ) : (
              <>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  ₹{revenueData.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {revenueData.total_transactions} total transactions
                </p>
              </>
            )}
>>>>>>> feature-admin
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Total Credits</p>
              <Zap className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalCredits.toLocaleString()}</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Allocated</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Active Plans</p>
              <Building2 className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{activePlans.length}</p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Currently active</p>
          </div>
        </div>

        {/* Active Plans */}
        <div>
<<<<<<< HEAD
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isActive={true} isPopular={plan.isPopular} />
            ))}
          </div>
=======
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Pricing Plans</h2>
          </div>
          {activePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {activePlans.map((plan) => (
                <div key={plan.id} className="relative">
                  <PlanCard plan={transformPlanForCard(plan)} isActive={true} isPopular={plan.is_popular} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No active plans. Create your first plan to get started.</p>
            </div>
          )}
>>>>>>> feature-admin
        </div>

        {/* Inactive Plans */}
        {inactivePlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inactive Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactivePlans.map((plan) => (
<<<<<<< HEAD
                <PlanCard key={plan.id} plan={plan} isActive={false} isPopular={false} />
=======
                <div key={plan.id} className="relative">
                  <PlanCard plan={transformPlanForCard(plan)} isActive={false} isPopular={false} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
>>>>>>> feature-admin
              ))}
            </div>
          </div>
        )}
      </div>
<<<<<<< HEAD
    </>
  );
}

=======

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ({formData.currency === 'USD' ? '$' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price ({formData.currency === 'USD' ? '$' : '₹'}) (Optional - for discounts)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Cycle *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billing_cycle"
                        value="monthly"
                        checked={formData.billing_cycle === 'monthly'}
                        onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Monthly</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billing_cycle"
                        value="yearly"
                        checked={formData.billing_cycle === 'yearly'}
                        onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Annual</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credits per Month *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.credits_per_month}
                    onChange={(e) => setFormData({ ...formData, credits_per_month: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Projects *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.max_projects}
                    onChange={(e) => setFormData({ ...formData, max_projects: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="Enter feature"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  + Add Feature
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ai_features_enabled}
                    onChange={(e) => setFormData({ ...formData, ai_features_enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI Features Enabled</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mark as Popular</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
>>>>>>> feature-admin
