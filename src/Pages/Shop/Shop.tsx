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
import AsciiFigure from '../../Components/AsciiFigure/AsciiFigure';
import ShopCard from './ShopCard';
import ShopFilterBar from './ShopFilterBar';
import {
  filterItems,
  getInitialLayout,
  layoutStorageKey,
  sortItems,
} from './shopFilters';
import type { LayoutMode, SortOrder, StockFilter } from './shopFilters';
import styles from './Shop.module.css';

export default function Shop() {
  const { isAdmin, isAuthLoading } = useAuth();
  const [items, setItems] = useState<ShopItemSummary[]>([]);
  const [brands, setBrands] = useState<ShopBrand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('random');
  const [randomSeed] = useState(() => Math.random());
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
    filterItems(items, { selectedBrandId, stockFilter }),
    sortOrder,
    randomSeed
  );
  const canManage = !isAuthLoading && isAdmin;

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="shop-title">
        <h1 id="shop-title">Shop</h1>
        <p className={styles.deck}>my things</p>
        <AsciiFigure variant="shop" size="large" />
      </section>

      {canManage && (
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
        <ShopFilterBar
          brands={brands}
          selectedBrandId={selectedBrandId}
          stockFilter={stockFilter}
          sortOrder={sortOrder}
          layout={layout}
          onBrandChange={setSelectedBrandId}
          onStockFilterChange={setStockFilter}
          onSortOrderChange={setSortOrder}
          onLayoutChange={setLayout}
        />
      )}

      {isLoading ? (
        <p className={styles.statusText}>Loading listings...</p>
      ) : visibleItems.length > 0 ? (
        <section
          className={layout === 'grid' ? styles.grid : styles.list}
          aria-label="Listings"
        >
          {visibleItems.map((item) => (
            <ShopCard
              key={item.id}
              item={item}
              canManage={canManage}
              isDeleting={deletingItemId === item.id}
              onDelete={deleteItem}
            />
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
