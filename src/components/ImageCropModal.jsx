'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, { convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Loader2, X } from 'lucide-react';
import {
  BLOG_IMAGE_MAX_HEIGHT,
  BLOG_IMAGE_MAX_WIDTH,
  cropAndCompressImage,
} from '@/lib/imageResize';

function initialFreeCrop() {
  return {
    unit: '%',
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  };
}

/**
 * Free-aspect crop modal. On apply: crops selection, scales to max size, compresses JPEG.
 */
export default function ImageCropModal({
  open,
  file,
  title = 'Resize image',
  onCancel,
  onComplete,
}) {
  const imgRef = useRef(null);
  const [src, setSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !file) {
      setSrc('');
      setCrop(undefined);
      setCompletedCrop(null);
      setError('');
      setProcessing(false);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop(undefined);
    setCompletedCrop(null);
    setError('');
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  const onImageLoad = useCallback((e) => {
    const next = initialFreeCrop();
    setCrop(next);
    const { width, height } = e.currentTarget;
    setCompletedCrop(convertToPixelCrop(next, width, height));
  }, []);

  const apply = async (useFullImage = false) => {
    const image = imgRef.current;
    if (!image || !file) return;
    try {
      setProcessing(true);
      setError('');
      let pixelCrop = null;
      if (!useFullImage) {
        pixelCrop =
          completedCrop && completedCrop.width && completedCrop.height
            ? completedCrop
            : crop
              ? convertToPixelCrop(crop, image.width, image.height)
              : null;
        if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
          setError('Drag the crop box to select an area, or use full image.');
          setProcessing(false);
          return;
        }
      }
      const outFile = await cropAndCompressImage(image, pixelCrop, {
        fileName: file.name || 'image.jpg',
        maxWidth: BLOG_IMAGE_MAX_WIDTH,
        maxHeight: BLOG_IMAGE_MAX_HEIGHT,
      });
      onComplete?.(outFile);
    } catch (e) {
      setError(e.message || 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Free crop — drag corners to resize. Image will be scaled to max {BLOG_IMAGE_MAX_WIDTH}×
              {BLOG_IMAGE_MAX_HEIGHT}px and compressed.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4 dark:bg-gray-950">
          {src ? (
            <div className="mx-auto flex max-w-full justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                keepSelection
                ruleOfThirds
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={src}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] max-w-full"
                />
              </ReactCrop>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">
              Loading image…
            </div>
          )}
        </div>

        {error ? (
          <p className="px-4 pt-2 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => apply(true)}
            disabled={processing || !src}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Use full image
          </button>
          <button
            type="button"
            onClick={() => apply(false)}
            disabled={processing || !src}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : null}
            Apply crop
          </button>
        </div>
      </div>
    </div>
  );
}
