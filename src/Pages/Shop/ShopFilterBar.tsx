import type { ShopBrand } from '../../api/Shop/ShopRouter';
import type { LayoutMode, SortOrder, StockFilter } from './shopFilters';
import styles from './Shop.module.css';

type ShopFilterBarProps = {
  isOpen: boolean;
  brands: ShopBrand[];
  categories: string[];
  selectedBrandId: string;
  selectedCategory: string;
  stockFilter: StockFilter;
  sortOrder: SortOrder;
  layout: LayoutMode;
  onToggle: () => void;
  onBrandChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockFilterChange: (value: StockFilter) => void;
  onSortOrderChange: (value: SortOrder) => void;
  onLayoutChange: (value: LayoutMode) => void;
};

export default function ShopFilterBar({
  isOpen,
  brands,
  categories,
  selectedBrandId,
  selectedCategory,
  stockFilter,
  sortOrder,
  layout,
  onToggle,
  onBrandChange,
  onCategoryChange,
  onStockFilterChange,
  onSortOrderChange,
  onLayoutChange,
}: ShopFilterBarProps) {
  return (
    <div className={styles.filterGroup}>
      <button
        type="button"
        className={styles.filterToggle}
        aria-expanded={isOpen}
        aria-controls="shop-filters"
        onClick={onToggle}
      >
        Filters
        <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>

      <div
        id="shop-filters"
        className={[styles.filterBar, isOpen ? styles.filterBarOpen : ''].join(
          ' '
        )}
      >
        {categories.length > 0 && (
          <label className={styles.field} htmlFor="shop-category-filter">
            Category
            <select
              id="shop-category-filter"
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        )}

        {brands.length > 0 && (
          <label className={styles.field} htmlFor="shop-brand-filter">
            Brand
            <select
              id="shop-brand-filter"
              value={selectedBrandId}
              onChange={(event) => onBrandChange(event.target.value)}
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
              onStockFilterChange(event.target.value as StockFilter)
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
            onChange={(event) =>
              onSortOrderChange(event.target.value as SortOrder)
            }
          >
            <option value="random">Random</option>
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
                onClick={() => onLayoutChange(mode)}
                aria-pressed={layout === mode}
              >
                {mode === 'grid' ? 'Grid' : 'List'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
