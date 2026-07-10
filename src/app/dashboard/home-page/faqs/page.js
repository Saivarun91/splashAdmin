'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

const emptyFaq = () => ({ question: '', answer: '' });

export default function FaqsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [header, setHeader] = useState({ title: '', subtitle: '' });
  const [items, setItems] = useState([emptyFaq()]);
  const [cta, setCta] = useState({ title: '', subtitle: '', button_text: '', button_href: '/contact' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('faqs');
      if (res.success && res.content) {
        const data = res.content;
        if (data.header) setHeader({ title: data.header.title ?? '', subtitle: data.header.subtitle ?? '' });
        if (data.items?.length) setItems(data.items.map((i) => ({ ...emptyFaq(), ...i })));
        if (data.cta) setCta({ title: data.cta.title ?? '', subtitle: data.cta.subtitle ?? '', button_text: data.cta.button_text ?? '', button_href: data.cta.button_href ?? '/contact' });
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
      await homepageAPI.updatePageContent('faqs', {
        header,
        items: items.filter((i) => i.question || i.answer),
        cta,
      });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FAQs Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Edit the public FAQs page content.</p>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Page header</h2>
          <div className="space-y-3">
            <div><label className={labelClass}>Title</label><input type="text" value={header.title} onChange={(e) => setHeader({ ...header, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Subtitle</label><textarea value={header.subtitle} onChange={(e) => setHeader({ ...header, subtitle: e.target.value })} rows={2} className={inputClass} /></div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">FAQ items</h2>
          {items.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2 mb-3">
              <div><label className={labelClass}>Question</label><input type="text" value={item.question} onChange={(e) => setItems((p) => p.map((it, i) => (i === index ? { ...it, question: e.target.value } : it)))} className={inputClass} /></div>
              <div><label className={labelClass}>Answer</label><textarea value={item.answer} onChange={(e) => setItems((p) => p.map((it, i) => (i === index ? { ...it, answer: e.target.value } : it)))} rows={3} className={inputClass} /></div>
            </div>
          ))}
          <button type="button" onClick={() => setItems((p) => [...p, emptyFaq()])} className="text-sm text-blue-600 hover:underline">+ Add FAQ</button>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Bottom CTA</h2>
          <div className="space-y-3">
            <div><label className={labelClass}>Title</label><input type="text" value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Subtitle</label><textarea value={cta.subtitle} onChange={(e) => setCta({ ...cta, subtitle: e.target.value })} rows={2} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Button text</label><input type="text" value={cta.button_text} onChange={(e) => setCta({ ...cta, button_text: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Button link</label><input type="text" value={cta.button_href} onChange={(e) => setCta({ ...cta, button_href: e.target.value })} className={inputClass} /></div>
            </div>
          </div>
        </div>
        <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save
        </button>
      </div>
    </div>
  );
}
