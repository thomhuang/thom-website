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
import { formatPrice, formatStock } from './format';
import styles from './Shop.module.css';

type SortOrder = 'newest' | 'oldest' | 'price-asc' | 'price-desc';
type LayoutMode = 'grid' | 'list';
type StockFilter = 'all' | 'in-stock' | 'out-of-stock';

const layoutStorageKey = 'shop-layout';

const getInitialLayout = (): LayoutMode =>
  localStorage.getItem(layoutStorageKey) === 'list' ? 'list' : 'grid';

// Listings arrive newest first. `id` is the insertion order, so ascending id is
// oldest first; the price orders are plain numeric comparisons.
const sortItems = (items: ShopItemSummary[], sortOrder: SortOrder) => {
  const sortedItems = [...items];

  switch (sortOrder) {
    case 'oldest':
      return sortedItems.sort((a, b) => Number(a.id) - Number(b.id));
    case 'price-asc':
      return sortedItems.sort((a, b) => a.priceCents - b.priceCents);
    case 'price-desc':
      return sortedItems.sort((a, b) => b.priceCents - a.priceCents);
    default:
      return sortedItems;
  }
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
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [layout, setLayout] = useState<LayoutMode>(getInitialLayout);
  const [isLoading, setIsLoading] = useState(true);
  const [shopError, setShopError] = useState('');
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadItems = async () => {
      setShopError('');

      try {
        const [loadedItems, loadedBrands] = await Promise.all([
          GetShopItemsAsync(controller.signal),
          GetShopBrandsAsync(controller.signal).catch(
            (): ShopBrand[] => []
          ),
        ]);

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

  useEffect(() => {
    localStorage.setItem(layoutStorageKey, layout);
  }, [layout]);

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

  const visibleItems = sortItems(
    items.filter((item) => {
      if (selectedBrandId && item.brandId !== selectedBrandId) {
        return false;
      }
      if (stockFilter === 'in-stock' && item.stock < 1) {
        return false;
      }
      if (stockFilter === 'out-of-stock' && item.stock >= 1) {
        return false;
      }

      return true;
    }),
    sortOrder
  );

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="shop-title">
        <h1 id="shop-title">Shop</h1>
        <p className={styles.deck}>my things</p>
      </section>

      {!isAuthLoading && isAdmin && (
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.ShopEntry}>
            New listing
          </Link>
          <Link className={styles.textLink} to={PAGES.ShopOrders}>
            Orders
          </Link>
        </div>
      )}

      {shopError && <aside className={styles.errorNotice}>{shopError}</aside>}

      {!isLoading && (brands.length > 0 || items.length > 0) && (
        <div className={styles.filterBar}>
          {brands.length > 0 && (
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
          )}

          <label className={styles.field} htmlFor="shop-stock-filter">
            Availability
            <select
              id="shop-stock-filter"
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(event.target.value as StockFilter)
              }
            >
              <option value="all">All items</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Sold out</option>
            </select>
          </label>

          <label className={styles.field} htmlFor="shop-sort">
            Sort
            <select
              id="shop-sort"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>

          <div className={styles.layoutField}>
            View
            <div
              className={styles.layoutToggle}
              role="group"
              aria-label="Listing layout"
            >
              {(['grid', 'list'] as LayoutMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  className={[
                    styles.layoutToggleButton,
                    layout === mode ? styles.selectedLayout : '',
                  ].join(' ')}
                  onClick={() => setLayout(mode)}
                  aria-pressed={layout === mode}
                >
                  {mode === 'grid' ? 'Grid' : 'List'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className={styles.statusText}>Loading listings...</p>
      ) : visibleItems.length > 0 ? (
        <section
          className={layout === 'grid' ? styles.grid : styles.list}
          aria-label="Listings"
        >
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
                  <div className={styles.cardInfo}>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    {item.brand && (
                      <p className={styles.cardMeta}>{item.brand}</p>
                    )}
                  </div>
                  <div className={styles.cardPricing}>
                    <p className={styles.cardPrice}>
                      {formatPrice(item.priceCents, item.currency)}
                    </p>
                    <p className={styles.cardMeta}>{formatStock(item.stock)}</p>
                    {!item.isPublished && (
                      <p className={styles.draftTag}>Draft</p>
                    )}
                  </div>
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
              ? 'No listings match these filters.'
              : 'Nothing listed yet.'}
          </p>
          <p>Published listings will show here.</p>
        </div>
      )}
    </main>
  );
}
