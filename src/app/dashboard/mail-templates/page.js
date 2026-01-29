'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, Edit2, ArrowRight } from 'lucide-react';
import { mailTemplatesAPI } from '@/lib/api';
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
];

export default function MailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Mail className="w-8 h-8 text-blue-600" />
          Mail Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Edit email templates for registration, password reset, and invites. Changes apply to all outgoing emails.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

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
