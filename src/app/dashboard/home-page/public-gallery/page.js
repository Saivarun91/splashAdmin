'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Eye,
  ExternalLink,
  X,
  LayoutGrid,
  Home,
  ImageIcon,
  Download,
} from 'lucide-react';
import { homepageAPI } from '@/lib/api';
import SmartImage from '@/utils/SmartImage';

const IMAGE_TYPES = [
  { value: 'lifestyle', label: 'Lifestyle', layout: 'lifestyle' },
  { value: 'campaign', label: 'Campaign visual', layout: 'campaign' },
  { value: 'product', label: 'Product shot', layout: 'product' },
  { value: 'model', label: 'Model shot', layout: 'model' },
  { value: 'multi_piece', label: 'Multi piece', layout: 'multipiece' },
  { value: 'background_change', label: 'Background change', layout: 'product' },
];

const VISIBILITY_OPTIONS = [
  {
    value: 'gallery_and_homepage',
    label: 'Gallery + Homepage',
    shortLabel: 'Both',
    description: 'Visible on /gallery and the homepage showcase',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
  },
  {
    value: 'gallery_only',
    label: 'Gallery only',
    shortLabel: 'Gallery',
    description: 'Visible on /gallery only',
    badgeClass: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200',
  },
  {
    value: 'hidden',
    label: 'Hidden',
    shortLabel: 'Hidden',
    description: 'Not shown on the public site',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'All CMS images' },
  { id: 'gallery_and_homepage', label: 'Gallery + Homepage' },
  { id: 'gallery_only', label: 'Gallery only' },
  { id: 'hidden', label: 'Hidden' },
];

const SOURCE_LABELS = {
  cms: 'CMS',
  filesystem: 'Static gallery folder',
  defaults: 'Default homepage showcase files',
  empty: 'None',
};

function isTruthy(value) {
  return value === true || value === 'true';
}

function getVisibility(img) {
  if (!isTruthy(img.is_active)) return 'hidden';
  if (isTruthy(img.show_on_homepage)) return 'gallery_and_homepage';
  return 'gallery_only';
}

function visibilityToPayload(value) {
  if (value === 'hidden') {
    return { is_active: 'false', show_on_homepage: false };
  }
  if (value === 'gallery_and_homepage') {
    return { is_active: 'true', show_on_homepage: true };
  }
  return { is_active: 'true', show_on_homepage: false };
}

function getVisibilityMeta(value) {
  return VISIBILITY_OPTIONS.find((option) => option.value === value) || VISIBILITY_OPTIONS[1];
}

function LiveImageGrid({ images, emptyText, onPreview }) {
  if (!images?.length) {
    return (
      <div className="text-center py-10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
        <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {images.map((img) => (
        <button
          key={img.id || img.source_key || img.src}
          type="button"
          onClick={() => onPreview?.(img)}
          className="text-left rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 hover:ring-2 hover:ring-blue-500 transition-shadow"
        >
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
            <SmartImage
              src={img.src}
              fallbackSrc={img.image_url}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              alt={img.alt || img.label}
              className="object-cover"
            />
          </div>
          <div className="p-2.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{img.label}</p>
            <p className="text-xs text-gray-500 truncate">{img.image_type}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function PublicGalleryAdminPage() {
  const [overview, setOverview] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [form, setForm] = useState({
    image_type: 'product',
    label: '',
    alt_text: '',
    visibility: 'gallery_only',
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  const liveGallery = overview?.live?.gallery_images || [];
  const liveShowcase = overview?.live?.showcase_images || [];
  const gallerySource = overview?.live?.gallery_source || 'empty';
  const showcaseSource = overview?.live?.showcase_source || 'empty';
  const filesystemCatalog = overview?.catalog?.filesystem_gallery || [];
  const defaultShowcaseCatalog = overview?.catalog?.default_showcase || [];

  const counts = useMemo(() => {
    const tally = { all: images.length, gallery_and_homepage: 0, gallery_only: 0, hidden: 0 };
    images.forEach((img) => {
      tally[getVisibility(img)] += 1;
    });
    return tally;
  }, [images]);

  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return images;
    return images.filter((img) => getVisibility(img) === activeFilter);
  }, [images, activeFilter]);

  const usingLegacyGallery = gallerySource !== 'cms';
  const usingLegacyShowcase = showcaseSource !== 'cms';

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await homepageAPI.getPublicGalleryOverview();
      if (response.success) {
        setOverview(response);
        setImages(response.cms_images || []);
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to load gallery overview' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load gallery overview' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportPreset = async (preset, visibility) => {
    try {
      setImporting(preset);
      setMessage({ type: '', text: '' });
      const response = await homepageAPI.importPublicGalleryImages({ preset, visibility });
      if (response.success) {
        const count = response.imported_count || 0;
        const errorCount = response.errors?.length || 0;
        setMessage({
          type: errorCount ? 'error' : 'success',
          text: errorCount
            ? `Imported ${count} image(s). ${errorCount} failed.`
            : `Imported ${count} image(s) into CMS.`,
        });
        fetchOverview();
      } else {
        setMessage({ type: 'error', text: response.error || 'Import failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Import failed' });
    } finally {
      setImporting('');
    }
  };

  const handleUpload = async (event) => {
    event?.preventDefault?.();

    const input = document.getElementById('public-gallery-image-input');
    const file = imageFile || input?.files?.[0] || null;

    if (!file) {
      setMessage({ type: 'error', text: 'Please select an image file before uploading.' });
      return;
    }

    const typeConfig = IMAGE_TYPES.find((t) => t.value === form.image_type) || IMAGE_TYPES[2];
    const placement = visibilityToPayload(form.visibility);

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });
      const response = await homepageAPI.uploadPublicGalleryImage(file, {
        image_type: form.image_type,
        label: form.label || typeConfig.label,
        alt_text: form.alt_text || form.label || typeConfig.label,
        homepage_layout: typeConfig.layout,
        show_on_homepage: placement.show_on_homepage ? 'true' : 'false',
        is_active: placement.is_active,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        setImageFile(null);
        setForm({ image_type: 'product', label: '', alt_text: '', visibility: 'gallery_only' });
        if (input) input.value = '';
        fetchOverview();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to upload image' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Delete this gallery image?')) return;
    try {
      const response = await homepageAPI.deletePublicGalleryImage(imageId);
      if (response.success) {
        if (previewImage?.id === imageId) setPreviewImage(null);
        fetchOverview();
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to delete image' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete image' });
    }
  };

  const handleVisibilityChange = async (imageId, nextVisibility) => {
    try {
      setSavingId(imageId);
      const payload = visibilityToPayload(nextVisibility);
      const response = await homepageAPI.updatePublicGalleryImage(imageId, payload);
      if (response.success) {
        fetchOverview();
        if (previewImage?.id === imageId) {
          setPreviewImage((prev) =>
            prev
              ? {
                  ...prev,
                  is_active: payload.is_active,
                  show_on_homepage: payload.show_on_homepage ? 'true' : 'false',
                }
              : prev
          );
        }
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to update visibility' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update visibility' });
    } finally {
      setSavingId(null);
    }
  };

  const handleReorder = async (imageId, direction) => {
    const index = images.findIndex((img) => img.id === imageId);
    if (index < 0) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= images.length) return;

    const current = images[index];
    const swap = images[swapIndex];
    try {
      await homepageAPI.updatePublicGalleryImage(current.id, { order: swap.order });
      await homepageAPI.updatePublicGalleryImage(swap.id, { order: current.order });
      fetchOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to reorder images' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Public Gallery</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          See what visitors currently see on the homepage showcase and{' '}
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/gallery</code>,
          then manage images in CMS to control placement.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" />
              Currently live — Homepage showcase
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Source: {SOURCE_LABELS[showcaseSource] || showcaseSource}
              {usingLegacyShowcase ? ' — import below to manage in CMS' : ''}
            </p>
          </div>
          {usingLegacyShowcase && defaultShowcaseCatalog.length > 0 && (
            <button
              type="button"
              onClick={() => handleImportPreset('default_showcase', 'gallery_and_homepage')}
              disabled={importing === 'default_showcase'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 text-sm"
            >
              {importing === 'default_showcase' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Import showcase into CMS
            </button>
          )}
        </div>
        <LiveImageGrid
          images={liveShowcase}
          emptyText="No showcase images are live right now."
          onPreview={setPreviewImage}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Currently live — /gallery page
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Source: {SOURCE_LABELS[gallerySource] || gallerySource}
              {usingLegacyGallery ? ' — import below to manage in CMS' : ''}
            </p>
          </div>
          {usingLegacyGallery && filesystemCatalog.length > 0 && (
            <button
              type="button"
              onClick={() => handleImportPreset('filesystem_gallery', 'gallery_only')}
              disabled={importing === 'filesystem_gallery'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {importing === 'filesystem_gallery' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Import gallery folder into CMS
            </button>
          )}
        </div>
        <LiveImageGrid
          images={liveGallery}
          emptyText="No gallery images are live right now."
          onPreview={setPreviewImage}
        />
      </section>

      {(usingLegacyGallery || usingLegacyShowcase) && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          The public site is still using static files because CMS has no active images yet.
          Use the import buttons above to copy them into CMS, then you can set Gallery only / Gallery + Homepage per image.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500">CMS images</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.all}</p>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">Gallery + Homepage</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{counts.gallery_and_homepage}</p>
        </div>
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">Gallery only</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{counts.gallery_only}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500">Hidden</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.hidden}</p>
        </div>
      </div>

      <form
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
        onSubmit={handleUpload}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload new image to CMS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="public-gallery-image-input">
              Image file
            </label>
            <input
              id="public-gallery-image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            {imageFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image type</label>
            <select
              value={form.image_type}
              onChange={(e) => setForm((prev) => ({ ...prev, image_type: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              {IMAGE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Label</label>
            <input
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Display label"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alt text</label>
            <input
              value={form.alt_text}
              onChange={(e) => setForm((prev) => ({ ...prev, alt_text: e.target.value }))}
              placeholder="Accessibility description"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Where should this appear?</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            CMS library ({filteredImages.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
                {tab.id !== 'all' ? ` (${counts[tab.id]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {filteredImages.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No CMS images yet.</p>
            <p className="text-sm text-gray-500 mt-1">Import the live images above or upload new ones.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img, index) => {
              const visibility = getVisibility(img);
              const visibilityMeta = getVisibilityMeta(visibility);
              const imageUrl = img.image_url || img.src;

              return (
                <div
                  key={img.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewImage(img)}
                    className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 group"
                  >
                    <SmartImage
                      src={img.src}
                      fallbackSrc={img.image_url}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      alt={img.alt || img.label}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/70 text-white text-sm">
                        <Eye className="w-4 h-4" />
                        View image
                      </span>
                    </div>
                    <span
                      className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${visibilityMeta.badgeClass}`}
                    >
                      {visibilityMeta.shortLabel}
                    </span>
                  </button>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{img.label}</p>
                      <p className="text-sm text-gray-500">{img.image_type}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        Visibility
                      </label>
                      <select
                        value={visibility}
                        disabled={savingId === img.id}
                        onChange={(e) => handleVisibilityChange(img.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
                      >
                        {VISIBILITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleReorder(img.id, 'up')}
                          disabled={index === 0}
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(img.id, 'down')}
                          disabled={index === filteredImages.length - 1}
                          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(img.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewImage.label}</h3>
                <p className="text-sm text-gray-500">{previewImage.image_type}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 relative aspect-video">
              <SmartImage
                src={previewImage.src}
                fallbackSrc={previewImage.image_url}
                fill
                sizes="100vw"
                alt={previewImage.alt || previewImage.label}
                className="object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              {previewImage.id && !String(previewImage.id).startsWith('default:') && !String(previewImage.id).startsWith('filesystem:') ? (
                <select
                  value={getVisibility(previewImage)}
                  disabled={savingId === previewImage.id}
                  onChange={(e) => handleVisibilityChange(previewImage.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mb-4"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}

              <a
                href={previewImage.image_url || previewImage.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
