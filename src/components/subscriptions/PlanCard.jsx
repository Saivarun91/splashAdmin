'use client';

import { Check, X, Zap, Building2, Sparkles, Crown } from 'lucide-react';

export function PlanCard({ plan, isActive = false, isPopular = false }) {
  const getPlanIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('premium') || nameLower.includes('pro')) {
      return <Crown className="text-yellow-500" size={24} />;
    } else if (nameLower.includes('basic')) {
      return <Zap className="text-blue-500" size={24} />;
    }
    return <Building2 className="text-purple-500" size={24} />;
  };

  const getPlanGradient = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('premium') || nameLower.includes('pro')) {
      return 'from-yellow-500 to-orange-500';
    } else if (nameLower.includes('basic')) {
      return 'from-blue-500 to-indigo-500';
    }
    return 'from-purple-500 to-pink-500';
  };

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 transition-all duration-300 transform hover:scale-105 ${
        isActive
          ? isPopular
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-2xl shadow-yellow-200/50 dark:shadow-yellow-900/30'
            : 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-xl'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
      }`}
    >
      {isPopular && isActive && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${getPlanGradient(plan.name)} ${
              !isActive ? 'opacity-50' : ''
            }`}
          >
            {getPlanIcon(plan.name)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
          </div>
        </div>
        {isActive ? (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check size={14} />
            Active
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold flex items-center gap-1">
            <X size={14} />
            Inactive
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ${plan.price}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
        </div>
        {plan.originalPrice && plan.originalPrice > plan.price && (
          <p className="text-sm text-gray-500 line-through">${plan.originalPrice}/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Zap className={`text-blue-500 ${!isActive ? 'opacity-50' : ''}`} size={18} />
          <span className={`text-gray-700 dark:text-gray-300 ${!isActive ? 'opacity-60' : ''}`}>
            <strong>{plan.credits_per_month.toLocaleString()}</strong> credits/month
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className={`text-purple-500 ${!isActive ? 'opacity-50' : ''}`} size={18} />
          <span className={`text-gray-700 dark:text-gray-300 ${!isActive ? 'opacity-60' : ''}`}>
            <strong>{plan.max_projects}</strong> max projects
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Sparkles className={`text-green-500 ${!isActive ? 'opacity-50' : ''}`} size={18} />
          <span className={`text-gray-700 dark:text-gray-300 ${!isActive ? 'opacity-60' : ''}`}>
            AI Features: {plan.ai_features_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {plan.features && plan.features.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className={`text-green-500 flex-shrink-0 ${!isActive ? 'opacity-50' : ''}`} size={16} />
                <span className={!isActive ? 'opacity-60' : ''}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isActive && (
        <button
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            isPopular
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          Manage Plan
        </button>
      )}
    </div>
  );
}

