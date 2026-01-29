'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { mailTemplatesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MailTemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', subject: '', body_plain: '', body_html: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (slug) fetchTemplate();
  }, [slug]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mailTemplatesAPI.getBySlug(slug);
      if (res?.success && res.template) {
        const t = res.template;
        setTemplate(t);
        setForm({
          name: t.name || '',
          description: t.description || '',
          subject: t.subject || '',
          body_plain: t.body_plain || '',
          body_html: t.body_html || '',
        });
      } else {
        setError('Template not found');
      }
    } catch (err) {
      console.error('Failed to fetch template:', err);
      setError(err.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await mailTemplatesAPI.update(slug, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save template:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!slug) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/mail-templates')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit mail template</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm font-mono">{slug}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">Template saved.</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : template ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Name and description (for admin reference only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Registration – Thank you (to user)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="When this email is sent"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email content</CardTitle>
              <CardDescription>Use placeholders like {"{{ user_name }}"} or {"{{ reset_link }}"} in subject and body. Optional block: {"{{# is_new_user }}"}...{"{{/ is_new_user }}"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_plain">Body (plain text)</Label>
                <Textarea
                  id="body_plain"
                  value={form.body_plain}
                  onChange={(e) => handleChange('body_plain', e.target.value)}
                  placeholder="Plain text body..."
                  rows={14}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_html">Body (HTML, optional)</Label>
                <Textarea
                  id="body_html"
                  value={form.body_html}
                  onChange={(e) => handleChange('body_html', e.target.value)}
                  placeholder="Optional HTML version. Leave empty to use plain text only."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => router.push('/dashboard/mail-templates')}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save template
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Template not found.</p>
      )}
    </div>
  );
}
