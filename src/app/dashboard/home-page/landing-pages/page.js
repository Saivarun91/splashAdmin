'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { homepageAPI } from '@/lib/api';
import { buildMediaUrl } from '@/utils/imagehelper';

const TYPE_FILTERS = [
  { id: '', label: 'All' },
  { id: 'FEATURE', label: 'Feature' },
  { id: 'PRODUCT', label: 'Product' },
  { id: 'INDUSTRY', label: 'Industry' },
];

const STATUS_FILTERS = [
  { id: '', label: 'All' },
  { id: 'Draft', label: 'Draft' },
  { id: 'Published', label: 'Published' },
];

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

export default function LandingPageList() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const lastQueryRef = useRef('');

  const fetchListing = useCallback(async (page, query, isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      else setIsFetching(true);
      const res = await homepageAPI.listLandingPages(page, query, {
        type: typeFilter,
        status: statusFilter,
      });
      if (res.status === false) throw new Error(res.message || 'Failed to load landing pages');
      const payload = res.data || {};
      setData(Array.isArray(payload.data) ? payload.data : []);
      setTotalPages(payload.last_page || 1);
    } catch (e) {
      toast.error(e.message || 'Failed to load landing pages', { id: 'landing-listing-error' });
      setData([]);
      setTotalPages(1);
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== lastQueryRef.current) {
        lastQueryRef.current = trimmed;
        setCurrentPage(1);
        setDebouncedQuery(trimmed);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchListing(currentPage, debouncedQuery, initialLoading && data.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedQuery, fetchListing]);

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      setDeleting(true);
      const res = await homepageAPI.deleteLandingPage(itemToDelete.id);
      if (res.status === false) throw new Error(res.message || 'Delete failed');
      toast.success(res.message || 'Landing page deleted');
      await fetchListing(currentPage, debouncedQuery);
    } catch (e) {
      toast.error(e.message || 'Failed to delete landing page');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const togglePublish = async (row) => {
    try {
      setStatusBusyId(row.id);
      const res =
        row.status === 'Published'
          ? await homepageAPI.unpublishLandingPage(row.id)
          : await homepageAPI.publishLandingPage(row.id);
      if (res.status === false) throw new Error(res.message || 'Update failed');
      toast.success(res.message || (row.status === 'Published' ? 'Unpublished' : 'Published'));
      await fetchListing(currentPage, debouncedQuery);
    } catch (e) {
      toast.error(e.message || 'Could not update status');
    } finally {
      setStatusBusyId(null);
    }
  };

  const previewPage = (row) => {
    if (!row?.id) return;
    router.push(`/dashboard/home-page/landing-pages/${row.id}/preview`);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Landing Pages</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Create Feature, Product, and Industry SEO pages from one fixed Splash template.
          </p>
        </div>
        <Link
          href="/dashboard/home-page/landing-pages/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Landing Page
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search landing pages…"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((item) => (
            <button
              key={`type-${item.id || 'all'}`}
              type="button"
              onClick={() => {
                setTypeFilter(item.id);
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                typeFilter === item.id
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
            <button
              key={`status-${item.id || 'all'}`}
              type="button"
              onClick={() => {
                setStatusFilter(item.id);
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                statusFilter === item.id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${isFetching ? 'pointer-events-none opacity-60' : ''}`}>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Page Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Keyword</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No landing pages found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="text-gray-800 dark:text-gray-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.hero_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={/^https?:\/\//i.test(row.hero_image) ? row.hero_image : buildMediaUrl(row.hero_image)}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : null}
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.type_label || row.type}</td>
                  <td className="px-4 py-3">{row.primary_keyword || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${row.status === 'Published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(row.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => previewPage(row)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/home-page/landing-pages/${row.id}`)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={statusBusyId === row.id}
                        onClick={() => togglePublish(row)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        {statusBusyId === row.id ? <Loader2 size={14} className="animate-spin" /> : null}
                        {row.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemToDelete(row);
                          setIsDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || isFetching}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || isFetching}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete landing page?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This will permanently remove{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {itemToDelete?.name || 'this page'}
              </span>
              .
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
