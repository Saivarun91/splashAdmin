'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { homepageAPI } from '@/lib/api';
import { buildMediaUrl, isHttpUrl } from '@/utils/imagehelper';
import IconPicker, { LucideIconByName } from './IconPicker';
import BlogDescriptionEditor from '../blog/BlogDescriptionEditor';
import { sanitizeBlogEditorHtml } from '@/lib/sanitizeBlogEditorHtml';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300';

function toStoredHtml(html) {
  return String(sanitizeBlogEditorHtml(html || '')).replace(
    /(https?:\/\/[^"'/]+)?\/media\//gi,
    '/media/'
  );
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function emptyForm() {
  return {
    type: 'PRODUCT',
    name: '',
    slug: '',
    primary_keyword: '',
    seo_description: '',
    status: 'Draft',
    hero: { title: '', tagline: '', image: '' },
    why: { eyebrow: '', title: '', body: '' },
    article: { title: '', body: '' },
    generate_title: '',
    generate_subtitle: '',
    visuals_title: '',
    visuals_subtitle: '',
    ecommerce_title: '',
    ecommerce_subtitle: '',
    faq_title: '',
    generate_card_ids: [],
    visuals: [],
    aspect_ratio_ids: [],
    ecommerce_use_case_ids: [],
    faqs: [],
    cta: { title: '', tagline: '' },
  };
}

function resolveSrc(src) {
  if (!src) return '';
  if (src.startsWith('blob:') || isHttpUrl(src)) return src;
  return buildMediaUrl(src);
}

function moveItem(list, index, direction) {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next.map((item, i) => ({ ...item, sort_order: i }));
}

function Section({ title, open, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="space-y-4 border-t border-gray-100 px-5 py-5 dark:border-gray-800">{children}</div> : null}
    </section>
  );
}

export default function LandingPageForm({ mode = 'create', pageId = null }) {
  const router = useRouter();
  const slugTouched = useRef(false);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [generateCards, setGenerateCards] = useState([]);
  const [ecommerceCards, setEcommerceCards] = useState([]);
  const [aspectRatios, setAspectRatios] = useState([]);
  const [openSections, setOpenSections] = useState({
    details: true,
    hero: true,
    why: false,
    generate: false,
    visuals: false,
    ratios: false,
    article: false,
    ecommerce: false,
    faqs: false,
    cta: false,
  });
  const [cardModal, setCardModal] = useState(null);
  const [cardForm, setCardForm] = useState({ icon: 'Sparkles', title: '', tagline: '', description: '' });
  const [cardSaving, setCardSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingVisual, setUploadingVisual] = useState(false);

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const loadLibraries = async () => {
    const [gen, ecom, ratios] = await Promise.all([
      homepageAPI.listGenerateCards(),
      homepageAPI.listEcommerceCards(),
      homepageAPI.listAspectRatios(),
    ]);
    if (gen.status !== false) setGenerateCards(gen.data?.cards || []);
    if (ecom.status !== false) setEcommerceCards(ecom.data?.cards || []);
    if (ratios.status !== false) setAspectRatios(ratios.data?.ratios || []);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadLibraries();
        if (mode === 'edit' && pageId) {
          const res = await homepageAPI.getLandingPage(pageId);
          if (res.status === false) throw new Error(res.message || 'Failed to load page');
          const page = res.data?.page;
          if (!page) throw new Error('Landing page not found');
          if (cancelled) return;
          slugTouched.current = true;
          setForm({
            type: page.type || 'PRODUCT',
            name: page.name || '',
            slug: page.slug || '',
            primary_keyword: page.primary_keyword || '',
            seo_description: page.seo_description || '',
            status: page.status || 'Draft',
            hero: {
              title: page.hero?.title || '',
              tagline: page.hero?.tagline || '',
              image: page.hero?.image || '',
            },
            why: {
              eyebrow: page.why?.eyebrow || '',
              title: page.why?.title || '',
              body: page.why?.body || page.why?.intro || '',
            },
            article: {
              title: page.article?.title || '',
              body: page.article?.body || '',
            },
            generate_title: page.generate_title || '',
            generate_subtitle: page.generate_subtitle || '',
            visuals_title: page.visuals_title || '',
            visuals_subtitle: page.visuals_subtitle || '',
            ecommerce_title: page.ecommerce_title || '',
            ecommerce_subtitle: page.ecommerce_subtitle || '',
            faq_title: page.faq_title || '',
            generate_card_ids: page.generate_card_ids || [],
            visuals: page.visuals || [],
            aspect_ratio_ids: page.aspect_ratio_ids || [],
            ecommerce_use_case_ids: page.ecommerce_use_case_ids || [],
            faqs: page.faqs || [],
            cta: {
              title: page.cta?.title || '',
              tagline: page.cta?.tagline || '',
            },
          });
        }
      } catch (e) {
        toast.error(e.message || 'Failed to load editor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, pageId]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const payload = () => ({
    ...form,
    generate_card_ids: form.generate_card_ids.map((row, i) => ({
      id: row.id,
      sort_order: i,
    })),
    ecommerce_use_case_ids: form.ecommerce_use_case_ids.map((row, i) => ({
      id: row.id,
      sort_order: i,
    })),
    aspect_ratio_ids: form.aspect_ratio_ids.map((row, i) => ({
      id: row.id,
      sort_order: i,
    })),
    visuals: form.visuals.map((row, i) => ({ ...row, sort_order: i })),
    faqs: form.faqs.map((row, i) => ({ ...row, sort_order: i })),
    why: {
      eyebrow: form.why.eyebrow,
      title: form.why.title,
      body: toStoredHtml(form.why.body),
    },
    article: {
      title: form.article.title,
      body: toStoredHtml(form.article.body),
    },
  });

  const save = async (nextStatus) => {
    try {
      setSaving(true);
      const body = payload();
      if (nextStatus) body.status = nextStatus;
      const res =
        mode === 'edit'
          ? await homepageAPI.updateLandingPage(pageId, body)
          : await homepageAPI.createLandingPage(body);
      if (res.status === false) throw new Error(res.message || 'Save failed');
      const page = res.data?.page;
      toast.success(res.message || 'Saved');
      if (mode === 'create' && page?.id) {
        router.replace(`/dashboard/home-page/landing-pages/${page.id}`);
        return;
      }
      if (page) {
        setField('status', page.status || body.status);
      }
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file, setterBusy) => {
    if (!file) return '';
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.type && !allowed.includes(file.type)) {
      throw new Error('Please upload a JPG, PNG, WEBP, or GIF image');
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image must be 8MB or smaller');
    }
    setterBusy(true);
    try {
      const res = await homepageAPI.uploadContentImage(file);
      if (res.success === false || (!res.url && !res.data?.url)) {
        throw new Error(res.error || res.message || 'Upload failed');
      }
      return res.url || res.data?.url;
    } finally {
      setterBusy(false);
    }
  };

  const handleInlineImage = async (file) => {
    try {
      const url = await uploadImage(file, () => {});
      return url.startsWith('/media/') ? buildMediaUrl(url) : url;
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      return null;
    }
  };

  const selectedGenerateIds = new Set(form.generate_card_ids.map((r) => r.id));
  const selectedEcommerceIds = new Set(form.ecommerce_use_case_ids.map((r) => r.id));
  const selectedRatioIds = new Set(form.aspect_ratio_ids.map((r) => r.id));

  const toggleGenerate = (card) => {
    if (selectedGenerateIds.has(card.id)) {
      setField(
        'generate_card_ids',
        form.generate_card_ids.filter((r) => r.id !== card.id)
      );
      return;
    }
    if (form.generate_card_ids.length >= 6) {
      toast.error('You can select a maximum of 6 cards for this section.');
      return;
    }
    setField('generate_card_ids', [...form.generate_card_ids, { id: card.id, sort_order: form.generate_card_ids.length }]);
  };

  const toggleEcommerce = (card) => {
    if (selectedEcommerceIds.has(card.id)) {
      setField(
        'ecommerce_use_case_ids',
        form.ecommerce_use_case_ids.filter((r) => r.id !== card.id)
      );
      return;
    }
    if (form.ecommerce_use_case_ids.length >= 6) {
      toast.error('You can select a maximum of 6 cards for this section.');
      return;
    }
    setField('ecommerce_use_case_ids', [
      ...form.ecommerce_use_case_ids,
      { id: card.id, sort_order: form.ecommerce_use_case_ids.length },
    ]);
  };

  const toggleRatio = (ratio) => {
    if (selectedRatioIds.has(ratio.id)) {
      setField(
        'aspect_ratio_ids',
        form.aspect_ratio_ids.filter((r) => r.id !== ratio.id)
      );
      return;
    }
    setField('aspect_ratio_ids', [...form.aspect_ratio_ids, { id: ratio.id, sort_order: form.aspect_ratio_ids.length }]);
  };

  const openCardModal = (kind, existing = null) => {
    setCardForm({
      id: existing?.id,
      icon: existing?.icon || (kind === 'ecommerce' ? 'ShoppingBag' : 'Sparkles'),
      title: existing?.title || '',
      tagline: existing?.tagline || '',
      description: existing?.description || '',
    });
    setCardModal(kind);
  };

  const saveLibraryCard = async () => {
    try {
      setCardSaving(true);
      if (!cardForm.title.trim()) throw new Error('Title is required');
      if (cardModal === 'generate') {
        if (!cardForm.tagline.trim()) throw new Error('Tagline is required');
        const body = { icon: cardForm.icon, title: cardForm.title, tagline: cardForm.tagline };
        const res = cardForm.id
          ? await homepageAPI.updateGenerateCard(cardForm.id, body)
          : await homepageAPI.createGenerateCard(body);
        if (res.status === false) throw new Error(res.message || 'Could not save card');
      } else {
        if (!cardForm.description.trim()) throw new Error('Description is required');
        const body = { icon: cardForm.icon, title: cardForm.title, description: cardForm.description };
        const res = cardForm.id
          ? await homepageAPI.updateEcommerceCard(cardForm.id, body)
          : await homepageAPI.createEcommerceCard(body);
        if (res.status === false) throw new Error(res.message || 'Could not save card');
      }
      toast.success('Card saved');
      setCardModal(null);
      await loadLibraries();
    } catch (e) {
      toast.error(e.message || 'Could not save card');
    } finally {
      setCardSaving(false);
    }
  };

  const deleteLibraryCard = async (kind, id) => {
    try {
      const res =
        kind === 'generate'
          ? await homepageAPI.deleteGenerateCard(id)
          : await homepageAPI.deleteEcommerceCard(id);
      if (res.status === false) throw new Error(res.message || 'Delete failed');
      if (kind === 'generate') {
        setField(
          'generate_card_ids',
          form.generate_card_ids.filter((r) => r.id !== id)
        );
      } else {
        setField(
          'ecommerce_use_case_ids',
          form.ecommerce_use_case_ids.filter((r) => r.id !== id)
        );
      }
      toast.success('Card deleted');
      await loadLibraries();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const preview = async () => {
    try {
      if (mode === 'create') {
        await save('Draft');
        return;
      }
      router.push(`/dashboard/home-page/landing-pages/${pageId}/preview`);
    } catch (e) {
      toast.error(e.message || 'Preview failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const orderedGenerate = form.generate_card_ids
    .map((ref) => generateCards.find((c) => c.id === ref.id))
    .filter(Boolean);
  const orderedEcommerce = form.ecommerce_use_case_ids
    .map((ref) => ecommerceCards.find((c) => c.id === ref.id))
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/home-page/landing-pages"
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to landing pages
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Edit Landing Page' : 'Create Landing Page'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(form.status === 'Published' ? 'Published' : 'Draft')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : form.status === 'Published' ? 'Save' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={preview}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
          >
            Preview
          </button>
          {form.status === 'Published' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => save('Draft')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => save('Published')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <Section title="Page Details" open={openSections.details} onToggle={() => toggleSection('details')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Page Type</label>
            <select
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
              className={inputClass}
            >
              <option value="FEATURE">Feature Page</option>
              <option value="PRODUCT">Product Page</option>
              <option value="INDUSTRY">Industry Page</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <input value={form.status} readOnly className={`${inputClass} bg-gray-50 dark:bg-gray-800`} />
          </div>
          <div>
            <label className={labelClass}>Page Name</label>
            <input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug: slugTouched.current ? prev.slug : slugify(name),
                }));
              }}
              className={inputClass}
              placeholder="AI Ring Product Photography"
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              value={form.slug}
              onChange={(e) => {
                slugTouched.current = true;
                setField('slug', slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="ai-ring-product-photography"
            />
          </div>
          <div>
            <label className={labelClass}>Primary Keyword</label>
            <input
              value={form.primary_keyword}
              onChange={(e) => setField('primary_keyword', e.target.value)}
              className={inputClass}
              placeholder="AI ring product photography"
            />
          </div>
          <div>
            <label className={labelClass}>SEO Description</label>
            <textarea
              rows={2}
              value={form.seo_description}
              onChange={(e) => setField('seo_description', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Hero" open={openSections.hero} onToggle={() => toggleSection('hero')}>
        <p className="text-sm text-gray-500">Primary keyword is taken from Page Details. CTAs are fixed: Get Started and View Themes.</p>
        <div>
          <label className={labelClass}>Hero Title</label>
          <input
            value={form.hero.title}
            onChange={(e) => setForm((prev) => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
            className={inputClass}
            placeholder="Your rings. Studio-quality visuals."
          />
        </div>
        <div>
          <label className={labelClass}>Hero Tagline</label>
          <textarea
            rows={2}
            value={form.hero.tagline}
            onChange={(e) => setForm((prev) => ({ ...prev, hero: { ...prev.hero, tagline: e.target.value } }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Hero Image</label>
          {form.hero.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveSrc(form.hero.image)} alt="" className="mb-3 h-40 rounded-lg object-cover" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            disabled={uploadingHero}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              try {
                const url = await uploadImage(file, setUploadingHero);
                setForm((prev) => ({ ...prev, hero: { ...prev.hero, image: url } }));
              } catch (err) {
                toast.error(err.message || 'Upload failed');
              }
            }}
          />
        </div>
      </Section>

      <Section title="Why This Matters" open={openSections.why} onToggle={() => toggleSection('why')}>
        <p className="text-sm text-gray-500">
          Write the article like the public page: headings, paragraphs, lists, and links. This uses the same editor as Blog.
        </p>
        <div>
          <label className={labelClass}>Hero eyebrow (optional)</label>
          <input
            value={form.why.eyebrow}
            onChange={(e) => setForm((prev) => ({ ...prev, why: { ...prev.why, eyebrow: e.target.value } }))}
            className={inputClass}
            placeholder="AI Jewellery Product Shoot"
          />
        </div>
        <div>
          <label className={labelClass}>Section Title</label>
          <input
            value={form.why.title}
            onChange={(e) => setForm((prev) => ({ ...prev, why: { ...prev.why, title: e.target.value } }))}
            className={inputClass}
            placeholder="Why ring product photography matters for ecommerce brands"
          />
        </div>
        <div>
          <label className={labelClass}>Article</label>
          <BlogDescriptionEditor
            value={form.why.body}
            onChange={(html) => setForm((prev) => ({ ...prev, why: { ...prev.why, body: html } }))}
            onInlineImage={handleInlineImage}
          />
        </div>
      </Section>

      <Section title="What We Generate" open={openSections.generate} onToggle={() => toggleSection('generate')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Section title</label>
            <input value={form.generate_title} onChange={(e) => setField('generate_title', e.target.value)} className={inputClass} placeholder="What We Generate for Ring" />
          </div>
          <div>
            <label className={labelClass}>Section subtitle</label>
            <input value={form.generate_subtitle} onChange={(e) => setField('generate_subtitle', e.target.value)} className={inputClass} placeholder="Everything you need to sell jewellery online…" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Select up to 6 global cards. Create once, reuse on every page.</p>
          <button type="button" onClick={() => openCardModal('generate')} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
            <Plus size={14} /> Create
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {generateCards.map((card) => (
            <label key={card.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input type="checkbox" checked={selectedGenerateIds.has(card.id)} onChange={() => toggleGenerate(card)} />
              <LucideIconByName name={card.icon} className="mt-0.5 h-4 w-4 text-gray-500" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{card.title}</div>
                <div className="text-xs text-gray-500">{card.tagline}</div>
              </div>
              <button type="button" onClick={(e) => { e.preventDefault(); openCardModal('generate', card); }} className="text-xs text-blue-600">Edit</button>
              <button type="button" onClick={(e) => { e.preventDefault(); deleteLibraryCard('generate', card.id); }} className="text-xs text-red-600">Delete</button>
            </label>
          ))}
        </div>
        {orderedGenerate.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Selected order</p>
            {orderedGenerate.map((card, index) => (
              <div key={card.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                <span>{card.title}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setField('generate_card_ids', moveItem(form.generate_card_ids, index, -1))} className="rounded border px-2 py-1"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => setField('generate_card_ids', moveItem(form.generate_card_ids, index, 1))} className="rounded border px-2 py-1"><ArrowDown size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Section>

      <Section title="Visuals / Themes" open={openSections.visuals} onToggle={() => toggleSection('visuals')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Section title</label>
            <input value={form.visuals_title} onChange={(e) => setField('visuals_title', e.target.value)} className={inputClass} placeholder="Themes for Ring" />
          </div>
          <div>
            <label className={labelClass}>Section subtitle</label>
            <input value={form.visuals_subtitle} onChange={(e) => setField('visuals_subtitle', e.target.value)} className={inputClass} placeholder="Choose from a wide range of studio and lifestyle themes." />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Unlimited page-specific gallery. Public section uses id=&quot;visuals&quot;.</p>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
            <Plus size={14} /> Add Visual
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingVisual}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  const url = await uploadImage(file, setUploadingVisual);
                  setForm((prev) => ({
                    ...prev,
                    visuals: [...prev.visuals, { name: '', image: url }],
                  }));
                } catch (err) {
                  toast.error(err.message || 'Upload failed');
                }
              }}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {form.visuals.map((visual, index) => (
            <div key={visual.id || index} className="space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              {visual.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveSrc(visual.image)} alt={visual.name || ''} className="h-36 w-full rounded object-cover" />
              ) : null}
              <input
                value={visual.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    visuals: prev.visuals.map((v, i) => (i === index ? { ...v, name: e.target.value } : v)),
                  }))
                }
                className={inputClass}
                placeholder="Name (e.g. Blue)"
              />
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded border px-2 py-1 text-xs">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      try {
                        const url = await uploadImage(file, setUploadingVisual);
                        setForm((prev) => ({
                          ...prev,
                          visuals: prev.visuals.map((v, i) => (i === index ? { ...v, image: url } : v)),
                        }));
                      } catch (err) {
                        toast.error(err.message || 'Upload failed');
                      }
                    }}
                  />
                </label>
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, visuals: moveItem(prev.visuals, index, -1) }))} className="rounded border px-2 py-1 text-xs"><ArrowUp size={12} /></button>
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, visuals: moveItem(prev.visuals, index, 1) }))} className="rounded border px-2 py-1 text-xs"><ArrowDown size={12} /></button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, visuals: prev.visuals.filter((_, i) => i !== index) }))}
                  className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Aspect Ratios" open={openSections.ratios} onToggle={() => toggleSection('ratios')}>
        <p className="text-sm text-gray-500">Enable predefined ratios only. Names and descriptions cannot be edited.</p>
        <div className="grid gap-2 md:grid-cols-2">
          {aspectRatios.map((ratio) => (
            <label key={ratio.id} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input type="checkbox" checked={selectedRatioIds.has(ratio.id)} onChange={() => toggleRatio(ratio)} />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{ratio.ratio} · {ratio.name}</div>
                <div className="text-xs text-gray-500">{ratio.description} — {ratio.use_case}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Second Article (after Aspect Ratios)" open={openSections.article} onToggle={() => toggleSection('article')}>
        <p className="text-sm text-gray-500">
          Optional article like “How AI photography improves speed, cost and scalability”. Leave empty to hide it.
        </p>
        <div>
          <label className={labelClass}>Section Title</label>
          <input
            value={form.article.title}
            onChange={(e) => setForm((prev) => ({ ...prev, article: { ...prev.article, title: e.target.value } }))}
            className={inputClass}
            placeholder="How AI product photography improves speed, cost and scalability"
          />
        </div>
        <BlogDescriptionEditor
          value={form.article.body}
          onChange={(html) => setForm((prev) => ({ ...prev, article: { ...prev.article, body: html } }))}
          onInlineImage={handleInlineImage}
        />
      </Section>

      <Section title="Ecommerce Use Cases" open={openSections.ecommerce} onToggle={() => toggleSection('ecommerce')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Section title</label>
            <input value={form.ecommerce_title} onChange={(e) => setField('ecommerce_title', e.target.value)} className={inputClass} placeholder="Ecommerce Ready Visuals" />
          </div>
          <div>
            <label className={labelClass}>Section subtitle</label>
            <input value={form.ecommerce_subtitle} onChange={(e) => setField('ecommerce_subtitle', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Select up to 6 cards from the global ecommerce library.</p>
          <button type="button" onClick={() => openCardModal('ecommerce')} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white">
            <Plus size={14} /> Create
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {ecommerceCards.map((card) => (
            <label key={card.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <input type="checkbox" checked={selectedEcommerceIds.has(card.id)} onChange={() => toggleEcommerce(card)} />
              <LucideIconByName name={card.icon} className="mt-0.5 h-4 w-4 text-gray-500" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{card.title}</div>
                <div className="text-xs text-gray-500">{card.description}</div>
              </div>
              <button type="button" onClick={(e) => { e.preventDefault(); openCardModal('ecommerce', card); }} className="text-xs text-blue-600">Edit</button>
              <button type="button" onClick={(e) => { e.preventDefault(); deleteLibraryCard('ecommerce', card.id); }} className="text-xs text-red-600">Delete</button>
            </label>
          ))}
        </div>
        {orderedEcommerce.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Selected order</p>
            {orderedEcommerce.map((card, index) => (
              <div key={card.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                <span>{card.title}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setField('ecommerce_use_case_ids', moveItem(form.ecommerce_use_case_ids, index, -1))} className="rounded border px-2 py-1"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => setField('ecommerce_use_case_ids', moveItem(form.ecommerce_use_case_ids, index, 1))} className="rounded border px-2 py-1"><ArrowDown size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Section>

      <Section title="FAQs" open={openSections.faqs} onToggle={() => toggleSection('faqs')}>
        <div>
          <label className={labelClass}>Section title</label>
          <input value={form.faq_title} onChange={(e) => setField('faq_title', e.target.value)} className={inputClass} placeholder="Frequently Asked Questions" />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page-specific questions. Basic HTML is allowed in answers.</p>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }))}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            <Plus size={14} /> Add FAQ
          </button>
        </div>
        {form.faqs.map((faq, index) => (
          <div key={faq.id || index} className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setField('faqs', moveItem(form.faqs, index, -1))} className="rounded border px-2 py-1 text-xs"><ArrowUp size={12} /></button>
              <button type="button" onClick={() => setField('faqs', moveItem(form.faqs, index, 1))} className="rounded border px-2 py-1 text-xs"><ArrowDown size={12} /></button>
              <button type="button" onClick={() => setField('faqs', form.faqs.filter((_, i) => i !== index))} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"><Trash2 size={12} /></button>
            </div>
            <input
              value={faq.question}
              onChange={(e) => setField('faqs', form.faqs.map((item, i) => (i === index ? { ...item, question: e.target.value } : item)))}
              className={inputClass}
              placeholder="Question"
            />
            <textarea
              rows={3}
              value={faq.answer}
              onChange={(e) => setField('faqs', form.faqs.map((item, i) => (i === index ? { ...item, answer: e.target.value } : item)))}
              className={inputClass}
              placeholder="Answer"
            />
          </div>
        ))}
      </Section>

      <Section title="Final CTA" open={openSections.cta} onToggle={() => toggleSection('cta')}>
        <p className="text-sm text-gray-500">The Get Started button is fixed and uses the existing signup flow.</p>
        <div>
          <label className={labelClass}>CTA Title</label>
          <input
            value={form.cta.title}
            onChange={(e) => setForm((prev) => ({ ...prev, cta: { ...prev.cta, title: e.target.value } }))}
            className={inputClass}
            placeholder="Ready to transform your jewellery catalog?"
          />
        </div>
        <div>
          <label className={labelClass}>CTA Tagline</label>
          <textarea
            rows={2}
            value={form.cta.tagline}
            onChange={(e) => setForm((prev) => ({ ...prev, cta: { ...prev.cta, tagline: e.target.value } }))}
            className={inputClass}
          />
        </div>
      </Section>

      {cardModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {cardForm.id ? 'Edit card' : 'Create card'}
              </h2>
              <button type="button" onClick={() => setCardModal(null)}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Icon</label>
                <IconPicker
                  value={cardForm.icon}
                  kind={cardModal}
                  onChange={(icon) => setCardForm((prev) => ({ ...prev, icon }))}
                />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input value={cardForm.title} onChange={(e) => setCardForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} />
              </div>
              {cardModal === 'generate' ? (
                <div>
                  <label className={labelClass}>Tagline</label>
                  <textarea rows={2} value={cardForm.tagline} onChange={(e) => setCardForm((prev) => ({ ...prev, tagline: e.target.value }))} className={inputClass} />
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={cardForm.description} onChange={(e) => setCardForm((prev) => ({ ...prev, description: e.target.value }))} className={inputClass} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCardModal(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button type="button" disabled={cardSaving} onClick={saveLibraryCard} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  {cardSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
