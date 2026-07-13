'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Eye,
  CreditCard,
  Receipt,
  Settings2,
} from 'lucide-react';
import { pricingAPI, paymentAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

const EMPTY_PLAN = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  price_display: '',
  currency: 'INR',
  billing_cycle: 'monthly',
  credits_per_month: 100,
  credits_label: '',
  images_note: '',
  features: [''],
  is_active: true,
  is_popular: false,
  badge_text: '',
  icon: 'diamond',
  cta_text: 'Get Started',
  cta_variant: 'outline',
  cta_href: '',
  sort_order: 0,
  razorpay_enabled: true,
};

const ICON_OPTIONS = [
  { value: 'sparkles', label: 'Sparkles (Free)' },
  { value: 'diamond', label: 'Diamond (Starter)' },
  { value: 'trending-up', label: 'Trending Up (Growth)' },
  { value: 'growth', label: 'Growth (legacy)' },
  { value: 'crown', label: 'Crown (Custom)' },
];

const TABS = [
  { id: 'plans', label: 'Pricing Cards', icon: CreditCard },
  { id: 'gst', label: 'GST Settings', icon: Settings2 },
  { id: 'billing', label: 'Billing History', icon: Receipt },
];

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="col-span-2 text-gray-900 dark:text-white break-words">{String(value)}</span>
    </div>
  );
}

export default function PricingAdminPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [taxConfig, setTaxConfig] = useState({
    tax_rate: 18,
    cgst_rate: 9,
    sgst_rate: 9,
    home_state: 'Telangana',
    gst_enabled_countries: ['India'],
    pricing_footer_note: '',
  });
  const [footerNote, setFooterNote] = useState('');
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PLAN);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPricing = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pricingAPI.getAll();
      if (res.success) {
        setPlans(res.plans || []);
        if (res.tax_config) setTaxConfig((prev) => ({ ...prev, ...res.tax_config }));
        setFooterNote(res.footer_note || '');
        setTaxConfig((prev) => ({
          ...prev,
          pricing_footer_note: res.footer_note || prev.pricing_footer_note,
        }));
      }
    } catch (e) {
      setError('Failed to load pricing plans.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await paymentAPI.getAll();
      if (res.success && res.transactions) {
        setPayments(res.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  useEffect(() => {
    if (activeTab === 'billing') loadPayments();
  }, [activeTab]);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({ ...EMPTY_PLAN, features: [''] });
    setShowPlanModal(true);
  };

  const openEdit = (plan) => {
    const slug = String(plan.slug || plan.id || '').toLowerCase();
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      slug: plan.slug || plan.id || '',
      description: plan.description || '',
      price: plan.price || 0,
      price_display: plan.priceDisplay || '',
      currency: plan.currency || 'INR',
      billing_cycle: plan.billingCycle === 'month' ? 'monthly' : plan.billingCycle || 'monthly',
      credits_per_month: plan.creditsNumeric || parseInt(plan.credits, 10) || 0,
      credits_label: plan.creditsLabel && plan.creditsLabel !== 'Credits' ? plan.creditsLabel : '',
      images_note: plan.imagesNote || '',
      features: plan.features?.length ? plan.features : [''],
      is_active: plan.is_active !== false,
      is_popular: !!plan.featured,
      badge_text: plan.badge || '',
      icon: plan.icon || (slug === 'free' ? 'sparkles' : 'diamond'),
      cta_text: plan.cta || 'Get Started',
      cta_variant: plan.ctaVariant || 'outline',
      cta_href: plan.ctaHref || '',
      sort_order: plan.sort_order || 0,
      razorpay_enabled: plan.razorpay_enabled !== false,
    });
    setShowPlanModal(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        features: formData.features.filter((f) => f && f.trim()),
        price_display: formData.price_display || null,
        cta_href: formData.cta_href || null,
        badge_text: formData.badge_text || null,
        credits_label: formData.credits_label || null,
      };
      if (editingPlan?.db_id) {
        await pricingAPI.update(editingPlan.db_id, payload);
      } else {
        await pricingAPI.create(payload);
      }
      setShowPlanModal(false);
      await loadPricing();
    } catch (e) {
      setError(e.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    const slug = String(plan.slug || plan.id || '').toLowerCase();
    if (slug === 'free') {
      setError('The Free plan cannot be deleted. You can edit its content instead.');
      return;
    }
    if (!confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await pricingAPI.delete(plan.db_id);
      await loadPricing();
    } catch (e) {
      setError('Failed to delete plan.');
    }
  };

  const handleTaxSave = async () => {
    setSaving(true);
    setError('');
    try {
      await pricingAPI.updateTaxConfig({
        ...taxConfig,
        pricing_footer_note: footerNote,
      });
      await loadPricing();
    } catch (e) {
      setError('Failed to save GST settings.');
    } finally {
      setSaving(false);
    }
  };

  const openPaymentDetail = async (payment) => {
    setSelectedPayment(payment);
    setPaymentDetail(null);
    setDetailLoading(true);
    try {
      const res = await paymentAPI.getById(payment.id);
      if (res.success) setPaymentDetail(res.transaction);
      else setPaymentDetail(payment);
    } catch {
      setPaymentDetail(payment);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateFeature = (index, value) => {
    const next = [...formData.features];
    next[index] = value;
    setFormData({ ...formData, features: next });
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (index) => {
    const next = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: next.length ? next : [''] });
  };

  if (loading && activeTab === 'plans') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Billing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage pricing cards, GST settings, and view billing transactions.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Pricing Card
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const slug = String(plan.slug || plan.id || '').toLowerCase();
              return (
              <div
                key={plan.db_id || plan.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500">slug: {plan.slug || plan.id}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {slug === 'free' && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Free tier
                      </span>
                    )}
                    {plan.featured && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{plan.description}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {plan.priceDisplay || (plan.price != null ? `₹${(plan.price || 0).toLocaleString('en-IN')}` : '—')}
                </p>
                <p className="text-sm text-gray-500 mb-3">{plan.credits} · {plan.cta}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(plan)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  {slug !== 'free' && (
                    <Button variant="outline" size="sm" onClick={() => handleDelete(plan)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {activeTab === 'gst' && (
        <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These settings apply to all pricing pages and checkout tax calculations.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium">GST Rate (%)</span>
              <input
                type="number"
                step="0.01"
                value={taxConfig.tax_rate}
                onChange={(e) => setTaxConfig({ ...taxConfig, tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Home State (CGST+SGST)</span>
              <input
                type="text"
                value={taxConfig.home_state}
                onChange={(e) => setTaxConfig({ ...taxConfig, home_state: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">CGST Rate (%)</span>
              <input
                type="number"
                step="0.01"
                value={taxConfig.cgst_rate}
                onChange={(e) => setTaxConfig({ ...taxConfig, cgst_rate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">SGST Rate (%)</span>
              <input
                type="number"
                step="0.01"
                value={taxConfig.sgst_rate}
                onChange={(e) => setTaxConfig({ ...taxConfig, sgst_rate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium">GST applies for countries (comma-separated)</span>
            <input
              type="text"
              value={(taxConfig.gst_enabled_countries || []).join(', ')}
              onChange={(e) =>
                setTaxConfig({
                  ...taxConfig,
                  gst_enabled_countries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Pricing footer note</span>
            <input
              type="text"
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            />
          </label>
          <Button onClick={handleTaxSave} disabled={saving} className="flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save GST Settings
          </Button>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {paymentsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div>{p.user_name || p.organization_name}</div>
                        <div className="text-xs text-gray-500">{p.user_email}</div>
                      </td>
                      <td className="px-4 py-3">{p.plan_name || p.plan_slug || '—'}</td>
                      <td className="px-4 py-3">
                        ₹{(p.total_amount ?? p.amount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 capitalize">{p.status}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" onClick={() => openPaymentDetail(p)}>
                          <Eye className="w-4 h-4 mr-1" /> Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!payments.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        No billing transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingPlan ? 'Edit' : 'Create'} Pricing Card</h2>
              <button type="button" onClick={() => setShowPlanModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-sm font-medium">Name</span>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Slug</span>
                  <input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1 col-span-2">
                  <span className="text-sm font-medium">Description</span>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" rows={2} />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Price (INR)</span>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Price display (e.g. Free, Custom)</span>
                  <input value={formData.price_display} onChange={(e) => setFormData({ ...formData, price_display: e.target.value })} placeholder="Free / Custom Pricing" className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Billing cycle</span>
                  <select value={formData.billing_cycle} onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Credits</span>
                  <input type="number" value={formData.credits_per_month} onChange={(e) => setFormData({ ...formData, credits_per_month: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Credits label (e.g. 400+ or Credits)</span>
                  <input value={formData.credits_label} onChange={(e) => setFormData({ ...formData, credits_label: e.target.value })} placeholder="400+ or leave blank for Credits" className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1 col-span-2">
                  <span className="text-sm font-medium">Images note</span>
                  <input value={formData.images_note} onChange={(e) => setFormData({ ...formData, images_note: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">CTA text</span>
                  <input value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">CTA style</span>
                  <select value={formData.cta_variant} onChange={(e) => setFormData({ ...formData, cta_variant: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                    <option value="outline">Outline</option>
                    <option value="solid">Solid (gold)</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">CTA link</span>
                  <input value={formData.cta_href} onChange={(e) => setFormData({ ...formData, cta_href: e.target.value })} placeholder="/signup or /contact" className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Card icon</span>
                  <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Badge</span>
                  <input value={formData.badge_text} onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })} placeholder="MOST POPULAR" className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Sort order</span>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Features</span>
                  <button type="button" onClick={addFeature} className="text-xs text-blue-600">+ Add</button>
                </div>
                {formData.features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={f} onChange={(e) => updateFeature(i, e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                    <button type="button" onClick={() => removeFeature(i)} className="text-red-500 text-sm px-2">×</button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_popular} onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })} />
                  Most popular
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.razorpay_enabled} onChange={(e) => setFormData({ ...formData, razorpay_enabled: e.target.checked })} />
                  Razorpay enabled
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPlanModal(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Billing Details</h2>
              <button type="button" onClick={() => { setSelectedPayment(null); setPaymentDetail(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : paymentDetail && (
              <div>
                <DetailRow label="Status" value={paymentDetail.status} />
                <DetailRow label="Customer" value={paymentDetail.user_name} />
                <DetailRow label="Email" value={paymentDetail.user_email} />
                <DetailRow label="Organization" value={paymentDetail.organization_name} />
                <DetailRow label="Plan" value={paymentDetail.plan_name || paymentDetail.plan_slug} />
                <DetailRow label="Credits" value={paymentDetail.credits} />
                <DetailRow label="Base amount" value={paymentDetail.amount != null ? `₹${paymentDetail.amount}` : null} />
                <DetailRow label="GST" value={paymentDetail.tax_rate != null ? `${paymentDetail.tax_rate}% (₹${paymentDetail.tax_amount})` : null} />
                <DetailRow label="CGST" value={paymentDetail.cgst_amount ? `₹${paymentDetail.cgst_amount}` : null} />
                <DetailRow label="SGST" value={paymentDetail.sgst_amount ? `₹${paymentDetail.sgst_amount}` : null} />
                <DetailRow label="Total" value={paymentDetail.total_amount != null ? `₹${paymentDetail.total_amount}` : null} />
                <DetailRow label="Billing name" value={paymentDetail.billing_name} />
                <DetailRow label="Billing email" value={paymentDetail.billing_email} />
                <DetailRow label="Phone" value={paymentDetail.billing_phone} />
                <DetailRow label="GST number" value={paymentDetail.billing_gst_number} />
                <DetailRow label="Address" value={paymentDetail.billing_address_line1} />
                <DetailRow label="City / State" value={[paymentDetail.billing_city, paymentDetail.billing_state, paymentDetail.billing_pin].filter(Boolean).join(', ')} />
                <DetailRow label="Country" value={paymentDetail.billing_country} />
                <DetailRow label="Order ID" value={paymentDetail.razorpay_order_id} />
                <DetailRow label="Payment ID" value={paymentDetail.razorpay_payment_id} />
                <DetailRow label="Date" value={paymentDetail.created_at ? new Date(paymentDetail.created_at).toLocaleString() : null} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
