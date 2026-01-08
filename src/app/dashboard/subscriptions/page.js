'use client';

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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
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
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Subscriptions</p>
              <CreditCard className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{pricingPlans.length}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{activePlans.length} active</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Monthly Revenue</p>
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">${totalRevenue}</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">From active plans</p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isActive={true} isPopular={plan.isPopular} />
            ))}
          </div>
        </div>

        {/* Inactive Plans */}
        {inactivePlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inactive Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactivePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} isActive={false} isPopular={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

