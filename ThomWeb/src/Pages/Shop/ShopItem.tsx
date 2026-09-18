import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  GetShopItemByIdAsync,
  ShopItem as ShopItemResponse,
  StartShopCheckoutAsync,
} from '../../api/Shop/ShopRouter';
import { formatPrice, getPrimaryImage } from './format';
import styles from './Shop.module.css';

export default function ShopItem() {
  const { itemId } = useParams<{ itemId?: string }>();
  const { isAdmin, isAuthLoading } = useAuth();
  const [item, setItem] = useState<ShopItemResponse | null>(null);
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
        <div className={styles.gallery}>
          <div className={styles.galleryMain}>
            {selectedImageUrl && selectedImageUrl !== failedImageUrl ? (
              <img
                className={styles.galleryImage}
                src={selectedImageUrl}
                alt={item.title}
                onError={() => setFailedImageUrl(selectedImageUrl)}
              />
            ) : (
              <span className={styles.cardPlaceholder}>No image</span>
            )}
          </div>

          {item.images.length > 1 && (
            <div className={styles.thumbnails}>
              {item.images.map((image) => (
                <button
                  type="button"
                  className={[
                    styles.thumbnail,
                    image.url === selectedImageUrl ? styles.selectedThumbnail : '',
                  ].join(' ')}
                  key={image.id}
                  onClick={() => setSelectedImageUrl(image.url)}
                  aria-pressed={image.url === selectedImageUrl}
                  aria-label={image.altText || item.title}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.detailBody}>
          <h1 className={styles.detailTitle}>{item.title}</h1>
          {item.brand && <p className={styles.cardMeta}>{item.brand}</p>}
          <p className={styles.detailPrice}>
            {formatPrice(item.priceCents, item.currency)}
          </p>
          <p className={styles.cardMeta}>
            {isSoldOut ? 'Sold out' : `${item.stock} available`}
          </p>

          {!item.isPublished && <p className={styles.draftTag}>Draft</p>}

          {item.description && (
            <p className={styles.detailDescription}>{item.description}</p>
          )}

          <button
            type="button"
            className={styles.buyButton}
            onClick={startCheckout}
            disabled={isSoldOut || isCheckingOut}
          >
            {isSoldOut
              ? 'Sold out'
              : isCheckingOut
              ? 'Redirecting...'
              : 'Buy now'}
          </button>
          {checkoutError && (
            <p className={styles.errorNotice}>{checkoutError}</p>
          )}

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
    </main>
  );
}
