'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Upload } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

export default function HeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hero, setHero] = useState({
    title: '',
    cta_primary_text: '',
    cta_primary_href: '',
    cta_secondary_text: '',
    cta_secondary_href: '#showcase',
    bottom_text: '',
    images: ['', '', ''],
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('home');
      if (res.success && res.content && res.content.hero) {
        setHero({ ...hero, ...res.content.hero, images: res.content.hero.images || hero.images });
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
      const updated = { ...content, hero };
      await homepageAPI.updatePageContent('home', updated);
      setMessage({ type: 'success', text: 'Saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    try {
      const { url } = await homepageAPI.uploadContentImage(file);
      setHero((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => (i === index ? url : img)),
      }));
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Upload failed' });
    }
  };

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
        <p className="text-gray-600 dark:text-gray-400 mt-2">Edit hero title, buttons, and carousel images.</p>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero title</label>
          <input
            type="text"
            value={hero.title}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary CTA text</label>
            <input
              type="text"
              value={hero.cta_primary_text}
              onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary CTA link</label>
            <input
              type="text"
              value={hero.cta_primary_href}
              onChange={(e) => setHero({ ...hero, cta_primary_href: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary CTA text</label>
            <input
              type="text"
              value={hero.cta_secondary_text}
              onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary CTA link</label>
            <input
              type="text"
              value={hero.cta_secondary_href}
              onChange={(e) => setHero({ ...hero, cta_secondary_href: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bottom text</label>
          <textarea
            value={hero.bottom_text}
            onChange={(e) => setHero({ ...hero, bottom_text: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Carousel images (URL or upload)</label>
          <div className="space-y-2">
            {(hero.images || []).map((url, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setHero((prev) => ({ ...prev, images: prev.images.map((u, j) => (j === i ? e.target.value : u)) }))}
                  placeholder={`Image ${i + 1} URL`}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
                <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer text-sm">
                  <Upload size={16} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(i, e.target.files?.[0])}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save
        </button>
      </div>
    </div>
  );
}
