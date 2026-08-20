'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { homepageAPI } from '@/lib/api';
import LandingPagePreview from '../../LandingPagePreview';

export default function LandingPagePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.id;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      const res = await homepageAPI.getLandingPage(pageId);
      if (res.status === false) throw new Error(res.message || 'Failed to load page');
      setPage(res.data?.page || null);
    } catch (e) {
      toast.error(e.message || 'Failed to load preview');
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Landing page not found.</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/home-page/landing-pages')}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to landing pages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/home-page/landing-pages"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft size={14} /> Back to landing pages
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{page.name}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {[page.type_label || page.type, page.status, page.slug].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Link
          href={`/dashboard/home-page/landing-pages/${pageId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Pencil size={16} /> Edit
        </Link>
      </div>
      <LandingPagePreview page={page} />
    </div>
  );
}
