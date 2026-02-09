'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

const TABS = [
  { id: 'product_chapters', label: 'Product Chapters' },
  { id: 'features', label: 'Features' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'how_it_works', label: 'How It Works' },
  { id: 'footer', label: 'Footer' },
];

const FEATURE_ICONS = ['Gem', 'Star', 'User', 'Palette', 'Repeat', 'Box'];
const IMAGE_POSITIONS = ['left', 'right'];
const FOOTER_CATEGORIES = ['Platform', 'Resources', 'Company', 'Legal'];

const emptyChapter = () => ({ title: '', description: '', image_url: '', image_alt: '', image_position: 'right' });
const emptyFeature = () => ({ title: '', description: '', icon: 'Gem' });
const emptyShowcaseImage = () => ({ src: '', alt: '', tall: false });
const emptyStep = () => ({ title: '', description: '' });

export default function HomeContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [content, setContent] = useState(null);
  const [tab, setTab] = useState('product_chapters');

  // Form state per section
  const [productChapters, setProductChapters] = useState([emptyChapter()]);
  const [features, setFeatures] = useState([emptyFeature()]);
  const [showcase, setShowcase] = useState({ heading: '', subheading: '', images: [emptyShowcaseImage()] });
  const [howItWorks, setHowItWorks] = useState({
    heading: 'How it works',
    steps: [emptyStep(), emptyStep(), emptyStep(), emptyStep()],
    image_options: [emptyStep(), emptyStep(), emptyStep(), emptyStep()],
  });
  const [footer, setFooter] = useState({
    logo_url: '',
    tagline: '',
    copyright: '',
    links: Object.fromEntries(FOOTER_CATEGORIES.map(c => [c, [{ label: '', href: '' }]])),
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('home');
      if (res.success && res.content) {
        const data = res.content;
        setContent(data);
        if (data.product_chapters?.length) setProductChapters(data.product_chapters.map(c => ({ ...emptyChapter(), ...c })));
        if (data.features?.length) setFeatures(data.features.map(f => ({ ...emptyFeature(), ...f })));
        if (data.showcase) {
          setShowcase({
            heading: data.showcase.heading ?? '',
            subheading: data.showcase.subheading ?? '',
            images: (data.showcase.images?.length ? data.showcase.images : [emptyShowcaseImage()]).map(i => ({ ...emptyShowcaseImage(), ...i })),
          });
        }
        if (data.how_it_works) {
          setHowItWorks({
            heading: data.how_it_works.heading ?? 'How it works',
            steps: (data.how_it_works.steps?.length ? data.how_it_works.steps : [emptyStep()]).map(s => ({ ...emptyStep(), ...s })),
            image_options: (data.how_it_works.image_options?.length ? data.how_it_works.image_options : [emptyStep()]).map(s => ({ ...emptyStep(), ...s })),
          });
        }
        if (data.footer) {
          const links = { ...footer.links };
          FOOTER_CATEGORIES.forEach(cat => {
            if (data.footer.links?.[cat]?.length) links[cat] = data.footer.links[cat].map(l => ({ label: l.label ?? '', href: l.href ?? '' }));
          });
          setFooter({
            logo_url: data.footer.logo_url ?? '',
            tagline: data.footer.tagline ?? '',
            copyright: data.footer.copyright ?? '',
            links,
          });
        }
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await homepageAPI.getPageContentAdmin('home');
      const full = res.success && res.content ? res.content : {};
      let payload = {};
      if (tab === 'product_chapters') payload = productChapters.filter(c => c.title || c.description);
      else if (tab === 'features') payload = features.filter(f => f.title || f.description);
      else if (tab === 'showcase') payload = { ...showcase, images: showcase.images.filter(i => i.src || i.alt) };
      else if (tab === 'how_it_works') payload = howItWorks;
      else if (tab === 'footer') payload = footer;
      const updated = { ...full, [tab]: payload };
      await homepageAPI.updatePageContent('home', updated);
      setContent(updated);
      setMessage({ type: 'success', text: 'Saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (section, index, file) => {
    if (!file) return;
    try {
      const { url } = await homepageAPI.uploadContentImage(file);
      if (section === 'chapter') {
        setProductChapters(prev => prev.map((c, i) => (i === index ? { ...c, image_url: url } : c)));
      } else if (section === 'showcase') {
        setShowcase(prev => ({
          ...prev,
          images: prev.images.map((img, i) => (i === index ? { ...img, src: url } : img)),
        }));
      } else if (section === 'footer') {
        setFooter(prev => ({ ...prev, logo_url: url }));
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Upload failed' });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Home Content</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Edit product chapters, features, showcase, how it works, and footer using the form below.</p>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        {/* Product Chapters */}
        {tab === 'product_chapters' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Chapters</h2>
              <button
                type="button"
                onClick={() => setProductChapters(prev => [...prev, emptyChapter()])}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <Plus size={16} /> Add chapter
              </button>
            </div>
            {productChapters.map((chapter, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Chapter {index + 1}</span>
                  {productChapters.length > 1 && (
                    <button type="button" onClick={() => setProductChapters(prev => prev.filter((_, i) => i !== index))} className="text-red-600 hover:underline text-sm">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={e => setProductChapters(prev => prev.map((c, i) => (i === index ? { ...c, title: e.target.value } : c)))}
                    className={inputClass}
                    placeholder="Chapter title"
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={chapter.description}
                    onChange={e => setProductChapters(prev => prev.map((c, i) => (i === index ? { ...c, description: e.target.value } : c)))}
                    rows={2}
                    className={inputClass}
                    placeholder="Chapter description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chapter.image_url}
                        onChange={e => setProductChapters(prev => prev.map((c, i) => (i === index ? { ...c, image_url: e.target.value } : c)))}
                        className={inputClass}
                        placeholder="/images/chapter.jpg"
                      />
                      <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer text-sm shrink-0">
                        <Upload size={16} /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload('chapter', index, e.target.files?.[0])} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Image alt text</label>
                    <input
                      type="text"
                      value={chapter.image_alt}
                      onChange={e => setProductChapters(prev => prev.map((c, i) => (i === index ? { ...c, image_alt: e.target.value } : c)))}
                      className={inputClass}
                      placeholder="Describe the image"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Image position</label>
                  <select
                    value={chapter.image_position}
                    onChange={e => setProductChapters(prev => prev.map((c, i) => (i === index ? { ...c, image_position: e.target.value } : c)))}
                    className={inputClass}
                  >
                    {IMAGE_POSITIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Features */}
        {tab === 'features' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Features</h2>
              <button
                type="button"
                onClick={() => setFeatures(prev => [...prev, emptyFeature()])}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <Plus size={16} /> Add feature
              </button>
            </div>
            {features.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Feature {index + 1}</span>
                  {features.length > 1 && (
                    <button type="button" onClick={() => setFeatures(prev => prev.filter((_, i) => i !== index))} className="text-red-600 hover:underline">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={e => setFeatures(prev => prev.map((f, i) => (i === index ? { ...f, title: e.target.value } : f)))}
                      className={inputClass}
                      placeholder="Feature title"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Icon</label>
                    <select
                      value={feature.icon}
                      onChange={e => setFeatures(prev => prev.map((f, i) => (i === index ? { ...f, icon: e.target.value } : f)))}
                      className={inputClass}
                    >
                      {FEATURE_ICONS.map(ico => (
                        <option key={ico} value={ico}>{ico}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    value={feature.description}
                    onChange={e => setFeatures(prev => prev.map((f, i) => (i === index ? { ...f, description: e.target.value } : f)))}
                    className={inputClass}
                    placeholder="Short description"
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Showcase */}
        {tab === 'showcase' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Showcase</h2>
            <div>
              <label className={labelClass}>Section heading</label>
              <input
                type="text"
                value={showcase.heading}
                onChange={e => setShowcase(prev => ({ ...prev, heading: e.target.value }))}
                className={inputClass}
                placeholder="See it in action"
              />
            </div>
            <div>
              <label className={labelClass}>Subheading</label>
              <input
                type="text"
                value={showcase.subheading}
                onChange={e => setShowcase(prev => ({ ...prev, subheading: e.target.value }))}
                className={inputClass}
                placeholder="Campaign-ready visuals..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Showcase images (URL or upload)</label>
                <button
                  type="button"
                  onClick={() => setShowcase(prev => ({ ...prev, images: [...prev.images, emptyShowcaseImage()] }))}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  <Plus size={16} /> Add image
                </button>
              </div>
              {showcase.images.map((img, index) => (
                <div key={index} className="flex flex-wrap gap-2 items-center mb-2">
                  <input
                    type="text"
                    value={img.src}
                    onChange={e => setShowcase(prev => ({ ...prev, images: prev.images.map((im, i) => (i === index ? { ...im, src: e.target.value } : im)) }))}
                    placeholder="Image URL"
                    className={`${inputClass} flex-1 min-w-[200px]`}
                  />
                  <input
                    type="text"
                    value={img.alt}
                    onChange={e => setShowcase(prev => ({ ...prev, images: prev.images.map((im, i) => (i === index ? { ...im, alt: e.target.value } : im)) }))}
                    placeholder="Alt text"
                    className={`${inputClass} w-40`}
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!img.tall}
                      onChange={e => setShowcase(prev => ({ ...prev, images: prev.images.map((im, i) => (i === index ? { ...im, tall: e.target.checked } : im)) }))}
                      className="rounded"
                    />
                    <span className="text-sm">Tall</span>
                  </label>
                  <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer text-sm">
                    <Upload size={16} /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload('showcase', index, e.target.files?.[0])} />
                  </label>
                  {showcase.images.length > 1 && (
                    <button type="button" onClick={() => setShowcase(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))} className="text-red-600 p-2">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* How It Works */}
        {tab === 'how_it_works' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How It Works</h2>
            <div>
              <label className={labelClass}>Section heading</label>
              <input
                type="text"
                value={howItWorks.heading}
                onChange={e => setHowItWorks(prev => ({ ...prev, heading: e.target.value }))}
                className={inputClass}
                placeholder="How it works"
              />
            </div>
            <div>
              <label className={labelClass}>Steps (Projects tab)</label>
              {howItWorks.steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-start mb-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => setHowItWorks(prev => ({ ...prev, steps: prev.steps.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)) }))}
                      className={inputClass}
                      placeholder="Step title"
                    />
                    <input
                      type="text"
                      value={step.description}
                      onChange={e => setHowItWorks(prev => ({ ...prev, steps: prev.steps.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)) }))}
                      className={inputClass}
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Image options (Images tab)</label>
              {howItWorks.image_options.map((opt, index) => (
                <div key={index} className="flex gap-2 items-start mb-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={opt.title}
                      onChange={e => setHowItWorks(prev => ({ ...prev, image_options: prev.image_options.map((o, i) => (i === index ? { ...o, title: e.target.value } : o)) }))}
                      className={inputClass}
                      placeholder="Option title"
                    />
                    <input
                      type="text"
                      value={opt.description}
                      onChange={e => setHowItWorks(prev => ({ ...prev, image_options: prev.image_options.map((o, i) => (i === index ? { ...o, description: e.target.value } : o)) }))}
                      className={inputClass}
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        {tab === 'footer' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Footer</h2>
            <div>
              <label className={labelClass}>Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={footer.logo_url}
                  onChange={e => setFooter(prev => ({ ...prev, logo_url: e.target.value }))}
                  className={inputClass}
                  placeholder="/images/logo-splash.png"
                />
                <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer text-sm shrink-0">
                  <Upload size={16} /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload('footer', 0, e.target.files?.[0])} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input
                type="text"
                value={footer.tagline}
                onChange={e => setFooter(prev => ({ ...prev, tagline: e.target.value }))}
                className={inputClass}
                placeholder="Campaign-ready visuals powered by AI."
              />
            </div>
            <div>
              <label className={labelClass}>Copyright text</label>
              <input
                type="text"
                value={footer.copyright}
                onChange={e => setFooter(prev => ({ ...prev, copyright: e.target.value }))}
                className={inputClass}
                placeholder="© 2026 Splash AI Studio. All rights reserved."
              />
            </div>
            <div>
              <label className={labelClass}>Footer link groups</label>
              {FOOTER_CATEGORIES.map(cat => (
                <div key={cat} className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{cat}</p>
                  {(footer.links[cat] || []).map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={e => setFooter(prev => ({
                          ...prev,
                          links: { ...prev.links, [cat]: prev.links[cat].map((l, i) => (i === index ? { ...l, label: e.target.value } : l)) },
                        }))}
                        className={`${inputClass} w-40`}
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={e => setFooter(prev => ({
                          ...prev,
                          links: { ...prev.links, [cat]: prev.links[cat].map((l, i) => (i === index ? { ...l, href: e.target.value } : l)) },
                        }))}
                        className={inputClass}
                        placeholder="Link (e.g. /blog)"
                      />
                      {footer.links[cat].length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFooter(prev => ({ ...prev, links: { ...prev.links, [cat]: prev.links[cat].filter((_, i) => i !== index) } }))}
                          className="text-red-600 p-2 shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFooter(prev => ({ ...prev, links: { ...prev.links, [cat]: [...(prev.links[cat] || []), { label: '', href: '' }] } }))}
                    className="flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                  >
                    <Plus size={14} /> Add link
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={saveSection}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save {TABS.find(t => t.id === tab)?.label || tab}
          </button>
        </div>
      </div>
    </div>
  );
}
