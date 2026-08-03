'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const sectionClass =
  'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4';

const emptyCard = () => ({ title: '', description: '' });

export default function SecurityAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [header, setHeader] = useState({ title: '', subtitle: '' });
  const [cards, setCards] = useState([emptyCard()]);
  const [compliance, setCompliance] = useState({
    heading: '',
    paragraphs: [''],
  });
  const [cta, setCta] = useState({ title: '', subtitle: '', button_text: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('security');
      if (!res.success || !res.content) return;
      const data = res.content;

      if (data.header) {
        setHeader({ title: data.header.title ?? '', subtitle: data.header.subtitle ?? '' });
      }
      if (Array.isArray(data.cards) && data.cards.length) {
        setCards(
          data.cards.map((c) => ({
            title: c.title ?? '',
            description: c.description ?? '',
          }))
        );
      }
      if (data.compliance) {
        setCompliance({
          heading: data.compliance.heading ?? '',
          paragraphs:
            Array.isArray(data.compliance.paragraphs) && data.compliance.paragraphs.length
              ? data.compliance.paragraphs
              : [''],
        });
      }
      if (data.cta) {
        setCta({
          title: data.cta.title ?? '',
          subtitle: data.cta.subtitle ?? '',
          button_text: data.cta.button_text ?? '',
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
      await homepageAPI.updatePageContent('security', {
        header,
        cards: cards.filter((c) => c.title || c.description),
        compliance: {
          heading: compliance.heading,
          paragraphs: compliance.paragraphs.map((p) => p.trim()).filter(Boolean),
        },
        cta,
      });
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
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Edit the public Security page content shown on /security.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Page header</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={header.title}
            onChange={(e) => setHeader({ ...header, title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <textarea
            value={header.subtitle}
            onChange={(e) => setHeader({ ...header, subtitle: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security cards</h2>
          <button
            type="button"
            onClick={() => setCards([...cards, emptyCard()])}
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <Plus size={14} /> Add card
          </button>
        </div>
        {cards.map((card, index) => (
          <div
            key={`card-${index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={card.title}
                onChange={(e) =>
                  setCards(cards.map((c, i) => (i === index ? { ...c, title: e.target.value } : c)))
                }
                className={inputClass}
                placeholder="Card title"
              />
              {cards.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCards(cards.filter((_, i) => i !== index))}
                  className="text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <textarea
              value={card.description}
              onChange={(e) =>
                setCards(
                  cards.map((c, i) => (i === index ? { ...c, description: e.target.value } : c))
                )
              }
              rows={3}
              className={inputClass}
              placeholder="Card description"
            />
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            value={compliance.heading}
            onChange={(e) => setCompliance({ ...compliance, heading: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Paragraphs</label>
            <button
              type="button"
              onClick={() =>
                setCompliance({ ...compliance, paragraphs: [...compliance.paragraphs, ''] })
              }
              className="flex items-center gap-1 text-sm text-blue-600"
            >
              <Plus size={14} /> Add paragraph
            </button>
          </div>
          {compliance.paragraphs.map((p, index) => (
            <div key={`comp-${index}`} className="flex gap-2 mb-2">
              <textarea
                value={p}
                onChange={(e) =>
                  setCompliance({
                    ...compliance,
                    paragraphs: compliance.paragraphs.map((x, i) =>
                      i === index ? e.target.value : x
                    ),
                  })
                }
                rows={3}
                className={inputClass}
              />
              {compliance.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCompliance({
                      ...compliance,
                      paragraphs: compliance.paragraphs.filter((_, i) => i !== index),
                    })
                  }
                  className="text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bottom CTA</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={cta.title}
            onChange={(e) => setCta({ ...cta, title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <textarea
            value={cta.subtitle}
            onChange={(e) => setCta({ ...cta, subtitle: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Button text</label>
          <input
            type="text"
            value={cta.button_text}
            onChange={(e) => setCta({ ...cta, button_text: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
        Save Security page
      </button>
    </div>
  );
}
