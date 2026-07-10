'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Save } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

export default function HeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hero, setHero] = useState({
    pill_text: '',
    title_html: '',
    subtitle: '',
    cta_primary_text: '',
    cta_primary_href: '',
    cta_secondary_text: '',
    cta_secondary_href: '',
    note: '',
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('home');
      if (res.success && res.content?.hero) {
        const h = res.content.hero;
        setHero({
          pill_text: h.pill_text ?? '',
          title_html: h.title_html ?? h.title ?? '',
          subtitle: h.subtitle ?? h.bottom_text ?? '',
          cta_primary_text: h.cta_primary_text ?? '',
          cta_primary_href: h.cta_primary_href ?? '',
          cta_secondary_text: h.cta_secondary_text ?? '',
          cta_secondary_href: h.cta_secondary_href ?? '',
          note: h.note ?? '',
        });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await homepageAPI.getPageContentAdmin('home');
      const content = res.success && res.content ? res.content : {};
      await homepageAPI.updatePageContent('home', { ...content, hero });
      setMessage({ type: 'success', text: 'Saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hero & CTA</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quick edit for the hero section. All homepage sections are also available in{' '}
          <Link href="/dashboard/home-page/home-content" className="text-blue-600 hover:underline">Home Content</Link>.
        </p>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div><label className={labelClass}>Pill text</label><input type="text" value={hero.pill_text} onChange={(e) => setHero({ ...hero, pill_text: e.target.value })} className={inputClass} /></div>
        <div>
          <label className={labelClass}>Title (HTML allowed)</label>
          <textarea value={hero.title_html} onChange={(e) => setHero({ ...hero, title_html: e.target.value })} rows={3} className={inputClass} />
        </div>
        <div><label className={labelClass}>Subtitle</label><textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} rows={2} className={inputClass} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>Primary CTA text</label><input type="text" value={hero.cta_primary_text} onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Primary CTA link</label><input type="text" value={hero.cta_primary_href} onChange={(e) => setHero({ ...hero, cta_primary_href: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Secondary CTA text</label><input type="text" value={hero.cta_secondary_text} onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Secondary CTA link</label><input type="text" value={hero.cta_secondary_href} onChange={(e) => setHero({ ...hero, cta_secondary_href: e.target.value })} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Note below buttons</label><input type="text" value={hero.note} onChange={(e) => setHero({ ...hero, note: e.target.value })} className={inputClass} /></div>
        <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save
        </button>
      </div>
    </div>
  );
}
