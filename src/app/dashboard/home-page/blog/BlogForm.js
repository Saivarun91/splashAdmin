'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { homepageAPI } from '@/lib/api';
import ImageCropModal from '@/components/ImageCropModal';
import BlogDescriptionEditor from './BlogDescriptionEditor';
import { sanitizeBlogEditorHtml } from '@/lib/sanitizeBlogEditorHtml';
import { buildMediaUrl, isHttpUrl } from '@/utils/imagehelper';

const emptyFaq = () => ({ id: undefined, question: '', answer: '' });

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeCid() {
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isHtmlEmpty(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text === '';
}

function resolveBlogHtmlMediaUrls(html) {
  if (!html) return html;
  return html.replace(
    /(<img\b[^>]*\ssrc=["'])(\/media\/[^"']+)(["'])/gi,
    (_, pre, src, post) => `${pre}${buildMediaUrl(src)}${post}`
  );
}

/** Resolve cover preview src for admin (blob / absolute / /media/...). */
function resolvePictureSrc(src) {
  if (!src) return '';
  if (src.startsWith('blob:') || isHttpUrl(src)) return src;
  return buildMediaUrl(src);
}

export default function BlogForm({ mode = 'create', blogId = null }) {
  const router = useRouter();
  const formTopRef = useRef(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');
  const [existingPicture, setExistingPicture] = useState('');
  const [coverCropOpen, setCoverCropOpen] = useState(false);
  const [coverCropSource, setCoverCropSource] = useState(null);
  const [inlineCropOpen, setInlineCropOpen] = useState(false);
  const [inlineCropSource, setInlineCropSource] = useState(null);
  const inlineCropResolverRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const inlineImagesRef = useRef({});
  const slugTouched = useRef(false);
  const [form, setForm] = useState({
    mete_title: '',
    meta_description: '',
    meta_keyword: '',
    title: '',
    is_trending: false,
    slug: '',
    author: '',
    short_content: '',
    full_content: '',
    status: 'Published',
    faqs: [emptyFaq()],
  });

  useEffect(() => {
    if (mode !== 'edit' || !blogId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await homepageAPI.getBlogDetails(blogId);
        if (res.status === false) throw new Error(res.message || 'Failed to load blog');
        const blog = res.data?.blog || {};
        if (cancelled) return;

        const faqs =
          Array.isArray(blog.faqs) && blog.faqs.length
            ? blog.faqs.map((f) => ({
                id: f.id,
                question: f.question || '',
                answer: f.answer || '',
              }))
            : [emptyFaq()];

        setForm({
          mete_title: blog.mete_title || '',
          meta_description: blog.meta_description || '',
          meta_keyword: blog.meta_keyword || '',
          title: blog.title || '',
          is_trending: Boolean(blog.is_trending),
          slug: blog.slug || '',
          author: blog.author || '',
          short_content: blog.short_content || '',
          full_content: resolveBlogHtmlMediaUrls(blog.full_content || ''),
          status: blog.status || 'Published',
          faqs,
        });
        setExistingPicture(blog.picture || '');
        // Keep stored path as-is; resolve to API media URL at render time
        setPicturePreview(blog.picture || '');
        slugTouched.current = Boolean(blog.slug);
      } catch (e) {
        toast.error(e.message || 'Failed to load blog');
        router.push('/dashboard/home-page/blog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, blogId, router]);

  useEffect(() => {
    return () => {
      Object.keys(inlineImagesRef.current).forEach((blobUrl) => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {
          /* ignore */
        }
      });
    };
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched.current ? prev.slug : slugify(value),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.title;
      return next;
    });
  };

  const onPictureChange = (file) => {
    if (!file) return;
    if (!String(file.type || '').startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setCoverCropSource(file);
    setCoverCropOpen(true);
  };

  const applyCoverCrop = (file) => {
    if (picturePreview && picturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(picturePreview);
    }
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
    setCoverCropOpen(false);
    setCoverCropSource(null);
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    setErrors((prev) => {
      if (!prev.picture) return prev;
      const next = { ...prev };
      delete next.picture;
      return next;
    });
  };

  const cancelCoverCrop = () => {
    setCoverCropOpen(false);
    setCoverCropSource(null);
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
  };

  const clearPicture = () => {
    if (picturePreview && picturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(picturePreview);
    }
    setPictureFile(null);
    setPicturePreview('');
    // Keep existingPicture so edit save still works if no replacement is chosen.
    // Reset the file input so the same file can be selected again.
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
  };

  const handleInlineImage = async (file) => {
    if (!file || !String(file.type || '').startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }
    return new Promise((resolve) => {
      inlineCropResolverRef.current = resolve;
      setInlineCropSource(file);
      setInlineCropOpen(true);
    });
  };

  const applyInlineCrop = (file) => {
    const cid = makeCid();
    const blobUrl = URL.createObjectURL(file);
    inlineImagesRef.current[blobUrl] = { cid, file };
    setInlineCropOpen(false);
    setInlineCropSource(null);
    const resolve = inlineCropResolverRef.current;
    inlineCropResolverRef.current = null;
    resolve?.(blobUrl);
  };

  const cancelInlineCrop = () => {
    setInlineCropOpen(false);
    setInlineCropSource(null);
    const resolve = inlineCropResolverRef.current;
    inlineCropResolverRef.current = null;
    resolve?.(null);
  };

  const prepareFullContent = (html) => {
    let content = sanitizeBlogEditorHtml(html || '');
    const attachments = [];
    Object.entries(inlineImagesRef.current).forEach(([blobUrl, meta]) => {
      if (content.includes(blobUrl)) {
        content = content.split(blobUrl).join(`cid:${meta.cid}`);
        attachments.push(meta);
      }
    });
    return { content, attachments };
  };

  const validate = () => {
    const next = {};
    if (!form.mete_title.trim()) next.mete_title = 'Meta title is required';
    if (!form.meta_description.trim()) next.meta_description = 'Meta description is required';
    if (!form.meta_keyword.trim()) next.meta_keyword = 'Meta keyword is required';
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.short_content.trim()) next.short_content = 'Short content is required';
    if (isHtmlEmpty(form.full_content)) next.full_content = 'Description is required';
    if (!form.status.trim()) next.status = 'Status is required';
    if (mode === 'create' && !pictureFile) next.picture = 'Cover image is required';
    if (mode === 'edit' && !pictureFile && !existingPicture) next.picture = 'Cover image is required';

    form.faqs.forEach((faq, idx) => {
      const q = (faq.question || '').trim();
      const a = (faq.answer || '').trim();
      if ((q && !a) || (!q && a)) {
        next[`faq_${idx}`] = 'Both question and answer are required';
      }
    });

    setErrors(next);
    if (Object.keys(next).length > 0) {
      requestAnimationFrame(() => {
        const el = document.querySelector('[data-field-error="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return false;
    }
    return true;
  };

  const buildFormData = () => {
    const fd = new FormData();
    const { content, attachments } = prepareFullContent(form.full_content);
    const slug = (form.slug || '').trim() || slugify(form.title);

    fd.append('mete_title', form.mete_title.trim());
    fd.append('meta_description', form.meta_description.trim());
    fd.append('meta_keyword', form.meta_keyword.trim());
    fd.append('robots', 'index,follow');
    fd.append('title', form.title.trim());
    fd.append('is_trending', form.is_trending ? '1' : '0');
    fd.append('slug', slug);
    fd.append('author', (form.author || '').trim());
    fd.append('short_content', form.short_content.trim());
    fd.append('full_content', content);
    fd.append('status', form.status.trim());

    if (pictureFile) fd.append('picture', pictureFile);

    let faqIndex = 0;
    form.faqs.forEach((faq) => {
      const q = (faq.question || '').trim();
      const a = (faq.answer || '').trim();
      if (!q || !a) return;
      fd.append(`faqs[${faqIndex}][question]`, q);
      fd.append(`faqs[${faqIndex}][answer]`, a);
      if (faq.id != null && faq.id !== '') {
        fd.append(`faqs[${faqIndex}][id]`, String(faq.id));
      }
      faqIndex += 1;
    });

    attachments.forEach(({ cid, file }) => {
      fd.append(`images[${cid}]`, file);
    });

    return fd;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    try {
      setSaving(true);
      const fd = buildFormData();
      console.log(
        'Blog save payload:',
        [...fd.entries()].map(([key, value]) => ({
          key,
          value:
            value instanceof File
              ? { name: value.name, size: value.size, type: value.type }
              : value,
        }))
      );
      if (mode === 'create') {
        const res = await homepageAPI.createBlog(fd);
        toast.success(res.message || 'Blog created');
      } else {
        const res = await homepageAPI.updateBlog(blogId, fd);
        toast.success(res.message || 'Blog updated');
      }
      router.push('/dashboard/home-page/blog');
    } catch (err) {
      toast.error(err.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form ref={formTopRef} onSubmit={onSubmit} className="mx-auto max-w-3xl pb-24">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/home-page/blog"
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={14} /> Back to blogs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Add Blog' : 'Edit Blog'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the fields below. Required fields are marked with <span className="text-red-500">*</span>
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </button>
      </div>

      <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <Field label="Meta Title" required error={errors.mete_title}>
          <input
            value={form.mete_title}
            onChange={(e) => setField('mete_title', e.target.value)}
            className={inputClass(errors.mete_title)}
            placeholder="SEO title"
          />
        </Field>

        <Field label="Meta Description" required error={errors.meta_description}>
          <textarea
            rows={4}
            value={form.meta_description}
            onChange={(e) => setField('meta_description', e.target.value)}
            className={inputClass(errors.meta_description)}
            placeholder="SEO description for search snippets"
          />
        </Field>

        <Field label="Meta Keyword" required error={errors.meta_keyword}>
          <input
            value={form.meta_keyword}
            onChange={(e) => setField('meta_keyword', e.target.value)}
            className={inputClass(errors.meta_keyword)}
            placeholder="keyword1, keyword2"
          />
        </Field>

        <Field label="Title" required error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={inputClass(errors.title)}
            placeholder="Blog title"
          />
        </Field>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Is Trending
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.is_trending}
              onChange={(e) => setField('is_trending', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mark this blog as trending
          </label>
        </div>

        <Field label="Slug">
          <input
            value={form.slug}
            onChange={(e) => {
              slugTouched.current = true;
              setField('slug', e.target.value);
            }}
            placeholder="Auto-generated from title if left blank"
            className={inputClass()}
          />
        </Field>

        <Field label="Upload Image" required error={errors.picture}>
          <div className="space-y-3">
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onPictureChange(e.target.files?.[0])}
              className="block w-full cursor-pointer rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:border-gray-700 dark:bg-gray-950"
            />
            <p className="text-xs text-gray-500">
              After selecting a file you can crop freely. The image is then resized (max 1600×1600) and compressed.
            </p>
            {picturePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePictureSrc(picturePreview)}
                  alt="Cover preview"
                  className="h-32 w-48 rounded-lg border border-gray-200 object-cover bg-gray-50"
                />
                <button
                  type="button"
                  onClick={clearPicture}
                  className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-600 shadow ring-1 ring-gray-200 hover:text-red-600"
                  title="Remove image so you can upload a new one"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No file chosen</p>
            )}
          </div>
        </Field>

        <Field label="Author">
          <input
            value={form.author}
            onChange={(e) => setField('author', e.target.value)}
            placeholder="Enter author name"
            className={inputClass()}
          />
        </Field>

        <Field label="Short Content" required error={errors.short_content}>
          <textarea
            rows={5}
            value={form.short_content}
            onChange={(e) => setField('short_content', e.target.value)}
            className={inputClass(errors.short_content)}
            placeholder="Short summary / excerpt"
          />
        </Field>

        <Field label="Description" required error={errors.full_content}>
          <BlogDescriptionEditor
            value={form.full_content}
            onChange={(html) => setField('full_content', html)}
            onInlineImage={handleInlineImage}
            error={errors.full_content}
          />
        </Field>
      </div>

      <div className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">FAQs</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Optional. Add question and answer pairs for this blog.
          </p>
        </div>

        {form.faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-950/40"
            {...(errors[`faq_${idx}`] ? { 'data-field-error': 'true' } : {})}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">FAQ {idx + 1}</p>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    faqs: prev.faqs.length > 1 ? prev.faqs.filter((_, i) => i !== idx) : [emptyFaq()],
                  }))
                }
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <Field label="Question" error={errors[`faq_${idx}`]}>
              <input
                value={faq.question}
                placeholder="Enter question"
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => {
                    const faqs = [...prev.faqs];
                    faqs[idx] = { ...faqs[idx], question: value };
                    return { ...prev, faqs };
                  });
                  setErrors((prev) => {
                    if (!prev[`faq_${idx}`]) return prev;
                    const next = { ...prev };
                    delete next[`faq_${idx}`];
                    return next;
                  });
                }}
                className={inputClass(errors[`faq_${idx}`])}
              />
            </Field>
            <Field label="Answer" className="mt-3">
              <textarea
                rows={3}
                value={faq.answer}
                placeholder="Enter answer"
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => {
                    const faqs = [...prev.faqs];
                    faqs[idx] = { ...faqs[idx], answer: value };
                    return { ...prev, faqs };
                  });
                  setErrors((prev) => {
                    if (!prev[`faq_${idx}`]) return prev;
                    const next = { ...prev };
                    delete next[`faq_${idx}`];
                    return next;
                  });
                }}
                className={inputClass(errors[`faq_${idx}`])}
              />
            </Field>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, faqs: [...prev.faqs, emptyFaq()] }))}
          className="inline-flex items-center gap-1 rounded-md border border-blue-500 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      <div className="mt-5 space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <Field label="Status" error={errors.status}>
          <select
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
            className={inputClass(errors.status)}
          >
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Unpublished">Unpublished</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </button>
      </div>

      <ImageCropModal
        open={coverCropOpen}
        file={coverCropSource}
        title="Resize cover image"
        onCancel={cancelCoverCrop}
        onComplete={applyCoverCrop}
      />
      <ImageCropModal
        open={inlineCropOpen}
        file={inlineCropSource}
        title="Resize description image"
        onCancel={cancelInlineCrop}
        onComplete={applyInlineCrop}
      />
    </form>
  );
}

function Field({ label, required, error, children, className = '' }) {
  return (
    <div className={className} {...(error ? { 'data-field-error': 'true' } : {})}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function inputClass(error) {
  return `w-full rounded-md border bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white ${
    error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
  }`;
}
