'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Upload } from 'lucide-react';
import { homepageAPI } from '@/lib/api';
import { buildMediaUrl, getPublicSiteOrigin, isHttpUrl } from '@/utils/imagehelper';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const hintClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';
const sectionClass =
  'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4';

const emptyImages = () => ({
  small_url: '',
  small_alt: '',
  large_url: '',
  large_alt: '',
});

const emptyLogin = () => ({
  title: '',
  subtitle: '',
  email_label: '',
  email_placeholder: '',
  password_label: '',
  password_placeholder: '',
  forgot_password_text: '',
  submit_text: '',
  no_account_text: '',
  signup_link_text: '',
});

const emptySignup = () => ({
  title: '',
  subtitle: '',
  full_name_label: '',
  full_name_placeholder: '',
  username_label: '',
  username_placeholder: '',
  email_label: '',
  email_placeholder: '',
  password_label: '',
  password_placeholder: '',
  confirm_password_label: '',
  confirm_password_placeholder: '',
  submit_text: '',
  have_account_text: '',
  login_link_text: '',
});

function previewSrc(src) {
  if (!src) return '';
  if (src.startsWith('blob:') || isHttpUrl(src)) return src;
  // Static frontend assets live on the public site, not this admin app.
  if (src.startsWith('/images/') || src.startsWith('/galery/')) {
    return `${getPublicSiteOrigin()}${src}`;
  }
  return buildMediaUrl(src);
}

export default function LoginSignupAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [images, setImages] = useState(emptyImages());
  const [login, setLogin] = useState(emptyLogin());
  const [signup, setSignup] = useState(emptySignup());
  const [previewFailed, setPreviewFailed] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await homepageAPI.getPageContentAdmin('auth');
      if (!res.success || !res.content) return;
      const data = res.content;
      if (data.images) setImages({ ...emptyImages(), ...data.images });
      if (data.login) setLogin({ ...emptyLogin(), ...data.login });
      if (data.signup) setSignup({ ...emptySignup(), ...data.signup });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await homepageAPI.updatePageContent('auth', { images, login, signup });
      setMessage({ type: 'success', text: 'Saved successfully. Login and signup share these images.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file, key) => {
    if (!file) return;
    try {
      setUploading(key);
      const maxWidth = key === 'small_url' ? 480 : 960;
      const { url } = await homepageAPI.uploadContentImage(file, { max_width: maxWidth });
      const nextImages = { ...images, [key]: url };
      setImages(nextImages);
      setPreviewFailed((prev) => ({ ...prev, [key]: false }));
      await homepageAPI.updatePageContent('auth', { images: nextImages, login, signup });
      setMessage({ type: 'success', text: 'Image replaced on login and signup.' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message || 'Upload failed' });
    } finally {
      setUploading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  const ImageField = ({ title, urlKey, altKey, hint }) => (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className={hintClass}>{hint}</p>
      {images[urlKey] && !previewFailed[urlKey] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc(images[urlKey])}
          alt={images[altKey] || title}
          className="h-36 w-full rounded-lg object-cover border border-gray-200 dark:border-gray-700"
          onError={() => setPreviewFailed((prev) => ({ ...prev, [urlKey]: true }))}
        />
      ) : (
        <div className="h-36 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm text-gray-400 px-3 text-center">
          {images[urlKey] ? 'Preview unavailable — upload an image or check the public site URL' : 'No image'}
        </div>
      )}
      <div>
        <label className={labelClass}>Image URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={images[urlKey]}
            onChange={(e) => {
              setImages({ ...images, [urlKey]: e.target.value });
              setPreviewFailed((prev) => ({ ...prev, [urlKey]: false }));
            }}
            className={inputClass}
            placeholder="Upload an image"
          />
          <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer text-sm shrink-0">
            <Upload size={16} />
            {uploading === urlKey ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                uploadImage(file, urlKey);
              }}
            />
          </label>
        </div>
      </div>
      <div>
        <label className={labelClass}>Alt text</label>
        <input
          type="text"
          value={images[altKey]}
          onChange={(e) => setImages({ ...images, [altKey]: e.target.value })}
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Login & Signup</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            One page for both public auth screens. Images are shared; copy can differ per form.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shared images</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          These two images appear on login, signup, forgot password, and reset password.
          Uploading a file replaces the previous image on the live pages immediately.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <ImageField
            title="Small image (top left)"
            urlKey="small_url"
            altKey="small_alt"
            hint="Shown as the smaller overlapping photo."
          />
          <ImageField
            title="Large image (bottom right)"
            urlKey="large_url"
            altKey="large_alt"
            hint="Shown as the larger background photo."
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Login fields</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Copy shown on /login.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={login.title} onChange={(e) => setLogin({ ...login, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Submit button</label>
            <input type="text" value={login.submit_text} onChange={(e) => setLogin({ ...login, submit_text: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <input type="text" value={login.subtitle} onChange={(e) => setLogin({ ...login, subtitle: e.target.value })} className={inputClass} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email label</label>
            <input type="text" value={login.email_label} onChange={(e) => setLogin({ ...login, email_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email placeholder</label>
            <input type="text" value={login.email_placeholder} onChange={(e) => setLogin({ ...login, email_placeholder: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password label</label>
            <input type="text" value={login.password_label} onChange={(e) => setLogin({ ...login, password_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password placeholder</label>
            <input type="text" value={login.password_placeholder} onChange={(e) => setLogin({ ...login, password_placeholder: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Forgot password link</label>
            <input type="text" value={login.forgot_password_text} onChange={(e) => setLogin({ ...login, forgot_password_text: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>No account text</label>
            <input type="text" value={login.no_account_text} onChange={(e) => setLogin({ ...login, no_account_text: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Signup link text</label>
            <input type="text" value={login.signup_link_text} onChange={(e) => setLogin({ ...login, signup_link_text: e.target.value })} className={inputClass} />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Signup fields</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Copy shown on /signup. Uses the same images as login.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={signup.title} onChange={(e) => setSignup({ ...signup, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Submit button</label>
            <input type="text" value={signup.submit_text} onChange={(e) => setSignup({ ...signup, submit_text: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <input type="text" value={signup.subtitle} onChange={(e) => setSignup({ ...signup, subtitle: e.target.value })} className={inputClass} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full name label</label>
            <input type="text" value={signup.full_name_label} onChange={(e) => setSignup({ ...signup, full_name_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Full name placeholder</label>
            <input type="text" value={signup.full_name_placeholder} onChange={(e) => setSignup({ ...signup, full_name_placeholder: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Username label</label>
            <input type="text" value={signup.username_label} onChange={(e) => setSignup({ ...signup, username_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Username placeholder</label>
            <input type="text" value={signup.username_placeholder} onChange={(e) => setSignup({ ...signup, username_placeholder: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email label</label>
            <input type="text" value={signup.email_label} onChange={(e) => setSignup({ ...signup, email_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email placeholder</label>
            <input type="text" value={signup.email_placeholder} onChange={(e) => setSignup({ ...signup, email_placeholder: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password label</label>
            <input type="text" value={signup.password_label} onChange={(e) => setSignup({ ...signup, password_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Password placeholder</label>
            <input type="text" value={signup.password_placeholder} onChange={(e) => setSignup({ ...signup, password_placeholder: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Confirm password label</label>
            <input type="text" value={signup.confirm_password_label} onChange={(e) => setSignup({ ...signup, confirm_password_label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Confirm password placeholder</label>
            <input type="text" value={signup.confirm_password_placeholder} onChange={(e) => setSignup({ ...signup, confirm_password_placeholder: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Already have account text</label>
            <input type="text" value={signup.have_account_text} onChange={(e) => setSignup({ ...signup, have_account_text: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Login link text</label>
            <input type="text" value={signup.login_link_text} onChange={(e) => setSignup({ ...signup, login_link_text: e.target.value })} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}
