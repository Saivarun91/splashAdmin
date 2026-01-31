'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, Edit2, ArrowRight, Settings, Save } from 'lucide-react';
import { mailTemplatesAPI, creditsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TEMPLATE_ORDER = [
  'registration_user',
  'registration_admin',
  'forgot_password',
  'invite_organization_user',
  'invite_organization_organizer',
  'invite_project_user',
  'invite_project_organizer',
  'payment_success_user',
  'payment_success_admin',
  'credits_recharge_reminder',
];

export default function MailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Credit reminder thresholds (admin control)
  const [threshold1, setThreshold1] = useState(20);
  const [threshold2, setThreshold2] = useState(10);
  const [thresholdsLoading, setThresholdsLoading] = useState(false);
  const [thresholdsSaving, setThresholdsSaving] = useState(false);
  const [thresholdsError, setThresholdsError] = useState(null);
  const [thresholdsSuccess, setThresholdsSuccess] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchCreditThresholds();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mailTemplatesAPI.getAll();
      if (res?.success && Array.isArray(res.templates)) {
        const ordered = TEMPLATE_ORDER
          .map((slug) => res.templates.find((t) => t.slug === slug))
          .filter(Boolean);
        const rest = res.templates.filter((t) => !TEMPLATE_ORDER.includes(t.slug));
        setTemplates([...ordered, ...rest]);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Failed to fetch mail templates:', err);
      setError(err.message || 'Failed to load mail templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditThresholds = async () => {
    try {
      setThresholdsLoading(true);
      setThresholdsError(null);
      const res = await creditsAPI.getSettings();
      if (res?.success && res.settings) {
        setThreshold1(res.settings.credit_reminder_threshold_1 ?? 20);
        setThreshold2(res.settings.credit_reminder_threshold_2 ?? 10);
      }
    } catch (err) {
      console.error('Failed to fetch credit reminder thresholds:', err);
      setThresholdsError(err.message || 'Failed to load thresholds');
    } finally {
      setThresholdsLoading(false);
    }
  };

  const saveCreditThresholds = async () => {
    try {
      setThresholdsSaving(true);
      setThresholdsError(null);
      setThresholdsSuccess(false);
      const current = await creditsAPI.getSettings();
      if (!current?.success || !current.settings) {
        throw new Error('Could not load current credit settings');
      }
      const s = current.settings;
      await creditsAPI.updateSettings({
        credits_per_image_generation: s.credits_per_image_generation ?? 2,
        credits_per_regeneration: s.credits_per_regeneration ?? 1,
        default_image_model_name: s.default_image_model_name ?? 'gemini-3-pro-image-preview',
        credit_reminder_threshold_1: threshold1,
        credit_reminder_threshold_2: threshold2,
      });
      setThresholdsSuccess(true);
      setTimeout(() => setThresholdsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save credit reminder thresholds:', err);
      setThresholdsError(err.message || 'Failed to save thresholds');
    } finally {
      setThresholdsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Mail className="w-8 h-8 text-blue-600" />
          Mail Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Edit email templates for registration, password reset, invites, payment success, and credits reminder. Changes apply to all outgoing emails.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Credit reminder thresholds – admin control */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Credits recharge reminder thresholds</CardTitle>
              <CardDescription className="mt-1">
                When a user&apos;s balance is at or below these values, the &quot;Credits running low&quot; email is sent. Control threshold 1 and 2 here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {thresholdsError && (
            <p className="text-sm text-red-600 dark:text-red-400">{thresholdsError}</p>
          )}
          {thresholdsSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400">Thresholds saved successfully.</p>
          )}
          {thresholdsLoading ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Threshold 1 (e.g. 20)
                </label>
                <input
                  type="number"
                  min="0"
                  value={threshold1}
                  onChange={(e) => setThreshold1(parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Threshold 2 (e.g. 10)
                </label>
                <input
                  type="number"
                  min="0"
                  value={threshold2}
                  onChange={(e) => setThreshold2(parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Button
                onClick={saveCreditThresholds}
                disabled={thresholdsSaving}
                className="shrink-0"
              >
                {thresholdsSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save thresholds
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <Card key={t.slug} className="border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <CardDescription className="mt-1">{t.description || t.slug}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/mail-templates/${t.slug}`)}
                    className="shrink-0"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={t.subject}>
                  Subject: {t.subject}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
