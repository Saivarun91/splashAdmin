'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const sectionClass =
  'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4';

const emptyValue = () => ({ title: '', desc: '' });
const emptyBullet = () => ({ text: '' });

export default function VisionMissionAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [header, setHeader] = useState({ title: '', subtitle: '' });
  const [vision, setVision] = useState({
    title: '',
    paragraphs: [''],
    pointsText: '',
  });
  const [mission, setMission] = useState({
    title: '',
    paragraphs: [''],
    bullets: [emptyBullet()],
  });
  const [coreValues, setCoreValues] = useState({
    heading: '',
    items: [emptyValue()],
  });
  const [cta, setCta] = useState({ title: '', button_text: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('vision_mission');
      if (!res.success || !res.content) return;
      const data = res.content;

      if (data.header) {
        setHeader({ title: data.header.title ?? '', subtitle: data.header.subtitle ?? '' });
      }
      if (data.vision) {
        setVision({
          title: data.vision.title ?? '',
          paragraphs:
            Array.isArray(data.vision.paragraphs) && data.vision.paragraphs.length
              ? data.vision.paragraphs
              : [''],
          pointsText: Array.isArray(data.vision.points) ? data.vision.points.join('\n') : '',
        });
      }
      if (data.mission) {
        setMission({
          title: data.mission.title ?? '',
          paragraphs:
            Array.isArray(data.mission.paragraphs) && data.mission.paragraphs.length
              ? data.mission.paragraphs
              : [''],
          bullets:
            Array.isArray(data.mission.bullets) && data.mission.bullets.length
              ? data.mission.bullets.map((b) => ({
                  text: typeof b === 'string' ? b : b?.text ?? '',
                }))
              : [emptyBullet()],
        });
      }
      if (data.core_values) {
        setCoreValues({
          heading: data.core_values.heading ?? '',
          items:
            Array.isArray(data.core_values.items) && data.core_values.items.length
              ? data.core_values.items.map((i) => ({
                  title: i.title ?? '',
                  desc: i.desc ?? '',
                }))
              : [emptyValue()],
        });
      }
      if (data.cta) {
        setCta({ title: data.cta.title ?? '', button_text: data.cta.button_text ?? '' });
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
      await homepageAPI.updatePageContent('vision_mission', {
        header,
        vision: {
          title: vision.title,
          paragraphs: vision.paragraphs.map((p) => p.trim()).filter(Boolean),
          points: vision.pointsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        mission: {
          title: mission.title,
          paragraphs: mission.paragraphs.map((p) => p.trim()).filter(Boolean),
          bullets: mission.bullets
            .map((b) => ({ text: (b.text || '').trim() }))
            .filter((b) => b.text),
        },
        core_values: {
          heading: coreValues.heading,
          items: coreValues.items.filter((i) => i.title || i.desc),
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vision & Mission</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Edit the public Vision & Mission page content shown on /vision-mision.
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vision</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={vision.title}
            onChange={(e) => setVision({ ...vision, title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Paragraphs</label>
            <button
              type="button"
              onClick={() => setVision({ ...vision, paragraphs: [...vision.paragraphs, ''] })}
              className="flex items-center gap-1 text-sm text-blue-600"
            >
              <Plus size={14} /> Add paragraph
            </button>
          </div>
          {vision.paragraphs.map((p, index) => (
            <div key={`v-para-${index}`} className="flex gap-2 mb-2">
              <textarea
                value={p}
                onChange={(e) =>
                  setVision({
                    ...vision,
                    paragraphs: vision.paragraphs.map((x, i) => (i === index ? e.target.value : x)),
                  })
                }
                rows={3}
                className={inputClass}
              />
              {vision.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setVision({
                      ...vision,
                      paragraphs: vision.paragraphs.filter((_, i) => i !== index),
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
        <div>
          <label className={labelClass}>Vision points (one per line)</label>
          <textarea
            value={vision.pointsText}
            onChange={(e) => setVision({ ...vision, pointsText: e.target.value })}
            rows={4}
            className={inputClass}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mission</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={mission.title}
            onChange={(e) => setMission({ ...mission, title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Paragraphs</label>
            <button
              type="button"
              onClick={() => setMission({ ...mission, paragraphs: [...mission.paragraphs, ''] })}
              className="flex items-center gap-1 text-sm text-blue-600"
            >
              <Plus size={14} /> Add paragraph
            </button>
          </div>
          {mission.paragraphs.map((p, index) => (
            <div key={`m-para-${index}`} className="flex gap-2 mb-2">
              <textarea
                value={p}
                onChange={(e) =>
                  setMission({
                    ...mission,
                    paragraphs: mission.paragraphs.map((x, i) => (i === index ? e.target.value : x)),
                  })
                }
                rows={3}
                className={inputClass}
              />
              {mission.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setMission({
                      ...mission,
                      paragraphs: mission.paragraphs.filter((_, i) => i !== index),
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Mission bullets</label>
            <button
              type="button"
              onClick={() => setMission({ ...mission, bullets: [...mission.bullets, emptyBullet()] })}
              className="flex items-center gap-1 text-sm text-blue-600"
            >
              <Plus size={14} /> Add bullet
            </button>
          </div>
          {mission.bullets.map((b, index) => (
            <div key={`bullet-${index}`} className="flex gap-2 mb-2">
              <input
                type="text"
                value={b.text}
                onChange={(e) =>
                  setMission({
                    ...mission,
                    bullets: mission.bullets.map((x, i) =>
                      i === index ? { text: e.target.value } : x
                    ),
                  })
                }
                className={inputClass}
                placeholder="Bullet text"
              />
              {mission.bullets.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setMission({
                      ...mission,
                      bullets: mission.bullets.filter((_, i) => i !== index),
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Core values</h2>
          <button
            type="button"
            onClick={() =>
              setCoreValues({ ...coreValues, items: [...coreValues.items, emptyValue()] })
            }
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <Plus size={14} /> Add value
          </button>
        </div>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            value={coreValues.heading}
            onChange={(e) => setCoreValues({ ...coreValues, heading: e.target.value })}
            className={inputClass}
          />
        </div>
        {coreValues.items.map((item, index) => (
          <div
            key={`value-${index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  setCoreValues({
                    ...coreValues,
                    items: coreValues.items.map((it, i) =>
                      i === index ? { ...it, title: e.target.value } : it
                    ),
                  })
                }
                className={inputClass}
                placeholder="Title"
              />
              {coreValues.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCoreValues({
                      ...coreValues,
                      items: coreValues.items.filter((_, i) => i !== index),
                    })
                  }
                  className="text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <textarea
              value={item.desc}
              onChange={(e) =>
                setCoreValues({
                  ...coreValues,
                  items: coreValues.items.map((it, i) =>
                    i === index ? { ...it, desc: e.target.value } : it
                  ),
                })
              }
              rows={2}
              className={inputClass}
              placeholder="Description"
            />
          </div>
        ))}
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bottom CTA</h2>
        <div>
          <label className={labelClass}>Title</label>
          <textarea
            value={cta.title}
            onChange={(e) => setCta({ ...cta, title: e.target.value })}
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
        Save Vision & Mission
      </button>
    </div>
  );
}
