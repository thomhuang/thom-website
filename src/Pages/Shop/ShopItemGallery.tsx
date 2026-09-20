import type { ShopImage } from '../../api/Shop/ShopRouter';
import styles from './Shop.module.css';

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
  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMain}>
        {selectedImageUrl && selectedImageUrl !== failedImageUrl ? (
          <img
            className={styles.galleryImage}
            src={selectedImageUrl}
            alt={title}
            onError={() => onImageError(selectedImageUrl)}
          />
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
    </div>
  );
}
