'use client';

import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Zap, Building2, DollarSign, Plus, Edit, X, Save, Loader2, Crown } from 'lucide-react';
import { subscriptionAPI, paymentAPI } from '@/lib/api';

const PRO_NAME = 'Pro';
const ENTERPRISE_NAME = 'Enterprise';

const DEFAULT_CREDIT_OPTIONS = [
  { amount: 50, credits: 50 },
  { amount: 100, credits: 100 },
  { amount: 300, credits: 300 },
];

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
  const [editingPlanType, setEditingPlanType] = useState(null); // 'pro' | 'enterprise'
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    features: [''],
    credit_options: [...DEFAULT_CREDIT_OPTIONS],
    amount_display: 'As you go',
    cta_text: 'Pay',
  });

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

  const proPlan = plans.find((p) => (p.name || '').toLowerCase() === 'pro');
  const enterprisePlan = plans.find((p) => (p.name || '').toLowerCase() === 'enterprise');

  const openEditPro = () => {
    setEditingPlanType('pro');
    if (proPlan) {
      const opts = proPlan.credit_options || proPlan.custom_settings?.credit_options || DEFAULT_CREDIT_OPTIONS;
      setFormData({
        name: PRO_NAME,
        description: proPlan.description || '',
        price: Array.isArray(opts) && opts[0] ? opts[0].amount : 50,
        currency: proPlan.currency || 'USD',
        features: (proPlan.features && proPlan.features.length) ? proPlan.features : [''],
        credit_options: Array.isArray(opts) && opts.length ? opts : [...DEFAULT_CREDIT_OPTIONS],
        amount_display: 'As you go',
        cta_text: proPlan.custom_settings?.cta_text || proPlan.cta_text || 'Pay',
      });
      setEditingPlan(proPlan);
    } else {
      setFormData({
        name: PRO_NAME,
        description: 'Professional plan with flexible credits.',
        price: 50,
        currency: 'USD',
        features: [''],
        credit_options: [...DEFAULT_CREDIT_OPTIONS],
        amount_display: 'As you go',
        cta_text: 'Pay',
      });
      setEditingPlan(null);
    }
    setShowModal(true);
  };

  const openEditEnterprise = () => {
    setEditingPlanType('enterprise');
    if (enterprisePlan) {
      const cs = enterprisePlan.custom_settings || {};
      setFormData({
        name: ENTERPRISE_NAME,
        description: enterprisePlan.description || '',
        price: 0,
        currency: enterprisePlan.currency || 'USD',
        features: (enterprisePlan.features && enterprisePlan.features.length) ? enterprisePlan.features : [''],
        credit_options: [],
        amount_display: cs.amount_display || 'As you go',
        cta_text: cs.cta_text || 'Contact Sales',
      });
      setEditingPlan(enterprisePlan);
    } else {
      setFormData({
        name: ENTERPRISE_NAME,
        description: 'Custom enterprise solutions.',
        price: 0,
        currency: 'USD',
        features: [''],
        credit_options: [],
        amount_display: 'As you go',
        cta_text: 'Contact Sales',
      });
      setEditingPlan(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isPro = editingPlanType === 'pro';
      const custom_settings = {
        cta_text: formData.cta_text,
      };
      if (isPro) {
        custom_settings.credit_options = formData.credit_options.filter((o) => o && (o.amount != null || o.credits != null));
      } else {
        custom_settings.amount_display = formData.amount_display;
      }

      const price = isPro && formData.credit_options.length
        ? formData.credit_options[0].amount
        : 0;

      const submitData = {
        name: formData.name,
        description: formData.description,
        price: Number(price),
        currency: formData.currency,
        billing_cycle: 'monthly',
        credits_per_month: isPro && formData.credit_options[0] ? formData.credit_options[0].credits : 0,
        max_projects: 999,
        ai_features_enabled: true,
        features: formData.features.filter((f) => f.trim() !== ''),
        is_active: true,
        is_popular: isPro,
        custom_settings,
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
      alert(`Failed to save plan. Please try again.`);
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

  const handleCreditOptionChange = (index, field, value) => {
    const opts = [...(formData.credit_options || [])];
    if (!opts[index]) opts[index] = { amount: 0, credits: 0 };
    opts[index][field] = field === 'amount' || field === 'credits' ? Number(value) : value;
    setFormData({ ...formData, credit_options: opts });
  };

  const addCreditOption = () => {
    setFormData({
      ...formData,
      credit_options: [...(formData.credit_options || []), { amount: 100, credits: 100 }],
    });
  };

  const removeCreditOption = (index) => {
    const opts = formData.credit_options.filter((_, i) => i !== index);
    setFormData({ ...formData, credit_options: opts.length ? opts : [...DEFAULT_CREDIT_OPTIONS] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Pricing Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Edit Pro and Enterprise plan content shown across the portal
            </p>
          </div>
        </div>

        {/* Revenue summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Monthly Revenue</p>
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            {revenueLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-green-600 dark:text-green-400" />
            ) : (
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                ${revenueData.monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
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
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                ${revenueData.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>

        {/* Two plan cards only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          {/* Pro Plan Card */}
          <div className="relative rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Crown className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pro Plan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {proPlan?.description || 'Professional plan with flexible credits'}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(proPlan?.credit_options?.[0]?.amount ?? proPlan?.price ?? 50)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">starting</span>
            </div>
            {proPlan?.features?.length > 0 && (
              <ul className="space-y-2 mb-6">
                {proPlan.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-600">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={openEditPro}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Edit size={18} />
              {proPlan ? 'Edit Pro Plan' : 'Add Pro Plan'}
            </button>
          </div>

          {/* Enterprise Plan Card */}
          <div className="relative rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Plan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {enterprisePlan?.description || 'Custom enterprise solutions'}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {enterprisePlan?.custom_settings?.amount_display ?? 'As you go'}
              </span>
            </div>
            {enterprisePlan?.features?.length > 0 && (
              <ul className="space-y-2 mb-6">
                {enterprisePlan.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-purple-600">✓</span> {f}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={openEditEnterprise}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Edit size={18} />
              {enterprisePlan ? 'Edit Enterprise Plan' : 'Add Enterprise Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPlan ? `Edit ${formData.name} Plan` : `Add ${formData.name} Plan`}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Plan description shown on the card"
                />
              </div>

              {editingPlanType === 'pro' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credit options (amount → credits)</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Users choose one; amount updates accordingly. e.g. $50 - 50 credits</p>
                    {(formData.credit_options || []).map((opt, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={opt.amount ?? ''}
                          onChange={(e) => handleCreditOptionChange(index, 'amount', e.target.value)}
                          placeholder="Amount ($)"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="self-center text-gray-500">-</span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={opt.credits ?? ''}
                          onChange={(e) => handleCreditOptionChange(index, 'credits', e.target.value)}
                          placeholder="Credits"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button type="button" onClick={() => removeCreditOption(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addCreditOption} className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                      + Add option
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button text</label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Pay"
                    />
                  </div>
                </>
              )}

              {editingPlanType === 'enterprise' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount display text</label>
                    <input
                      type="text"
                      value={formData.amount_display}
                      onChange={(e) => setFormData({ ...formData, amount_display: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="As you go"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button text</label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Contact Sales"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features (one per line)</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="Feature"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button type="button" onClick={() => removeFeature(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addFeature} className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                  + Add feature
                </button>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Save size={18} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
