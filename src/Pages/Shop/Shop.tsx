import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
import {
  DeleteShopItemAsync,
  GetShopBrandsAsync,
  GetShopItemsAsync,
  ShopBrand,
  ShopItemSummary,
  UpdateShopItemsPublicationAsync,
} from '../../api/Shop/ShopRouter';
import AsciiFigure from '../../Components/AsciiFigure/AsciiFigure';
import ShopCard from './ShopCard';
import ShopFilterBar from './ShopFilterBar';
import ShopPager from './ShopPager';
import {
  filterItems,
  getCategories,
  getInitialLayout,
  layoutStorageKey,
  sortItems,
} from './shopFilters';
import type { LayoutMode, SortOrder, StockFilter } from './shopFilters';
import { getPageSize, getTotalPages } from './shopPagination';
import styles from './Shop.module.css';

// The grid's `repeat(auto-fill, ...)` resolves to a concrete track list, so the
// number of columns it currently fits is the number of computed tracks. When CSS
// is unavailable (jsdom) or unresolved, report zero and fall back to one column.
const countGridColumns = (grid: HTMLElement): number => {
  const columns = getComputedStyle(grid).gridTemplateColumns;

  if (!columns || columns === 'none' || columns.includes('repeat(')) {
    return 0;
  }

  return columns.split(/\s+/).filter(Boolean).length;
};

export default function Shop() {
  useDocumentTitle('Shop');

  const { isAdmin, isAuthLoading } = useAuth();
  const [actionError, setActionError] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('random');
  const [randomSeed] = useState(() => Math.random());
  const [layout, setLayout] = useState<LayoutMode>(getInitialLayout);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPublicationUpdating, setIsPublicationUpdating] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [gridColumns, setGridColumns] = useState(1);
  const gridRef = useRef<HTMLElement>(null);

  const {
    data,
    setData,
    isLoading,
    error: loadError,
  } = useAsync(
    async (signal) => {
      const [loadedItems, loadedBrands] = await Promise.all([
        GetShopItemsAsync(signal),
        GetShopBrandsAsync(signal).catch((): ShopBrand[] => []),
      ]);

      return { items: loadedItems, brands: loadedBrands };
    },
    [],
    {
      initialData: {
        items: [] as ShopItemSummary[],
        brands: [] as ShopBrand[],
      },
      errorMessage: 'Listings could not be loaded.',
    }
  );
  const { items, brands } = data;
  const shopError = loadError || actionError;

  useEffect(() => {
    localStorage.setItem(layoutStorageKey, layout);
  }, [layout]);

  const deleteItem = async (item: ShopItemSummary) => {
    const confirmed = window.confirm(`Delete ${item.title} from the shop?`);

    if (!confirmed) {
      return;
    }

    setActionError('');
    setDeletingItemId(item.id);

    try {
      await DeleteShopItemAsync(item.id);
      setData((current) => ({
        ...current,
        items: current.items.filter(
          (currentItem) => currentItem.id !== item.id
        ),
      }));
      setSelectedIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(item.id);
        return nextIds;
      });
    } catch {
      setActionError('Listing could not be deleted.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
      return nextIds;
    });
  };

  const setSelectedPublished = async (isPublished: boolean) => {
    if (selectedIds.size === 0) {
      return;
    }

    setActionError('');
    setIsPublicationUpdating(true);

    try {
      await UpdateShopItemsPublicationAsync([...selectedIds], isPublished);
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          selectedIds.has(item.id) ? { ...item, isPublished } : item
        ),
      }));
      setSelectedIds(new Set());
    } catch {
      setActionError(
        isPublished
          ? 'Selected listings could not be published.'
          : 'Selected listings could not be unpublished.'
      );
    } finally {
      setIsPublicationUpdating(false);
    }
  };

  const visibleItems = sortItems(
    filterItems(items, { selectedBrandId, selectedCategory, stockFilter }),
    sortOrder,
    randomSeed
  );
  const categories = getCategories(items);
  const canManage = !isAuthLoading && isAdmin;
  const pageSize = getPageSize(layout, gridColumns);
  const totalPages = getTotalPages(visibleItems.length, pageSize);
  const currentPage = Math.min(page, totalPages);
  const pageItems = visibleItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Changing the result set starts back at the first page.
  const changeBrand = (brandId: string) => {
    setSelectedBrandId(brandId);
    setPage(1);
  };

  const changeCategory = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const changeStockFilter = (filter: StockFilter) => {
    setStockFilter(filter);
    setPage(1);
  };

  const changeSortOrder = (order: SortOrder) => {
    setSortOrder(order);
    setPage(1);
  };

  // Keep the page in range when the page size shrinks (layout switch or resize).
  // Adjusting during render is React's alternative to an effect here, and avoids
  // committing a frame with an out-of-range page.
  if (page > totalPages) {
    setPage(totalPages);
  }

  // Size a grid page from the columns the responsive grid currently fits.
  useLayoutEffect(() => {
    if (layout !== 'grid') {
      return;
    }

    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const measure = () => {
      const columns = countGridColumns(grid);
      if (columns > 0) {
        setGridColumns(columns);
      }
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(grid);

    return () => observer.disconnect();
  }, [layout, visibleItems.length, isLoading]);

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

      {canManage && items.length > 0 && (
        <div className={styles.bulkActions}>
          <p className={styles.statusText}>{selectedIds.size} selected</p>
          <button
            type="button"
            className={styles.saveButton}
            disabled={selectedIds.size === 0 || isPublicationUpdating}
            onClick={() => setSelectedPublished(true)}
          >
            Publish selected
          </button>
          <button
            type="button"
            className={styles.saveButton}
            disabled={selectedIds.size === 0 || isPublicationUpdating}
            onClick={() => setSelectedPublished(false)}
          >
            Unpublish selected
          </button>
        </div>
      )}

      {shopError && <aside className={styles.errorNotice}>{shopError}</aside>}

      {!isLoading && (brands.length > 0 || items.length > 0) && (
        <ShopFilterBar
          isOpen={filtersOpen}
          brands={brands}
          categories={categories}
          selectedBrandId={selectedBrandId}
          selectedCategory={selectedCategory}
          stockFilter={stockFilter}
          sortOrder={sortOrder}
          layout={layout}
          onToggle={() => setFiltersOpen((open) => !open)}
          onBrandChange={changeBrand}
          onCategoryChange={changeCategory}
          onStockFilterChange={changeStockFilter}
          onSortOrderChange={changeSortOrder}
          onLayoutChange={setLayout}
        />
      )}

      {isLoading ? (
        <p className={styles.statusText}>Loading listings...</p>
      ) : visibleItems.length > 0 ? (
        <>
          <p className={styles.statusText}>
            {items.length} item{items.length === 1 ? '' : 's'}
          </p>
          <section
            ref={gridRef}
            className={layout === 'grid' ? styles.grid : styles.list}
            aria-label="Listings"
          >
            {pageItems.map((item) => (
              <ShopCard
                key={item.id}
                item={item}
                canManage={canManage}
                isDeleting={deletingItemId === item.id}
                isSelected={selectedIds.has(item.id)}
                onDelete={deleteItem}
                onToggleSelected={toggleSelected}
              />
            ))}
          </section>
          <ShopPager
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
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
