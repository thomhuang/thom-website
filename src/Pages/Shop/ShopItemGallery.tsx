import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

import type { ShopImage } from '../../api/Shop/ShopRouter';
import styles from './Shop.module.css';

// Press-and-hold to magnify; the delay keeps a plain tap/click from flashing.
const holdZoomDelay = 180;
const holdZoomScale = 2.5;

type ZoomOrigin = { x: number; y: number };

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const getZoomOrigin = (
  clientX: number,
  clientY: number,
  rect: DOMRect
): ZoomOrigin => ({
  x: rect.width ? clampPercent(((clientX - rect.left) / rect.width) * 100) : 50,
  y: rect.height ? clampPercent(((clientY - rect.top) / rect.height) * 100) : 50,
});

type ShopItemGalleryProps = {
  images: ShopImage[];
  title: string;
  selectedImageUrl: string;
  failedImageUrl: string;
  onSelectImage: (url: string) => void;
  onImageError: (url: string) => void;
};

export default function ShopItemGallery({
  images,
  title,
  selectedImageUrl,
  failedImageUrl,
  onSelectImage,
  onImageError,
}: ShopItemGalleryProps) {
  const [isFullSize, setIsFullSize] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<ZoomOrigin | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const zoomRectRef = useRef<DOMRect | null>(null);
  const activePointerRef = useRef<number | null>(null);

  const hasImage =
    Boolean(selectedImageUrl) && selectedImageUrl !== failedImageUrl;
  const imageIndex = images.findIndex((image) => image.url === selectedImageUrl);
  const canNavigate = images.length > 1 && imageIndex !== -1;

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  // Drop any in-progress zoom when the lightbox opens/closes or the photo changes.
  useEffect(() => {
    clearHoldTimer();
    zoomRectRef.current = null;
    activePointerRef.current = null;
    setZoomOrigin(null);
  }, [isFullSize, selectedImageUrl, clearHoldTimer]);

  const showRelativeImage = useCallback(
    (offset: number) => {
      if (!canNavigate) {
        return;
      }

      const nextIndex = (imageIndex + offset + images.length) % images.length;
      onSelectImage(images[nextIndex].url);
    },
    [canNavigate, imageIndex, images, onSelectImage]
  );

  useEffect(() => {
    if (!isFullSize) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullSize(false);
      } else if (event.key === 'ArrowLeft') {
        showRelativeImage(-1);
      } else if (event.key === 'ArrowRight') {
        showRelativeImage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullSize, showRelativeImage]);

  // Lock page scroll while the full-size view is open, padding for the
  // disappearing scrollbar so the page behind does not shift.
  useEffect(() => {
    if (!isFullSize) {
      return;
    }

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isFullSize]);

  const handleImagePointerDown = (event: PointerEvent<HTMLImageElement>) => {
    if (event.button !== 0 || event.isPrimary === false || zoomOrigin) {
      return;
    }

    event.preventDefault();

    const image = event.currentTarget;
    const { pointerId, clientX, clientY } = event;
    const rect = image.getBoundingClientRect();
    activePointerRef.current = pointerId;
    zoomRectRef.current = rect;
    clearHoldTimer();

    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = null;
      image.setPointerCapture?.(pointerId);
      if (rect) {
        setZoomOrigin(getZoomOrigin(clientX, clientY, rect));
      }
    }, holdZoomDelay);
  };

  const handleImagePointerMove = (event: PointerEvent<HTMLImageElement>) => {
    if (!zoomOrigin || event.pointerId !== activePointerRef.current) {
      return;
    }

    const rect = zoomRectRef.current;
    if (rect) {
      setZoomOrigin(getZoomOrigin(event.clientX, event.clientY, rect));
    }
  };

  const handleImagePointerEnd = (event: PointerEvent<HTMLImageElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }

    clearHoldTimer();
    activePointerRef.current = null;
    zoomRectRef.current = null;

    if (zoomOrigin) {
      setZoomOrigin(null);
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMain}>
        {hasImage ? (
          <button
            type="button"
            className={styles.galleryZoom}
            onClick={() => setIsFullSize(true)}
            aria-label={`View ${title} full size`}
          >
            <img
              className={styles.galleryImage}
              src={selectedImageUrl}
              alt={title}
              onError={() => onImageError(selectedImageUrl)}
            />
          </button>
        ) : (
          <span className={styles.cardPlaceholder}>No image</span>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image) => (
            <button
              type="button"
              className={[
                styles.thumbnail,
                image.url === selectedImageUrl ? styles.selectedThumbnail : '',
              ].join(' ')}
              key={image.id}
              onClick={() => onSelectImage(image.url)}
              aria-pressed={image.url === selectedImageUrl}
              aria-label={image.altText || title}
            >
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}

      {isFullSize && hasImage && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setIsFullSize(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setIsFullSize(false)}
            autoFocus
          >
            Close
          </button>

          {canNavigate && (
            <>
              <button
                type="button"
                className={[styles.lightboxNav, styles.lightboxPrev].join(' ')}
                onClick={(event) => {
                  event.stopPropagation();
                  showRelativeImage(-1);
                }}
                aria-label="Previous image"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M15 5l-7 7 7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={[styles.lightboxNav, styles.lightboxNext].join(' ')}
                onClick={(event) => {
                  event.stopPropagation();
                  showRelativeImage(1);
                }}
                aria-label="Next image"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          <img
            className={[
              styles.lightboxImage,
              zoomOrigin ? styles.lightboxZoomed : '',
            ].join(' ')}
            src={selectedImageUrl}
            alt={title}
            style={
              zoomOrigin
                ? {
                    transform: `scale(${holdZoomScale})`,
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  }
                : undefined
            }
            data-zoomed={zoomOrigin ? 'true' : undefined}
            draggable={false}
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={handleImagePointerEnd}
            onPointerCancel={handleImagePointerEnd}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}
