'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rawJson, setRawJson] = useState('{}');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('security');
      if (res.success && res.content) {
        setRawJson(JSON.stringify(res.content, null, 2));
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        setMessage({ type: 'error', text: 'Invalid JSON' });
        return;
      }
      setSaving(true);
      setMessage({ type: '', text: '' });
      await homepageAPI.updatePageContent('security', parsed);
      setMessage({ type: 'success', text: 'Saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Edit security & data protection content (JSON).</p>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <textarea
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          className="w-full h-[500px] font-mono text-sm p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          spellCheck={false}
        />
        <button
          onClick={save}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save
        </button>
      </div>
    </div>
  );
}
