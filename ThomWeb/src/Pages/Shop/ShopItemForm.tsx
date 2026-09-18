import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CreateShopImageAsync,
  CreateShopImageUploadAsync,
  CreateShopItemAsync,
  DeleteShopImageAsync,
  GetShopBrandsAsync,
  GetShopItemByIdAsync,
  ShopBrand,
  ShopImage,
  UpdateShopItemAsync,
  UploadShopImageAsync,
} from '../../api/Shop/ShopRouter';
import { formatPriceInput, parsePriceToCents } from './format';
import {
  MAX_IMAGE_BYTES,
  MAX_SOURCE_IMAGE_BYTES,
  prepareImageForUpload,
} from './imageUpload';
import styles from './Shop.module.css';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

type ShopItemDraft = {
  title: string;
  description: string;
  brand: string;
  price: string;
  stock: string;
  isPublished: boolean;
};

type DraftField = 'title' | 'description' | 'brand' | 'price' | 'stock';

const createEmptyDraft = (): ShopItemDraft => ({
  title: '',
  description: '',
  brand: '',
  price: '',
  stock: '1',
  isPublished: false,
});

const validateStock = (value: string) =>
  /^\d+$/.test(value.trim()) ? null : 'Enter a whole number';

export default function ShopItemForm() {
  const { itemId } = useParams<{ itemId?: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthLoading } = useAuth();
  const isEditing = Boolean(itemId);

  const [draft, setDraft] = useState<ShopItemDraft>(createEmptyDraft);
  const [images, setImages] = useState<ShopImage[]>([]);
  const [brandOptions, setBrandOptions] = useState<ShopBrand[]>([]);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isItemLoading, setIsItemLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [itemLoadFailed, setItemLoadFailed] = useState(false);

  const priceCents = parsePriceToCents(draft.price);
  const stockError = validateStock(draft.stock);
  const titleError = draft.title.trim() ? null : 'Title is required';
  const priceError =
    priceCents === null || priceCents < 1 ? 'Enter a price like 18.00' : null;
  const fieldErrors = { title: titleError, price: priceError, stock: stockError };
  const canShowForm =
    !isAuthLoading && isAdmin && !isItemLoading && !itemLoadFailed;

  useEffect(() => {
    if (!isEditing || !itemId) {
      setDraft(createEmptyDraft());
      setImages([]);
      setFormError('');
      setUploadError('');
      setItemLoadFailed(false);
      setIsItemLoading(false);
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (!isAdmin) {
      setIsItemLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadItem = async () => {
      setIsItemLoading(true);
      setFormError('');
      setItemLoadFailed(false);

      try {
        const item = await GetShopItemByIdAsync(itemId, controller.signal);

        if (isMounted) {
          setDraft({
            title: item.title,
            description: item.description,
            brand: item.brand || '',
            price: formatPriceInput(item.priceCents),
            stock: String(item.stock),
            isPublished: item.isPublished,
          });
          setImages(item.images);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setItemLoadFailed(true);
          setFormError('Listing could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsItemLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading, isEditing, itemId]);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) {
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadBrands = async () => {
      try {
        const brands = await GetShopBrandsAsync(controller.signal);

        if (isMounted) {
          setBrandOptions(brands);
        }
      } catch {
        // Brand suggestions are optional; the listing form still works.
      }
    };

    loadBrands();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading]);

  const updateDraft =
    (field: DraftField) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setDraft((currentDraft) => ({
        ...currentDraft,
        [field]: event.target.value,
      }));
    };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fieldErrors.title || fieldErrors.price || fieldErrors.stock) {
      return;
    }
    if (priceCents === null) {
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const request = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      brandId: '',
      brand: draft.brand.trim(),
      priceCents,
      currency: 'usd',
      stock: Number(draft.stock),
      isPublished: draft.isPublished,
    };

    try {
      if (isEditing && itemId) {
        await UpdateShopItemAsync(itemId, request);
        navigate(PAGES.Shop);
        return;
      }

      const createdItem = await CreateShopItemAsync(request);

      // Images need an item id, so a new listing continues on its edit page.
      navigate(`${PAGES.ShopEntry}/${createdItem.id}`);
    } catch {
      setFormError(
        isEditing
          ? 'Listing could not be updated.'
          : 'Listing could not be saved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !itemId) {
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
        altText: draft.title.trim(),
      });

      setImages((currentImages) => [...currentImages, image]);
    } catch {
      setUploadError('Image could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (image: ShopImage) => {
    if (!itemId) {
      return;
    }

    const confirmed = window.confirm('Remove this image from the listing?');

    if (!confirmed) {
      return;
    }

    setUploadError('');
    setDeletingImageId(image.id);

    try {
      await DeleteShopImageAsync(itemId, image.id);
      setImages((currentImages) =>
        currentImages.filter((currentImage) => currentImage.id !== image.id)
      );
    } catch {
      setUploadError('Image could not be removed.');
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="shop-entry-title">
        <h1 id="shop-entry-title">
          {isEditing ? 'Edit listing' : 'New listing'}
        </h1>
        <p className={styles.deck}>
          Everything a buyer sees on the listing page.
        </p>
      </section>

      {isAuthLoading && (
        <aside className={styles.notice}>Checking admin access...</aside>
      )}

      {!isAuthLoading && !isAdmin && (
        <section className={styles.publicState} aria-labelledby="shop-entry-admin">
          <h2 id="shop-entry-admin">Sign in to manage listings.</h2>
          <p>The public shop is view-only.</p>
        </section>
      )}

      {!isAuthLoading && isAdmin && isItemLoading && (
        <aside className={styles.notice}>Loading listing...</aside>
      )}

      {!isAuthLoading && isAdmin && itemLoadFailed && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}
          <div className={styles.adminActions}>
            <Link className={styles.textLink} to={PAGES.Shop}>
              Back to shop
            </Link>
          </div>
        </>
      )}

      {canShowForm && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}

          <form className={styles.form} onSubmit={saveItem}>
            <section className={styles.section} aria-labelledby="shop-details">
              <h2 id="shop-details">Listing details</h2>

              <div className={styles.fieldGrid}>
                <label className={styles.field} htmlFor="shop-title-input">
                  <span className={styles.labelRow}>
                    Title
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="shop-title-input"
                    className={fieldErrors.title ? styles.invalid : undefined}
                    type="text"
                    value={draft.title}
                    onChange={updateDraft('title')}
                    maxLength={200}
                    required
                  />
                  {fieldErrors.title && (
                    <span className={styles.fieldError}>{fieldErrors.title}</span>
                  )}
                </label>

                <label className={styles.field} htmlFor="shop-price">
                  <span className={styles.labelRow}>
                    Price (USD)
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="shop-price"
                    className={fieldErrors.price ? styles.invalid : undefined}
                    type="text"
                    inputMode="decimal"
                    placeholder="18.00"
                    value={draft.price}
                    onChange={updateDraft('price')}
                    required
                  />
                  {fieldErrors.price && (
                    <span className={styles.fieldError}>{fieldErrors.price}</span>
                  )}
                </label>

                <label className={styles.field} htmlFor="shop-stock">
                  <span className={styles.labelRow}>
                    Stock
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="shop-stock"
                    className={fieldErrors.stock ? styles.invalid : undefined}
                    type="text"
                    inputMode="numeric"
                    value={draft.stock}
                    onChange={updateDraft('stock')}
                    required
                  />
                  {fieldErrors.stock && (
                    <span className={styles.fieldError}>{fieldErrors.stock}</span>
                  )}
                </label>

                <label className={styles.field} htmlFor="shop-brand">
                  Brand
                  <input
                    id="shop-brand"
                    type="text"
                    list="shop-brand-options"
                    value={draft.brand}
                    onChange={updateDraft('brand')}
                    placeholder="e.g. Acme Coffee"
                  />
                  <datalist id="shop-brand-options">
                    {brandOptions.map((brand) => (
                      <option value={brand.brand} key={brand.id} />
                    ))}
                  </datalist>
                </label>
              </div>

              <label className={styles.field} htmlFor="shop-description">
                Description
                <textarea
                  id="shop-description"
                  value={draft.description}
                  onChange={updateDraft('description')}
                  maxLength={5000}
                  rows={6}
                />
              </label>

              <label className={styles.checkboxField} htmlFor="shop-published">
                <input
                  id="shop-published"
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      isPublished: event.target.checked,
                    }))
                  }
                />
                Published
                <span className={styles.hint}>
                  Drafts are only visible while signed in.
                </span>
              </label>
            </section>

            <section className={styles.section} aria-labelledby="shop-images">
              <h2 id="shop-images">Images</h2>

              {uploadError && (
                <aside className={styles.errorNotice}>{uploadError}</aside>
              )}

              {itemId ? (
                <>
                  {images.length > 0 ? (
                    <ul className={styles.imageList}>
                      {images.map((image) => (
                        <li className={styles.imageRow} key={image.id}>
                          <img
                            className={styles.imageThumb}
                            src={image.url}
                            alt={image.altText || draft.title}
                          />
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => deleteImage(image)}
                            disabled={deletingImageId === image.id}
                          >
                            {deletingImageId === image.id
                              ? 'Removing'
                              : 'Remove'}
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
                </>
              ) : (
                <p className={styles.hint}>
                  Save the listing first, then add images.
                </p>
              )}
            </section>

            <div className={styles.actions}>
              <Link className={styles.textLink} to={PAGES.Shop}>
                Cancel
              </Link>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving'
                  : isEditing
                    ? 'Save changes'
                    : 'Save listing'}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
