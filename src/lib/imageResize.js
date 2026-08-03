/**
 * Crop + scale + compress helpers for blog image uploads.
 */

export const BLOG_IMAGE_MAX_WIDTH = 1600;
export const BLOG_IMAGE_MAX_HEIGHT = 1600;
export const BLOG_IMAGE_JPEG_QUALITY = 0.85;

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * @param {HTMLImageElement} image
 * @param {import('react-image-crop').PixelCrop | null} pixelCrop
 * @returns {{ sx: number, sy: number, sw: number, sh: number }}
 */
export function getCropSourceRect(image, pixelCrop) {
  if (
    pixelCrop &&
    pixelCrop.width > 0 &&
    pixelCrop.height > 0
  ) {
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    return {
      sx: Math.max(0, Math.round(pixelCrop.x * scaleX)),
      sy: Math.max(0, Math.round(pixelCrop.y * scaleY)),
      sw: Math.max(1, Math.round(pixelCrop.width * scaleX)),
      sh: Math.max(1, Math.round(pixelCrop.height * scaleY)),
    };
  }
  return {
    sx: 0,
    sy: 0,
    sw: image.naturalWidth,
    sh: image.naturalHeight,
  };
}

export function fitWithinMax(width, height, maxW = BLOG_IMAGE_MAX_WIDTH, maxH = BLOG_IMAGE_MAX_HEIGHT) {
  let w = width;
  let h = height;
  const ratio = Math.min(maxW / w, maxH / h, 1);
  w = Math.max(1, Math.round(w * ratio));
  h = Math.max(1, Math.round(h * ratio));
  return { width: w, height: h };
}

/**
 * Crop (optional), scale down to max dimensions, and export as JPEG File.
 * @param {HTMLImageElement} image - displayed image element (must have naturalWidth)
 * @param {import('react-image-crop').PixelCrop | null} pixelCrop
 * @param {object} [options]
 * @param {string} [options.fileName]
 * @param {number} [options.maxWidth]
 * @param {number} [options.maxHeight]
 * @param {number} [options.quality]
 * @returns {Promise<File>}
 */
export async function cropAndCompressImage(image, pixelCrop, options = {}) {
  const {
    fileName = 'image.jpg',
    maxWidth = BLOG_IMAGE_MAX_WIDTH,
    maxHeight = BLOG_IMAGE_MAX_HEIGHT,
    quality = BLOG_IMAGE_JPEG_QUALITY,
  } = options;

  const { sx, sy, sw, sh } = getCropSourceRect(image, pixelCrop);
  const { width: outW, height: outH } = fitWithinMax(sw, sh, maxWidth, maxHeight);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      quality
    );
  });

  const base = String(fileName || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 80);
  return new File([blob], `${base || 'image'}.jpg`, { type: 'image/jpeg' });
}
