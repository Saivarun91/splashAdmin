'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

export default function ContactAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [header, setHeader] = useState({ title: '', subtitle: '' });
  const [details, setDetails] = useState({
    section_title: '',
    office: { label: '', lines: ['', ''], map_url: '' },
    phone: { label: '', number: '', tel_href: '', hours: '' },
    email: { label: '', address: '', mailto_href: '', hours: '' },
  });
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [form, setForm] = useState({
    title: '',
    success_title: '',
    success_message: '',
    submit_text: '',
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('contact');
      if (res.success && res.content) {
        const data = res.content;
        if (data.header) setHeader({ title: data.header.title ?? '', subtitle: data.header.subtitle ?? '' });
        if (data.details) {
          setDetails({
            section_title: data.details.section_title ?? '',
            office: {
              label: data.details.office?.label ?? '',
              lines: data.details.office?.lines?.length ? data.details.office.lines : ['', ''],
              map_url: data.details.office?.map_url ?? '',
            },
            phone: {
              label: data.details.phone?.label ?? '',
              number: data.details.phone?.number ?? '',
              tel_href: data.details.phone?.tel_href ?? '',
              hours: data.details.phone?.hours ?? '',
            },
            email: {
              label: data.details.email?.label ?? '',
              address: data.details.email?.address ?? '',
              mailto_href: data.details.email?.mailto_href ?? '',
              hours: data.details.email?.hours ?? '',
            },
          });
        }
        setMapEmbedUrl(data.map_embed_url ?? '');
        if (data.form) setForm({
          title: data.form.title ?? '',
          success_title: data.form.success_title ?? '',
          success_message: data.form.success_message ?? '',
          submit_text: data.form.submit_text ?? '',
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
      await homepageAPI.updatePageContent('contact', {
        header,
        details: {
          ...details,
          office: { ...details.office, lines: details.office.lines.filter(Boolean) },
        },
        map_embed_url: mapEmbedUrl,
        form,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Edit the public contact page content and contact details.</p>
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
          <h2 className="text-lg font-semibold mb-3">Contact details</h2>
          <div className="space-y-4">
            <div><label className={labelClass}>Section title</label><input type="text" value={details.section_title} onChange={(e) => setDetails({ ...details, section_title: e.target.value })} className={inputClass} /></div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
              <p className="font-medium text-gray-700 dark:text-gray-300">Office address</p>
              <input type="text" value={details.office.label} onChange={(e) => setDetails({ ...details, office: { ...details.office, label: e.target.value } })} className={inputClass} placeholder="Label" />
              {details.office.lines.map((line, index) => (
                <input key={index} type="text" value={line} onChange={(e) => setDetails({ ...details, office: { ...details.office, lines: details.office.lines.map((l, i) => (i === index ? e.target.value : l)) } })} className={inputClass} placeholder={`Address line ${index + 1}`} />
              ))}
              <input type="text" value={details.office.map_url} onChange={(e) => setDetails({ ...details, office: { ...details.office, map_url: e.target.value } })} className={inputClass} placeholder="Google Maps link" />
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
              <p className="font-medium text-gray-700 dark:text-gray-300">Phone</p>
              <input type="text" value={details.phone.label} onChange={(e) => setDetails({ ...details, phone: { ...details.phone, label: e.target.value } })} className={inputClass} placeholder="Label" />
              <input type="text" value={details.phone.number} onChange={(e) => setDetails({ ...details, phone: { ...details.phone, number: e.target.value, tel_href: `tel:${e.target.value.replace(/\s/g, '')}` } })} className={inputClass} placeholder="+91 8790900881" />
              <input type="text" value={details.phone.hours} onChange={(e) => setDetails({ ...details, phone: { ...details.phone, hours: e.target.value } })} className={inputClass} placeholder="Hours" />
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
              <p className="font-medium text-gray-700 dark:text-gray-300">Email</p>
              <input type="text" value={details.email.label} onChange={(e) => setDetails({ ...details, email: { ...details.email, label: e.target.value } })} className={inputClass} placeholder="Label" />
              <input type="text" value={details.email.address} onChange={(e) => setDetails({ ...details, email: { ...details.email, address: e.target.value, mailto_href: `mailto:${e.target.value}` } })} className={inputClass} placeholder="support@gosplash.ai" />
              <input type="text" value={details.email.hours} onChange={(e) => setDetails({ ...details, email: { ...details.email, hours: e.target.value } })} className={inputClass} placeholder="Hours" />
            </div>

            <div>
              <label className={labelClass}>Google Maps embed URL</label>
              <textarea value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} rows={3} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Contact form</h2>
          <div className="space-y-3">
            <div><label className={labelClass}>Form title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Success title</label><input type="text" value={form.success_title} onChange={(e) => setForm({ ...form, success_title: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Success message</label><textarea value={form.success_message} onChange={(e) => setForm({ ...form, success_message: e.target.value })} rows={2} className={inputClass} /></div>
            <div><label className={labelClass}>Submit button text</label><input type="text" value={form.submit_text} onChange={(e) => setForm({ ...form, submit_text: e.target.value })} className={inputClass} /></div>
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
