import { ChangeEvent, useState } from 'react';

import {
  CreateShopImageAsync,
  CreateShopImageUploadAsync,
  DeleteShopImageAsync,
  ShopImage,
  UploadShopImageAsync,
} from '../../api/Shop/ShopRouter';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_SOURCE_IMAGE_BYTES,
  prepareImageForUpload,
} from './imageUpload';
import styles from './Shop.module.css';

type ShopImageManagerProps = {
  itemId: string;
  title: string;
  images: ShopImage[];
  onImagesChange: (images: ShopImage[]) => void;
};

export default function ShopImageManager({
  itemId,
  title,
  images,
  onImagesChange,
}: ShopImageManagerProps) {
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setUploadError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Use a JPEG, PNG, WebP, AVIF, or GIF image.');
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      setUploadError('That image is too large to process (over 50 MB).');
      return;
    }

    setIsUploading(true);

    try {
      // Re-encoding may change the content type, so prepare the bytes before
      // asking the server to sign for them.
      const prepared = await prepareImageForUpload(file);

      if (prepared.blob.size > MAX_IMAGE_BYTES) {
        setUploadError('Images must be 10 MB or smaller.');
        return;
      }

      const ticket = await CreateShopImageUploadAsync(
        itemId,
        prepared.contentType
      );

      await UploadShopImageAsync(
        ticket.uploadUrl,
        prepared.blob,
        ticket.contentType
      );

      const image = await CreateShopImageAsync(itemId, {
        objectKey: ticket.objectKey,
        altText: title.trim(),
      });

      onImagesChange([...images, image]);
    } catch {
      setUploadError('Image could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (image: ShopImage) => {
    const confirmed = window.confirm('Remove this image from the listing?');

    if (!confirmed) {
      return;
    }

    setUploadError('');
    setDeletingImageId(image.id);

    try {
      await DeleteShopImageAsync(itemId, image.id);
      onImagesChange(
        images.filter((currentImage) => currentImage.id !== image.id)
      );
    } catch {
      setUploadError('Image could not be removed.');
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="shop-images">
      <h2 id="shop-images">Images</h2>

      {uploadError && (
        <aside className={styles.errorNotice}>{uploadError}</aside>
      )}

      {images.length > 0 ? (
        <ul className={styles.imageList}>
          {images.map((image) => (
            <li className={styles.imageRow} key={image.id}>
              <img
                className={styles.imageThumb}
                src={image.url}
                alt={image.altText || title}
              />
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => deleteImage(image)}
                disabled={deletingImageId === image.id}
              >
                {deletingImageId === image.id ? 'Removing' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>No images on this listing yet.</p>
      )}

      <label className={styles.field} htmlFor="shop-image-upload">
        Add image
        <input
          id="shop-image-upload"
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          onChange={uploadImage}
          disabled={isUploading}
        />
      </label>
      <p className={styles.hint}>
        {isUploading
          ? 'Uploading image...'
          : 'Uploads go straight to storage. JPEG, PNG, WebP, AVIF, or GIF up to 10 MB; large photos are resized to 2000px and converted to WebP.'}
      </p>
    </section>
  );
}
