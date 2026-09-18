import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  DeleteShopItemAsync,
  GetShopBrandsAsync,
  GetShopItemsAsync,
  ShopBrand,
  ShopItemSummary,
} from '../../api/Shop/ShopRouter';
import { formatPrice } from './format';
import styles from './Shop.module.css';

const formatStock = (stock: number) => {
  if (stock < 1) {
    return 'Sold out';
  }

  return stock === 1 ? '1 available' : `${stock} available`;
};

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <span className={styles.cardPlaceholder}>No image</span>;
  }

  return (
    <img
      className={styles.cardImage}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export default function Shop() {
  const { isAdmin, isAuthLoading } = useAuth();
  const [items, setItems] = useState<ShopItemSummary[]>([]);
  const [brands, setBrands] = useState<ShopBrand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [shopError, setShopError] = useState('');
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadItems = async () => {
      setShopError('');

      try {
        const loadedItems = await GetShopItemsAsync(controller.signal);
        const loadedBrands = await GetShopBrandsAsync(controller.signal).catch(
          () => [] as ShopBrand[]
        );

        if (isMounted) {
          setItems(loadedItems);
          setBrands(loadedBrands);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setShopError('Listings could not be loaded.');
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const deleteItem = async (item: ShopItemSummary) => {
    const confirmed = window.confirm(`Delete ${item.title} from the shop?`);

    if (!confirmed) {
      return;
    }

    setShopError('');
    setDeletingItemId(item.id);

    try {
      await DeleteShopItemAsync(item.id);
      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id)
      );
    } catch {
      setShopError('Listing could not be deleted.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const visibleItems = selectedBrandId
    ? items.filter((item) => item.brandId === selectedBrandId)
    : items;

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="shop-title">
        <h1 id="shop-title">Shop</h1>
        <p className={styles.deck}>Small batches, shipped from the workbench.</p>
      </section>

      {!isAuthLoading && isAdmin && (
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.ShopEntry}>
            New listing
          </Link>
        </div>
      )}

      {shopError && <aside className={styles.errorNotice}>{shopError}</aside>}

      {brands.length > 0 && (
        <div className={styles.filterBar}>
          <label className={styles.field} htmlFor="shop-brand-filter">
            Brand
            <select
              id="shop-brand-filter"
              value={selectedBrandId}
              onChange={(event) => setSelectedBrandId(event.target.value)}
            >
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option value={brand.id} key={brand.id}>
                  {brand.brand}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {isLoading ? (
        <p className={styles.statusText}>Loading listings...</p>
      ) : visibleItems.length > 0 ? (
        <section className={styles.grid} aria-label="Listings">
          {visibleItems.map((item) => (
            <article className={styles.card} key={item.id}>
              <Link
                className={styles.cardLink}
                to={`${PAGES.ShopItem}/${item.id}`}
              >
                <div className={styles.cardMedia}>
                  <CardImage src={item.primaryImageUrl} alt={item.title} />
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{item.title}</h2>
                  {item.brand && (
                    <p className={styles.cardMeta}>{item.brand}</p>
                  )}
                  <p className={styles.cardPrice}>
                    {formatPrice(item.priceCents, item.currency)}
                  </p>
                  <p className={styles.cardMeta}>{formatStock(item.stock)}</p>
                  {!item.isPublished && (
                    <p className={styles.draftTag}>Draft</p>
                  )}
                </div>
              </Link>

              {!isAuthLoading && isAdmin && (
                <div className={styles.cardActions}>
                  <Link
                    className={styles.textLink}
                    to={`${PAGES.ShopEntry}/${item.id}`}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => deleteItem(item)}
                    disabled={deletingItemId === item.id}
                  >
                    {deletingItemId === item.id ? 'Deleting' : 'Delete'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>
          <p>
            {items.length > 0
              ? 'No listings for this brand.'
              : 'Nothing listed yet.'}
          </p>
          <p>Published listings will show here.</p>
        </div>
      )}
    </main>
  );
}
