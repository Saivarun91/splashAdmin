'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Pencil, Trash2 } from 'lucide-react';
import { homepageAPI } from '@/lib/api';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    date: '',
    author: 'Splash Team',
    category: '',
    read_time: '5 min read',
    image_url: '',
    order: 0,
    is_published: true,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getAllBlogPosts();
      if (res.success) setPosts(res.posts || []);
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load posts' });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing('new');
    setForm({
      slug: '',
      title: '',
      excerpt: '',
      body: '',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      author: 'Splash Team',
      category: '',
      read_time: '5 min read',
      image_url: '',
      order: posts.length,
      is_published: true,
    });
  };

  const openEdit = (post) => {
    setEditing(post.slug);
    setForm({
      slug: post.slug,
      title: post.title || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      date: post.date || '',
      author: post.author || 'Splash Team',
      category: post.category || '',
      read_time: post.read_time || '5 min read',
      image_url: post.image_url || '',
      order: post.order ?? 0,
      is_published: post.is_published === 'true',
    });
  };

  const save = async () => {
    try {
      setMessage({ type: '', text: '' });
      if (editing === 'new') {
        await homepageAPI.createBlogPost({
          ...form,
          is_published: form.is_published,
        });
        setMessage({ type: 'success', text: 'Post created.' });
      } else {
        await homepageAPI.updateBlogPost(editing, {
          ...form,
          is_published: form.is_published,
        });
        setMessage({ type: 'success', text: 'Post updated.' });
      }
      setEditing(null);
      fetchPosts();
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    }
  };

  const remove = async (slug) => {
    if (!confirm('Delete this post?')) return;
    try {
      await homepageAPI.deleteBlogPost(slug);
      setMessage({ type: 'success', text: 'Post deleted.' });
      setEditing(null);
      fetchPosts();
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to delete' });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Add or edit blog posts shown on the public blog page.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> New Post
        </button>
      </div>
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {editing ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold">{editing === 'new' ? 'New Post' : 'Edit Post'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                disabled={editing !== 'new'}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body (HTML)</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} className="w-full px-4 py-2 border rounded-lg font-mono text-sm bg-white dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="text" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Read time</label>
              <input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              <label htmlFor="pub">Published</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save size={18} /> Save
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg">Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No posts yet. Create one above.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id || post.slug}>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{post.title}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{post.slug}</td>
                  <td className="px-4 py-3">{post.is_published === 'true' ? <span className="text-green-600">Published</span> : <span className="text-gray-500">Draft</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(post)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Pencil size={16} /></button>
                    <button onClick={() => remove(post.slug)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
