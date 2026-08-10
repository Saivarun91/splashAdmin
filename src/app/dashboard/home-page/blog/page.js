'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2, Search, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { homepageAPI } from '@/lib/api';
import { buildMediaUrl } from '@/utils/imagehelper';

export default function BlogAdminListingPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const lastQueryRef = useRef('');

  const fetchListing = useCallback(async (page, query, isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      else setIsFetching(true);

      const res = await homepageAPI.listBlogs(page, query);
      if (res.status === false) {
        throw new Error(res.message || 'Failed to load blogs');
      }
      const payload = res.data || {};
      setData(Array.isArray(payload.data) ? payload.data : []);
      setTotalPages(payload.last_page || 1);
    } catch (e) {
      toast.error(e.message || 'Failed to load blogs', { id: 'blog-listing-error' });
      setData([]);
      setTotalPages(1);
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
    }
  }, []);

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

  const openDelete = (row) => {
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      setDeleting(true);
      const res = await homepageAPI.deleteBlog(itemToDelete.id);
      if (res.status === false) throw new Error(res.message || 'Delete failed');
      toast.success(res.message || 'Blog deleted');
      await fetchListing(currentPage, debouncedQuery);
    } catch (e) {
      toast.error(e.message || 'Failed to delete blog');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const downloadBlog = async (row) => {
    if (!row?.id) return;
    try {
      setDownloadingId(row.id);
      const { blob, filename } = await homepageAPI.downloadBlog(row.id);
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
      setDownloadingId(null);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blogs</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage blog posts with search, pagination, and full content editing.
          </p>
        </div>
        <Link
          href="/dashboard/home-page/blog/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Add blog
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search blogs…"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className={`overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${isFetching ? 'pointer-events-none opacity-60' : ''}`}>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Serial No</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No blogs found.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id} className="text-gray-800 dark:text-gray-200">
                  <td className="px-4 py-3">{(currentPage - 1) * 10 + index + 1}</td>
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3">{row.author || '—'}</td>
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3">{row.status || '—'}</td>
                  <td className="px-4 py-3">
                    {row.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          /^https?:\/\//i.test(row.picture)
                            ? row.picture
                            : buildMediaUrl(row.picture)
                        }
                        alt=""
                        className="h-12 w-16 rounded object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/home-page/blog/${row.id}/view`)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadBlog(row)}
                        disabled={downloadingId === row.id}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        {downloadingId === row.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/home-page/blog/${row.id}`)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(row)}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete blog?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This will permanently remove{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {itemToDelete?.title || 'this blog'}
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
