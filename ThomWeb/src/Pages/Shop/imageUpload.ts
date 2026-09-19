export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

// Photos arrive from a phone or camera several thousand pixels wide, which is
// far more than a product page needs. Downscaling and re-encoding in the browser
// keeps the bucket small and the storefront fast, and image bytes still never
// pass through the API.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Compression runs before the size check, so the 10 MB limit applies to the
// prepared bytes rather than the file on disk. This larger ceiling only exists
// to stop an absurd input from locking up the tab while it is decoded.
export const MAX_SOURCE_IMAGE_BYTES = 50 * 1024 * 1024;

const MAX_IMAGE_DIMENSION = 2000;
const WEBP_QUALITY = 0.85;

export type PreparedImage = {
  blob: Blob;
  contentType: string;
};

// GIFs are uploaded untouched: re-encoding through a canvas would flatten an
// animation to its first frame.
const isCompressible = (file: File) => file.type !== 'image/gif';

// prepareImageForUpload returns the bytes to upload and the content type that
// must be signed for them. It falls back to the original file whenever
// re-encoding is impossible or does not actually shrink the image, so an
// already-optimized upload is never degraded for nothing.
export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  if (isCompressible(file)) {
    try {
      const compressed = await compressToWebP(file);
      if (compressed && compressed.size < file.size) {
        return { blob: compressed, contentType: 'image/webp' };
      }
    } catch {
      // An image the browser cannot decode is still uploaded as-is and
      // validated by the server.
    }
  }

  return { blob: file, contentType: file.type };
}

async function compressToWebP(file: File): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    );

    // A browser without WebP encoding silently falls back to PNG, which would
    // store PNG bytes under a signed image/webp content type. Reject that rather
    // than upload a mismatched pair.
    return blob && blob.type === 'image/webp' ? blob : null;
  } finally {
    bitmap.close();
  }
}
