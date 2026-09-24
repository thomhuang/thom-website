import type { ShopBrand } from '../../api/Shop/ShopRouter';
import ShopDropdown from './ShopDropdown';
import type { LayoutMode, SortOrder, StockFilter } from './shopFilters';
import styles from './Shop.module.css';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'All items' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'out-of-stock', label: 'Sold out' },
];

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
          <ShopDropdown
            label="Category"
            value={selectedCategory}
            options={[
              { value: '', label: 'All categories' },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            onChange={onCategoryChange}
          />
        )}

        {brands.length > 0 && (
          <ShopDropdown
            label="Brand"
            value={selectedBrandId}
            options={[
              { value: '', label: 'All brands' },
              ...brands.map((brand) => ({
                value: brand.id,
                label: brand.brand,
              })),
            ]}
            onChange={onBrandChange}
          />
        )}

        <ShopDropdown
          label="Availability"
          value={stockFilter}
          options={STOCK_OPTIONS}
          onChange={(value) => onStockFilterChange(value as StockFilter)}
        />

        <ShopDropdown
          label="Sort"
          value={sortOrder}
          options={SORT_OPTIONS}
          onChange={(value) => onSortOrderChange(value as SortOrder)}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 3v14" />
              <path d="m5 6 3-3 3 3" />
              <path d="M16 21V7" />
              <path d="m13 18 3 3 3-3" />
            </svg>
          }
        />

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
