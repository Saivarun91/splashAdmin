'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const sectionClass =
  'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4';

const emptyOffer = () => ({ title: '', description: '' });
const emptyStep = () => ({ title: '', description: '' });

export default function AboutAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [header, setHeader] = useState({ title: '', subtitle: '' });
  const [whoWeAre, setWhoWeAre] = useState({
    badge: '',
    title: '',
    paragraphs: [''],
    images: ['', '', '', ''],
  });
  const [purposeVision, setPurposeVision] = useState({
    purpose_title: '',
    purpose_text: '',
    vision_title: '',
    vision_text: '',
  });
  const [platformOffers, setPlatformOffers] = useState({
    heading: '',
    subheading: '',
    items: [emptyOffer()],
  });
  const [howItWorks, setHowItWorks] = useState({
    heading: '',
    steps: [emptyStep()],
  });
  const [whoItIsFor, setWhoItIsFor] = useState({
    heading: '',
    itemsText: '',
  });
  const [closing, setClosing] = useState({ title: '', cta_text: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('about');
      if (!res.success || !res.content) return;
      const data = res.content;

      if (data.header) {
        setHeader({ title: data.header.title ?? '', subtitle: data.header.subtitle ?? '' });
      }
      if (data.who_we_are) {
        setWhoWeAre({
          badge: data.who_we_are.badge ?? '',
          title: data.who_we_are.title ?? '',
          paragraphs: Array.isArray(data.who_we_are.paragraphs) && data.who_we_are.paragraphs.length
            ? data.who_we_are.paragraphs
            : [''],
          images: Array.isArray(data.who_we_are.images) && data.who_we_are.images.length
            ? [...data.who_we_are.images, '', '', '', ''].slice(0, 4)
            : ['', '', '', ''],
        });
      }
      if (data.purpose_vision) {
        setPurposeVision({
          purpose_title: data.purpose_vision.purpose_title ?? '',
          purpose_text: data.purpose_vision.purpose_text ?? '',
          vision_title: data.purpose_vision.vision_title ?? '',
          vision_text: data.purpose_vision.vision_text ?? '',
        });
      }
      if (data.platform_offers) {
        setPlatformOffers({
          heading: data.platform_offers.heading ?? '',
          subheading: data.platform_offers.subheading ?? '',
          items:
            Array.isArray(data.platform_offers.items) && data.platform_offers.items.length
              ? data.platform_offers.items.map((i) => ({
                  title: i.title ?? '',
                  description: i.description ?? '',
                }))
              : [emptyOffer()],
        });
      }
      if (data.how_it_works) {
        setHowItWorks({
          heading: data.how_it_works.heading ?? '',
          steps:
            Array.isArray(data.how_it_works.steps) && data.how_it_works.steps.length
              ? data.how_it_works.steps.map((s) => ({
                  title: s.title ?? '',
                  description: s.description ?? '',
                }))
              : [emptyStep()],
        });
      }
      if (data.who_it_is_for) {
        setWhoItIsFor({
          heading: data.who_it_is_for.heading ?? '',
          itemsText: Array.isArray(data.who_it_is_for.items)
            ? data.who_it_is_for.items.join('\n')
            : '',
        });
      }
      if (data.closing) {
        setClosing({ title: data.closing.title ?? '', cta_text: data.closing.cta_text ?? '' });
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
      await homepageAPI.updatePageContent('about', {
        header,
        who_we_are: {
          badge: whoWeAre.badge,
          title: whoWeAre.title,
          paragraphs: whoWeAre.paragraphs.map((p) => p.trim()).filter(Boolean),
          images: whoWeAre.images.map((u) => u.trim()).filter(Boolean),
        },
        purpose_vision: purposeVision,
        platform_offers: {
          heading: platformOffers.heading,
          subheading: platformOffers.subheading,
          items: platformOffers.items.filter((i) => i.title || i.description),
        },
        how_it_works: {
          heading: howItWorks.heading,
          steps: howItWorks.steps.filter((s) => s.title || s.description),
        },
        who_it_is_for: {
          heading: whoItIsFor.heading,
          items: whoItIsFor.itemsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        closing,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Edit the public About page content shown on /about.
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Who we are</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Badge</label>
            <input
              type="text"
              value={whoWeAre.badge}
              onChange={(e) => setWhoWeAre({ ...whoWeAre, badge: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={whoWeAre.title}
              onChange={(e) => setWhoWeAre({ ...whoWeAre, title: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Paragraphs</label>
            <button
              type="button"
              onClick={() => setWhoWeAre({ ...whoWeAre, paragraphs: [...whoWeAre.paragraphs, ''] })}
              className="flex items-center gap-1 text-sm text-blue-600"
            >
              <Plus size={14} /> Add paragraph
            </button>
          </div>
          {whoWeAre.paragraphs.map((p, index) => (
            <div key={`para-${index}`} className="flex gap-2 mb-2">
              <textarea
                value={p}
                onChange={(e) =>
                  setWhoWeAre({
                    ...whoWeAre,
                    paragraphs: whoWeAre.paragraphs.map((x, i) => (i === index ? e.target.value : x)),
                  })
                }
                rows={3}
                className={inputClass}
              />
              {whoWeAre.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setWhoWeAre({
                      ...whoWeAre,
                      paragraphs: whoWeAre.paragraphs.filter((_, i) => i !== index),
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
          <label className={labelClass}>Image URLs (up to 4)</label>
          <div className="grid md:grid-cols-2 gap-3">
            {whoWeAre.images.map((url, index) => (
              <input
                key={`img-${index}`}
                type="text"
                value={url}
                onChange={(e) =>
                  setWhoWeAre({
                    ...whoWeAre,
                    images: whoWeAre.images.map((x, i) => (i === index ? e.target.value : x)),
                  })
                }
                className={inputClass}
                placeholder={`/images/about${index + 1}.jpg`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Purpose & vision</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Purpose title</label>
            <input
              type="text"
              value={purposeVision.purpose_title}
              onChange={(e) => setPurposeVision({ ...purposeVision, purpose_title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Vision title</label>
            <input
              type="text"
              value={purposeVision.vision_title}
              onChange={(e) => setPurposeVision({ ...purposeVision, vision_title: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Purpose text</label>
          <textarea
            value={purposeVision.purpose_text}
            onChange={(e) => setPurposeVision({ ...purposeVision, purpose_text: e.target.value })}
            rows={4}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Vision text</label>
          <textarea
            value={purposeVision.vision_text}
            onChange={(e) => setPurposeVision({ ...purposeVision, vision_text: e.target.value })}
            rows={3}
            className={inputClass}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Platform offers</h2>
          <button
            type="button"
            onClick={() =>
              setPlatformOffers({
                ...platformOffers,
                items: [...platformOffers.items, emptyOffer()],
              })
            }
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <Plus size={14} /> Add item
          </button>
        </div>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            value={platformOffers.heading}
            onChange={(e) => setPlatformOffers({ ...platformOffers, heading: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subheading</label>
          <textarea
            value={platformOffers.subheading}
            onChange={(e) => setPlatformOffers({ ...platformOffers, subheading: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
        {platformOffers.items.map((item, index) => (
          <div
            key={`offer-${index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2"
          >
            <div className="flex justify-between gap-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  setPlatformOffers({
                    ...platformOffers,
                    items: platformOffers.items.map((it, i) =>
                      i === index ? { ...it, title: e.target.value } : it
                    ),
                  })
                }
                className={inputClass}
                placeholder="Title"
              />
              {platformOffers.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPlatformOffers({
                      ...platformOffers,
                      items: platformOffers.items.filter((_, i) => i !== index),
                    })
                  }
                  className="text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <textarea
              value={item.description}
              onChange={(e) =>
                setPlatformOffers({
                  ...platformOffers,
                  items: platformOffers.items.map((it, i) =>
                    i === index ? { ...it, description: e.target.value } : it
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How it works</h2>
          <button
            type="button"
            onClick={() => setHowItWorks({ ...howItWorks, steps: [...howItWorks.steps, emptyStep()] })}
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <Plus size={14} /> Add step
          </button>
        </div>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            value={howItWorks.heading}
            onChange={(e) => setHowItWorks({ ...howItWorks, heading: e.target.value })}
            className={inputClass}
          />
        </div>
        {howItWorks.steps.map((step, index) => (
          <div
            key={`step-${index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2"
          >
            <div className="flex justify-between gap-2">
              <input
                type="text"
                value={step.title}
                onChange={(e) =>
                  setHowItWorks({
                    ...howItWorks,
                    steps: howItWorks.steps.map((s, i) =>
                      i === index ? { ...s, title: e.target.value } : s
                    ),
                  })
                }
                className={inputClass}
                placeholder={`Step ${index + 1} title`}
              />
              {howItWorks.steps.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setHowItWorks({
                      ...howItWorks,
                      steps: howItWorks.steps.filter((_, i) => i !== index),
                    })
                  }
                  className="text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <textarea
              value={step.description}
              onChange={(e) =>
                setHowItWorks({
                  ...howItWorks,
                  steps: howItWorks.steps.map((s, i) =>
                    i === index ? { ...s, description: e.target.value } : s
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Who it is for</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            type="text"
            value={whoItIsFor.heading}
            onChange={(e) => setWhoItIsFor({ ...whoItIsFor, heading: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Audience items (one per line)</label>
          <textarea
            value={whoItIsFor.itemsText}
            onChange={(e) => setWhoItIsFor({ ...whoItIsFor, itemsText: e.target.value })}
            rows={4}
            className={inputClass}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Closing CTA</h2>
        <div>
          <label className={labelClass}>Title</label>
          <textarea
            value={closing.title}
            onChange={(e) => setClosing({ ...closing, title: e.target.value })}
            rows={3}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Button text</label>
          <input
            type="text"
            value={closing.cta_text}
            onChange={(e) => setClosing({ ...closing, cta_text: e.target.value })}
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
        Save About page
      </button>
    </div>
  );
}
