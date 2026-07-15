'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Save, Upload, Plus, Trash2, ExternalLink } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

const TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'ticker', label: 'Ticker' },
  { id: 'showcase', label: 'Showcase Text' },
  { id: 'how', label: 'How It Works' },
  { id: 'output', label: 'What You Can Create' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'who_uses', label: 'Who Uses Splash' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'cta', label: 'CTA & WhatsApp' },
  { id: 'footer', label: 'Footer' },
];

const WHO_ICONS = ['Gem', 'Store', 'Palette', 'Share2'];

const FOOTER_LOGO_PRESET = '/images/SplashLogoPNG.png';
const ORIGINAL_FOOTER_DEFAULTS = {
  logo_url: FOOTER_LOGO_PRESET,
  copyright: '© 2025 Splash AI Studio',
  links: [
    { label: 'Instagram', href: 'https://www.instagram.com/splash_ai_studios/' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
};

const emptyTicker = () => ({ strong: '', span: '' });
const emptyStep = () => ({ number: '', title: '', description: '' });
const emptyOutputItem = () => ({ title: '', description: '' });
const emptyCapability = () => ({ tag: '', title: '', description: '', pills: [], highlighted: false });
const emptyWhoItem = () => ({ icon: 'Gem', title: '', description: '', pills: [] });
const emptyTestimonial = () => ({ quote_html: '', initials: '', name: '', role: '' });
const emptyFooterLink = () => ({ label: '', href: '' });

const pillsToText = (pills) => (Array.isArray(pills) ? pills.join('\n') : '');
const textToPills = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

export default function HomeContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tab, setTab] = useState('hero');

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
  const [ticker, setTicker] = useState([emptyTicker()]);
  const [showcase, setShowcase] = useState({
    eye_label: '',
    title_html: '',
    cta_text: '',
    cta_href: '/gallery',
  });
  const [how, setHow] = useState({
    eye_label: '',
    title_html: '',
    steps: [emptyStep(), emptyStep(), emptyStep()],
    visual: { label: '', title_html: '' },
  });
  const [output, setOutput] = useState({ eye_label: '', title_html: '', items: [emptyOutputItem()] });
  const [capabilities, setCapabilities] = useState({ eye_label: '', title_html: '', items: [emptyCapability()] });
  const [whoUses, setWhoUses] = useState({ eye_label: '', title_html: '', items: [emptyWhoItem()] });
  const [testimonials, setTestimonials] = useState({ eye_label: '', title_html: '', items: [emptyTestimonial()] });
  const [pricing, setPricing] = useState({
    eye_label: '',
    title_html: '',
    card_title: '',
    card_description: '',
    cta_text: '',
    cta_href: '/contact',
  });
  const [cta, setCta] = useState({
    title_html: '',
    subtitle: '',
    primary_text: '',
    primary_href: '',
    whatsapp_text: '',
    whatsapp_number: '',
    note: '',
  });
  const [footer, setFooter] = useState({ ...ORIGINAL_FOOTER_DEFAULTS, links: ORIGINAL_FOOTER_DEFAULTS.links.map((l) => ({ ...l })) });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('home');
      if (!res.success || !res.content) return;
      const data = res.content;

      if (data.hero) {
        setHero({
          pill_text: data.hero.pill_text ?? '',
          title_html: data.hero.title_html ?? data.hero.title ?? '',
          subtitle: data.hero.subtitle ?? data.hero.bottom_text ?? '',
          cta_primary_text: data.hero.cta_primary_text ?? '',
          cta_primary_href: data.hero.cta_primary_href ?? '',
          cta_secondary_text: data.hero.cta_secondary_text ?? '',
          cta_secondary_href: data.hero.cta_secondary_href ?? '',
          note: data.hero.note ?? '',
        });
      }
      if (data.ticker?.length) setTicker(data.ticker.map((t) => ({ ...emptyTicker(), ...t })));
      if (data.showcase) {
        setShowcase({
          eye_label: data.showcase.eye_label ?? '',
          title_html: data.showcase.title_html ?? data.showcase.heading ?? '',
          cta_text: data.showcase.cta_text ?? '',
          cta_href: data.showcase.cta_href ?? '/gallery',
        });
      }
      if (data.how) {
        setHow({
          eye_label: data.how.eye_label ?? '',
          title_html: data.how.title_html ?? '',
          steps: (data.how.steps?.length ? data.how.steps : [emptyStep()]).map((s, i) => ({
            ...emptyStep(),
            ...s,
            number: s.number ?? String(i + 1).padStart(2, '0'),
          })),
          visual: { label: data.how.visual?.label ?? '', title_html: data.how.visual?.title_html ?? '' },
        });
      } else if (data.how_it_works?.steps?.length) {
        setHow({
          eye_label: 'How it works',
          title_html: '',
          steps: data.how_it_works.steps.slice(0, 3).map((s, i) => ({
            number: String(i + 1).padStart(2, '0'),
            title: s.title ?? '',
            description: s.description ?? '',
          })),
          visual: { label: 'One upload', title_html: '' },
        });
      }
      if (data.output) {
        setOutput({
          eye_label: data.output.eye_label ?? '',
          title_html: data.output.title_html ?? '',
          items: (data.output.items?.length ? data.output.items : [emptyOutputItem()]).map((i) => ({ ...emptyOutputItem(), ...i })),
        });
      }
      if (data.capabilities) {
        setCapabilities({
          eye_label: data.capabilities.eye_label ?? '',
          title_html: data.capabilities.title_html ?? '',
          items: (data.capabilities.items?.length ? data.capabilities.items : [emptyCapability()]).map((i) => ({
            ...emptyCapability(),
            ...i,
            pills: i.pills ?? [],
          })),
        });
      } else if (data.features?.length) {
        setCapabilities({
          eye_label: 'Capabilities',
          title_html: '',
          items: data.features.map((f, index) => ({
            tag: f.icon ?? `Feature ${index + 1}`,
            title: f.title ?? '',
            description: f.description ?? '',
            pills: f.pills ?? [],
            highlighted: index < 2,
          })),
        });
      }
      if (data.who_uses) {
        setWhoUses({
          eye_label: data.who_uses.eye_label ?? '',
          title_html: data.who_uses.title_html ?? '',
          items: (data.who_uses.items?.length ? data.who_uses.items : [emptyWhoItem()]).map((i) => ({
            ...emptyWhoItem(),
            ...i,
            pills: i.pills ?? [],
          })),
        });
      }
      if (data.testimonials) {
        setTestimonials({
          eye_label: data.testimonials.eye_label ?? '',
          title_html: data.testimonials.title_html ?? '',
          items: (data.testimonials.items?.length ? data.testimonials.items : [emptyTestimonial()]).map((i) => ({ ...emptyTestimonial(), ...i })),
        });
      }
      if (data.pricing) setPricing({ ...pricing, ...data.pricing });
      if (data.cta) {
        const waHref = data.cta.whatsapp_href ?? '';
        const waMatch = waHref.match(/wa\.me\/([^/?]+)/);
        setCta({
          title_html: data.cta.title_html ?? '',
          subtitle: data.cta.subtitle ?? '',
          primary_text: data.cta.primary_text ?? '',
          primary_href: data.cta.primary_href ?? '',
          whatsapp_text: data.cta.whatsapp_text ?? '',
          whatsapp_number: data.cta.whatsapp_number ?? (waMatch ? waMatch[1] : ''),
          note: data.cta.note ?? '',
        });
      }
      if (data.footer) {
        const isLegacyLinks = data.footer.links && typeof data.footer.links === 'object' && !Array.isArray(data.footer.links);
        const links = Array.isArray(data.footer.links) && data.footer.links.length && !isLegacyLinks
          ? data.footer.links.map((l) => ({ label: l.label ?? '', href: l.href ?? '' }))
          : ORIGINAL_FOOTER_DEFAULTS.links.map((l) => ({ ...l }));
        const logo = data.footer.logo_url;
        const usePresetLogo = !logo || logo === '/images/logo-splash.png' || logo === '/images/logo-Splash.png';
        setFooter({
          logo_url: usePresetLogo ? FOOTER_LOGO_PRESET : logo,
          copyright: data.footer.copyright ?? ORIGINAL_FOOTER_DEFAULTS.copyright,
          links,
        });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  const buildWhatsappHref = (number) => {
    const digits = String(number || '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  };

  const getSectionPayload = () => {
    switch (tab) {
      case 'hero':
        return hero;
      case 'ticker':
        return ticker.filter((t) => t.strong || t.span);
      case 'showcase':
        return { ...showcase, cta_href: showcase.cta_href || '/gallery' };
      case 'how':
        return how;
      case 'output':
        return { ...output, items: output.items.filter((i) => i.title || i.description) };
      case 'capabilities':
        return { ...capabilities, items: capabilities.items.filter((i) => i.title || i.description) };
      case 'who_uses':
        return { ...whoUses, items: whoUses.items.filter((i) => i.title || i.description) };
      case 'testimonials':
        return { ...testimonials, items: testimonials.items.filter((i) => i.quote_html || i.name) };
      case 'pricing':
        return pricing;
      case 'cta':
        return {
          ...cta,
          whatsapp_href: buildWhatsappHref(cta.whatsapp_number),
        };
      case 'footer':
        return { ...footer, links: footer.links.filter((l) => l.label || l.href) };
      default:
        return null;
    }
  };

  const saveSection = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await homepageAPI.getPageContentAdmin('home');
      const full = res.success && res.content ? res.content : {};
      const payload = getSectionPayload();
      const updated = { ...full, [tab]: payload };
      if (tab === 'showcase' && updated.showcase) {
        delete updated.showcase.images;
      }
      await homepageAPI.updatePageContent('home', updated);
      setMessage({ type: 'success', text: 'Saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleFooterLogoUpload = async (file) => {
    if (!file) return;
    try {
      const { url } = await homepageAPI.uploadContentImage(file);
      setFooter((prev) => ({ ...prev, logo_url: url }));
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Upload failed' });
    }
  };

  const inputClass = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  const hintClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

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
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Edit all homepage sections. Showcase images are managed in{' '}
          <Link href="/dashboard/home-page/public-gallery" className="text-blue-600 hover:underline inline-flex items-center gap-1">
            Public Gallery <ExternalLink size={14} />
          </Link>
          .
        </p>
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
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        {tab === 'hero' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hero</h2>
            <div><label className={labelClass}>Pill text</label><input type="text" value={hero.pill_text} onChange={(e) => setHero({ ...hero, pill_text: e.target.value })} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Title (HTML allowed)</label>
              <textarea value={hero.title_html} onChange={(e) => setHero({ ...hero, title_html: e.target.value })} rows={3} className={inputClass} />
              <p className={hintClass}>Use &lt;br /&gt; for line breaks and &lt;em&gt; for italic/gold text.</p>
            </div>
            <div><label className={labelClass}>Subtitle</label><textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} rows={2} className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Primary CTA text</label><input type="text" value={hero.cta_primary_text} onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Primary CTA link</label><input type="text" value={hero.cta_primary_href} onChange={(e) => setHero({ ...hero, cta_primary_href: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Secondary CTA text</label><input type="text" value={hero.cta_secondary_text} onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Secondary CTA link</label><input type="text" value={hero.cta_secondary_href} onChange={(e) => setHero({ ...hero, cta_secondary_href: e.target.value })} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Note below buttons</label><input type="text" value={hero.note} onChange={(e) => setHero({ ...hero, note: e.target.value })} className={inputClass} /></div>
          </>
        )}

        {tab === 'ticker' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ticker</h2>
              <button type="button" onClick={() => setTicker((p) => [...p, emptyTicker()])} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"><Plus size={16} /> Add item</button>
            </div>
            {ticker.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input type="text" value={item.strong} onChange={(e) => setTicker((p) => p.map((t, i) => (i === index ? { ...t, strong: e.target.value } : t)))} placeholder="Bold text" className={inputClass} />
                <input type="text" value={item.span} onChange={(e) => setTicker((p) => p.map((t, i) => (i === index ? { ...t, span: e.target.value } : t)))} placeholder="Light text" className={inputClass} />
                {ticker.length > 1 && <button type="button" onClick={() => setTicker((p) => p.filter((_, i) => i !== index))} className="text-red-600 p-2"><Trash2 size={16} /></button>}
              </div>
            ))}
          </>
        )}

        {tab === 'showcase' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Showcase Text</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              Images in the showcase grid come from <strong>Public Gallery → Homepage Showcase</strong>. This tab only edits headings and the View All button.
            </p>
            <div><label className={labelClass}>Section label</label><input type="text" value={showcase.eye_label} onChange={(e) => setShowcase({ ...showcase, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={showcase.title_html} onChange={(e) => setShowcase({ ...showcase, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>View all button text</label><input type="text" value={showcase.cta_text} onChange={(e) => setShowcase({ ...showcase, cta_text: e.target.value })} className={inputClass} /></div>
              <div>
                <label className={labelClass}>View all link</label>
                <input type="text" value={showcase.cta_href} onChange={(e) => setShowcase({ ...showcase, cta_href: e.target.value })} className={inputClass} placeholder="/gallery" />
                <p className={hintClass}>Links to the public gallery page. Images are managed separately.</p>
              </div>
            </div>
          </>
        )}

        {tab === 'how' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">How It Works</h2>
            <div><label className={labelClass}>Section label</label><input type="text" value={how.eye_label} onChange={(e) => setHow({ ...how, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={how.title_html} onChange={(e) => setHow({ ...how, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            <div className="space-y-3">
              <label className={labelClass}>Steps</label>
              {how.steps.map((step, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <input type="text" value={step.number} onChange={(e) => setHow({ ...how, steps: how.steps.map((s, i) => (i === index ? { ...s, number: e.target.value } : s)) })} className={`${inputClass} w-20`} placeholder="01" />
                    <input type="text" value={step.title} onChange={(e) => setHow({ ...how, steps: how.steps.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)) })} className={inputClass} placeholder="Step title" />
                  </div>
                  <textarea value={step.description} onChange={(e) => setHow({ ...how, steps: how.steps.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)) })} rows={2} className={inputClass} placeholder="Description" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div><label className={labelClass}>Visual panel label</label><input type="text" value={how.visual.label} onChange={(e) => setHow({ ...how, visual: { ...how.visual, label: e.target.value } })} className={inputClass} /></div>
              <div><label className={labelClass}>Visual panel title (HTML)</label><textarea value={how.visual.title_html} onChange={(e) => setHow({ ...how, visual: { ...how.visual, title_html: e.target.value } })} rows={2} className={inputClass} /></div>
            </div>
          </>
        )}

        {tab === 'output' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">What You Can Create</h2>
              <button type="button" onClick={() => setOutput({ ...output, items: [...output.items, emptyOutputItem()] })} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"><Plus size={16} /> Add card</button>
            </div>
            <div><label className={labelClass}>Section label</label><input type="text" value={output.eye_label} onChange={(e) => setOutput({ ...output, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={output.title_html} onChange={(e) => setOutput({ ...output, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            {output.items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-500">Card {index + 1}</span>{output.items.length > 1 && <button type="button" onClick={() => setOutput({ ...output, items: output.items.filter((_, i) => i !== index) })} className="text-red-600"><Trash2 size={16} /></button>}</div>
                <input type="text" value={item.title} onChange={(e) => setOutput({ ...output, items: output.items.map((it, i) => (i === index ? { ...it, title: e.target.value } : it)) })} className={inputClass} placeholder="Title" />
                <textarea value={item.description} onChange={(e) => setOutput({ ...output, items: output.items.map((it, i) => (i === index ? { ...it, description: e.target.value } : it)) })} rows={2} className={inputClass} placeholder="Description" />
              </div>
            ))}
          </>
        )}

        {tab === 'capabilities' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Capabilities</h2>
              <button type="button" onClick={() => setCapabilities({ ...capabilities, items: [...capabilities.items, emptyCapability()] })} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"><Plus size={16} /> Add card</button>
            </div>
            <div><label className={labelClass}>Section label</label><input type="text" value={capabilities.eye_label} onChange={(e) => setCapabilities({ ...capabilities, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={capabilities.title_html} onChange={(e) => setCapabilities({ ...capabilities, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            {capabilities.items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Card {index + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!item.highlighted} onChange={(e) => setCapabilities({ ...capabilities, items: capabilities.items.map((it, i) => (i === index ? { ...it, highlighted: e.target.checked } : it)) })} /> Highlighted</label>
                    {capabilities.items.length > 1 && <button type="button" onClick={() => setCapabilities({ ...capabilities, items: capabilities.items.filter((_, i) => i !== index) })} className="text-red-600"><Trash2 size={16} /></button>}
                  </div>
                </div>
                <input type="text" value={item.tag} onChange={(e) => setCapabilities({ ...capabilities, items: capabilities.items.map((it, i) => (i === index ? { ...it, tag: e.target.value } : it)) })} className={inputClass} placeholder="Tag" />
                <input type="text" value={item.title} onChange={(e) => setCapabilities({ ...capabilities, items: capabilities.items.map((it, i) => (i === index ? { ...it, title: e.target.value } : it)) })} className={inputClass} placeholder="Title" />
                <textarea value={item.description} onChange={(e) => setCapabilities({ ...capabilities, items: capabilities.items.map((it, i) => (i === index ? { ...it, description: e.target.value } : it)) })} rows={2} className={inputClass} placeholder="Description" />
                <div>
                  <label className={labelClass}>Pills (one per line)</label>
                  <textarea value={pillsToText(item.pills)} onChange={(e) => setCapabilities({ ...capabilities, items: capabilities.items.map((it, i) => (i === index ? { ...it, pills: textToPills(e.target.value) } : it)) })} rows={2} className={inputClass} />
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'who_uses' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Who Uses Splash</h2>
              <button type="button" onClick={() => setWhoUses({ ...whoUses, items: [...whoUses.items, emptyWhoItem()] })} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"><Plus size={16} /> Add card</button>
            </div>
            <div><label className={labelClass}>Section label</label><input type="text" value={whoUses.eye_label} onChange={(e) => setWhoUses({ ...whoUses, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={whoUses.title_html} onChange={(e) => setWhoUses({ ...whoUses, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            {whoUses.items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-500">Card {index + 1}</span>{whoUses.items.length > 1 && <button type="button" onClick={() => setWhoUses({ ...whoUses, items: whoUses.items.filter((_, i) => i !== index) })} className="text-red-600"><Trash2 size={16} /></button>}</div>
                <select value={item.icon} onChange={(e) => setWhoUses({ ...whoUses, items: whoUses.items.map((it, i) => (i === index ? { ...it, icon: e.target.value } : it)) })} className={inputClass}>
                  {WHO_ICONS.map((ico) => <option key={ico} value={ico}>{ico}</option>)}
                </select>
                <input type="text" value={item.title} onChange={(e) => setWhoUses({ ...whoUses, items: whoUses.items.map((it, i) => (i === index ? { ...it, title: e.target.value } : it)) })} className={inputClass} placeholder="Title" />
                <textarea value={item.description} onChange={(e) => setWhoUses({ ...whoUses, items: whoUses.items.map((it, i) => (i === index ? { ...it, description: e.target.value } : it)) })} rows={2} className={inputClass} placeholder="Description" />
                <div><label className={labelClass}>Pills (one per line)</label><textarea value={pillsToText(item.pills)} onChange={(e) => setWhoUses({ ...whoUses, items: whoUses.items.map((it, i) => (i === index ? { ...it, pills: textToPills(e.target.value) } : it)) })} rows={2} className={inputClass} /></div>
              </div>
            ))}
          </>
        )}

        {tab === 'testimonials' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Testimonials</h2>
              <button type="button" onClick={() => setTestimonials({ ...testimonials, items: [...testimonials.items, emptyTestimonial()] })} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg"><Plus size={16} /> Add testimonial</button>
            </div>
            <div><label className={labelClass}>Section label</label><input type="text" value={testimonials.eye_label} onChange={(e) => setTestimonials({ ...testimonials, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={testimonials.title_html} onChange={(e) => setTestimonials({ ...testimonials, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            {testimonials.items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                <div className="flex justify-between"><span className="text-sm text-gray-500">Testimonial {index + 1}</span>{testimonials.items.length > 1 && <button type="button" onClick={() => setTestimonials({ ...testimonials, items: testimonials.items.filter((_, i) => i !== index) })} className="text-red-600"><Trash2 size={16} /></button>}</div>
                <textarea value={item.quote_html} onChange={(e) => setTestimonials({ ...testimonials, items: testimonials.items.map((it, i) => (i === index ? { ...it, quote_html: e.target.value } : it)) })} rows={3} className={inputClass} placeholder='Quote (HTML, use &lt;strong&gt; for emphasis)' />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={item.initials} onChange={(e) => setTestimonials({ ...testimonials, items: testimonials.items.map((it, i) => (i === index ? { ...it, initials: e.target.value } : it)) })} className={inputClass} placeholder="Initials" />
                  <input type="text" value={item.name} onChange={(e) => setTestimonials({ ...testimonials, items: testimonials.items.map((it, i) => (i === index ? { ...it, name: e.target.value } : it)) })} className={inputClass} placeholder="Name" />
                  <input type="text" value={item.role} onChange={(e) => setTestimonials({ ...testimonials, items: testimonials.items.map((it, i) => (i === index ? { ...it, role: e.target.value } : it)) })} className={inputClass} placeholder="Role" />
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'pricing' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing</h2>
            <div><label className={labelClass}>Section label</label><input type="text" value={pricing.eye_label} onChange={(e) => setPricing({ ...pricing, eye_label: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={pricing.title_html} onChange={(e) => setPricing({ ...pricing, title_html: e.target.value })} rows={2} className={inputClass} /></div>
            <div><label className={labelClass}>Card title</label><textarea value={pricing.card_title} onChange={(e) => setPricing({ ...pricing, card_title: e.target.value })} rows={2} className={inputClass} /></div>
            <div><label className={labelClass}>Card description</label><textarea value={pricing.card_description} onChange={(e) => setPricing({ ...pricing, card_description: e.target.value })} rows={2} className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Button text</label><input type="text" value={pricing.cta_text} onChange={(e) => setPricing({ ...pricing, cta_text: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Button link</label><input type="text" value={pricing.cta_href} onChange={(e) => setPricing({ ...pricing, cta_href: e.target.value })} className={inputClass} /></div>
            </div>
          </>
        )}

        {tab === 'cta' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">CTA & WhatsApp</h2>
            <div><label className={labelClass}>Title (HTML)</label><textarea value={cta.title_html} onChange={(e) => setCta({ ...cta, title_html: e.target.value })} rows={3} className={inputClass} /></div>
            <div><label className={labelClass}>Subtitle</label><textarea value={cta.subtitle} onChange={(e) => setCta({ ...cta, subtitle: e.target.value })} rows={2} className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Primary button text</label><input type="text" value={cta.primary_text} onChange={(e) => setCta({ ...cta, primary_text: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Primary button link</label><input type="text" value={cta.primary_href} onChange={(e) => setCta({ ...cta, primary_href: e.target.value })} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>WhatsApp button text</label><input type="text" value={cta.whatsapp_text} onChange={(e) => setCta({ ...cta, whatsapp_text: e.target.value })} className={inputClass} /></div>
              <div>
                <label className={labelClass}>WhatsApp number</label>
                <input type="text" value={cta.whatsapp_number} onChange={(e) => setCta({ ...cta, whatsapp_number: e.target.value })} className={inputClass} placeholder="+918861308898" />
                <p className={hintClass}>Include country code, e.g. +91 8861308898</p>
              </div>
            </div>
            <div><label className={labelClass}>Note below buttons</label><input type="text" value={cta.note} onChange={(e) => setCta({ ...cta, note: e.target.value })} className={inputClass} /></div>
          </>
        )}

        {tab === 'footer' && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Footer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Original homepage footer: logo, four links (Instagram, Privacy, Terms, Contact), and copyright.
            </p>
            <div>
              <label className={labelClass}>Logo URL</label>
              <div className="flex gap-2">
                <input type="text" value={footer.logo_url} onChange={(e) => setFooter({ ...footer, logo_url: e.target.value })} className={inputClass} placeholder={FOOTER_LOGO_PRESET} />
                <button
                  type="button"
                  onClick={() => setFooter({ ...footer, logo_url: FOOTER_LOGO_PRESET })}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0"
                >
                  Use logo preset
                </button>
                <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer text-sm shrink-0">
                  <Upload size={16} /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFooterLogoUpload(e.target.files?.[0])} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Copyright (HTML allowed)</label>
              <textarea value={footer.copyright} onChange={(e) => setFooter({ ...footer, copyright: e.target.value })} rows={2} className={inputClass} />
              <p className={hintClass}>Use &lt;br /&gt; for line breaks and &lt;em&gt; for italic/gold text.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Footer links</label>
                <button type="button" onClick={() => setFooter({ ...footer, links: [...footer.links, emptyFooterLink()] })} className="flex items-center gap-1 text-sm text-blue-600"><Plus size={14} /> Add link</button>
              </div>
              <p className={hintClass + ' mb-2'}>Link labels support &lt;br /&gt; and &lt;em&gt; (italic/gold). Links/URLs stay plain text.</p>
              {footer.links.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" value={link.label} onChange={(e) => setFooter({ ...footer, links: footer.links.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)) })} className={`${inputClass} w-40`} placeholder="Label (HTML ok)" />
                  <input type="text" value={link.href} onChange={(e) => setFooter({ ...footer, links: footer.links.map((l, i) => (i === index ? { ...l, href: e.target.value } : l)) })} className={inputClass} placeholder="/privacy" />
                  {footer.links.length > 1 && <button type="button" onClick={() => setFooter({ ...footer, links: footer.links.filter((_, i) => i !== index) })} className="text-red-600 p-2"><Trash2 size={16} /></button>}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={saveSection} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save {TABS.find((t) => t.id === tab)?.label || tab}
          </button>
        </div>
      </div>
    </div>
  );
}
