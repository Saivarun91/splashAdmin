'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { homepageAPI } from '@/lib/api';
import { buildMediaUrl } from '@/utils/imagehelper';
import {
  BLOG_RENDERED_CONTENT_CLASS,
  BLOG_RENDERED_CONTENT_CSS,
} from '@/lib/blogContentStyles';
import { sanitizeBlogEditorHtml } from '@/lib/sanitizeBlogEditorHtml';

function mediaSrc(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('blob:')) return src;
  return buildMediaUrl(src);
}

export default function BlogViewPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params?.id;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    if (!blogId) return;
    try {
      setLoading(true);
      const res = await homepageAPI.getBlogDetails(blogId);
      if (res.status === false) throw new Error(res.message || 'Failed to load blog');
      setBlog(res.data?.blog || null);
    } catch (e) {
      toast.error(e.message || 'Failed to load blog');
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    load();
  }, [load]);

  const onDownload = async () => {
    if (!blogId) return;
    try {
      setDownloading(true);
      const { blob, filename } = await homepageAPI.downloadBlog(blogId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Blog downloaded');
    } catch (e) {
      toast.error(e.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Blog not found.</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/home-page/blog')}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to blogs
        </button>
      </div>
    );
  }

  const faqs = Array.isArray(blog.faqs) ? blog.faqs : [];

  return (
    <div className="space-y-6">
      <style>{BLOG_RENDERED_CONTENT_CSS}</style>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/home-page/blog"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft size={14} /> Back to blogs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{blog.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {[blog.author, blog.status, blog.slug].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
            Download
          </button>
          <Link
            href={`/dashboard/home-page/blog/${blogId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil size={16} /> Edit
          </Link>
        </div>
      </div>

      {/* Canvas matches the TipTap description editor surface */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {blog.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(blog.picture)}
            alt=""
            className="w-full object-cover"
            style={{ maxHeight: 420 }}
          />
        ) : null}

        <div className="p-4 sm:p-6 md:px-8 md:py-7">
          {blog.short_content ? (
            <p className="mb-5 text-base leading-relaxed text-gray-600">{blog.short_content}</p>
          ) : null}

          <div
            className={BLOG_RENDERED_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: sanitizeBlogEditorHtml(blog.full_content || '') }}
          />

          {faqs.length > 0 ? (
            <section className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">FAQs</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={faq.id || i}>
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                    <div
                      className={`mt-1 ${BLOG_RENDERED_CONTENT_CLASS}`}
                      dangerouslySetInnerHTML={{ __html: faq.answer || '' }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
