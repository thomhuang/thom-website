import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  GetShopItemByIdAsync,
  ShopImage,
  ShopItem as ShopItemResponse,
  StartShopCheckoutAsync,
} from '../../api/Shop/ShopRouter';
import { formatPrice, formatStock, getPrimaryImage } from './format';
import ShopImageManager from './ShopImageManager';
import ShopItemGallery from './ShopItemGallery';
import ShopItemMeasurementsTable from './ShopItemMeasurementsTable';
import styles from './Shop.module.css';

export default function ShopItem() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { isAdmin, isAuthLoading } = useAuth();
  const [item, setItem] = useState<ShopItemResponse | null>(null);
  const [images, setImages] = useState<ShopImage[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [failedImageUrl, setFailedImageUrl] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [itemError, setItemError] = useState('');

  useEffect(() => {
    if (!itemId) {
      setIsLoading(false);
      setItemError('Listing could not be found.');
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadItem = async () => {
      setIsLoading(true);
      setItemError('');

      try {
        const loadedItem = await GetShopItemByIdAsync(itemId, controller.signal);

        if (isMounted) {
          setItem(loadedItem);
          setImages(loadedItem.images);
          setSelectedImageUrl(getPrimaryImage(loadedItem.images));
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setItem(null);
          setItemError('Listing could not be found.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [itemId]);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.statusText}>Loading listing...</p>
      </main>
    );
  }

  if (itemError || !item) {
    return (
      <main className={styles.page}>
        <aside className={styles.errorNotice}>
          {itemError || 'Listing could not be found.'}
        </aside>
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.Shop}>
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const isSoldOut = item.stock < 1;
  const measurements = item.measurements ?? [];

  const handleImagesChange = (nextImages: ShopImage[]) => {
    setImages(nextImages);
    setSelectedImageUrl((currentUrl) =>
      nextImages.some((image) => image.url === currentUrl)
        ? currentUrl
        : getPrimaryImage(nextImages)
    );
    setFailedImageUrl('');
  };

  const startCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const session = await StartShopCheckoutAsync(item.id);
      // Stripe's URL is server-controlled, but validate the origin anyway so a
      // tampered response cannot turn this into an open redirect.
      const checkout = new URL(session.url);
      if (checkout.protocol !== 'https:' || checkout.hostname !== 'checkout.stripe.com') {
        throw new Error('unexpected checkout URL');
      }
      window.location.assign(checkout.href);
    } catch {
      setCheckoutError('Checkout could not be started.');
      setIsCheckingOut(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.adminActions}>
        <Link className={styles.textLink} to={PAGES.Shop}>
          Back to shop
        </Link>
      </div>

      <article className={styles.detail}>
        <ShopItemGallery
          images={images}
          title={item.title}
          selectedImageUrl={selectedImageUrl}
          failedImageUrl={failedImageUrl}
          onSelectImage={setSelectedImageUrl}
          onImageError={setFailedImageUrl}
        />

        <div className={styles.detailBody}>
          <h1 className={styles.detailTitle}>{item.title}</h1>
          {item.brand && <p className={styles.cardMeta}>{item.brand}</p>}
          {item.size && <p className={styles.cardMeta}>Size {item.size}</p>}
          <p className={styles.detailPrice}>
            {formatPrice(item.priceCents, item.currency)}
          </p>
          <p className={styles.cardMeta}>{formatStock(item.stock)}</p>

          {!item.isPublished && <p className={styles.draftTag}>Draft</p>}

          {item.description && (
            <p className={styles.detailDescription}>{item.description}</p>
          )}

          {measurements.length > 0 && (
            <ShopItemMeasurementsTable measurements={measurements} />
          )}

          <button
            type="button"
            className={styles.buyButton}
            onClick={startCheckout}
            disabled={isSoldOut || isCheckingOut}
          >
            {isSoldOut
              ? formatStock(item.stock)
              : isCheckingOut
              ? 'Redirecting...'
              : 'Buy now'}
          </button>
          {checkoutError && (
            <p className={styles.errorNotice}>{checkoutError}</p>
          )}

          <p className={styles.pickupNotice}>
            Local pickup available —{' '}
            <a
              className={styles.textLink}
              href="mailto:thomaskhuangg@gmail.com"
            >
              contact me
            </a>{' '}
            to arrange before buying.
          </p>

          {!isAuthLoading && isAdmin && (
            <div className={styles.detailActions}>
              <Link
                className={styles.textLink}
                to={`${PAGES.ShopEntry}/${item.id}`}
              >
                Edit listing
              </Link>
            </div>
          )}
        </div>
      </article>

      {!isAuthLoading && isAdmin && (
        <ShopImageManager
          itemId={item.id}
          title={item.title}
          images={images}
          onImagesChange={handleImagesChange}
        />
      )}
    </main>
  );
}
