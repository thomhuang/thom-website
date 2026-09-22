import { useEffect, useRef, useState } from 'react';

import type { ShopBrand } from '../../api/Shop/ShopRouter';
import type { LayoutMode, SortOrder, StockFilter } from './shopFilters';
import styles from './Shop.module.css';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
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
  const [sortOpen, setSortOpen] = useState(false);
  const sortFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        sortFieldRef.current &&
        !sortFieldRef.current.contains(event.target as Node)
      ) {
        setSortOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSortOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortOpen]);

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOrder)?.label ?? sortOrder;

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

      <div className={styles.sortField} ref={sortFieldRef}>
        <span id="shop-sort-label">Sort</span>
        <button
          type="button"
          className={styles.sortButton}
          aria-haspopup="menu"
          aria-expanded={sortOpen}
          onClick={() => setSortOpen((open) => !open)}
        >
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
          <span>{sortLabel}</span>
          <svg
            className={styles.sortChevron}
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {sortOpen && (
          <ul
            className={styles.sortMenu}
            role="menu"
            aria-labelledby="shop-sort-label"
          >
            {SORT_OPTIONS.map((option) => (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={sortOrder === option.value}
                  className={styles.sortMenuItem}
                  onClick={() => {
                    onSortOrderChange(option.value);
                    setSortOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
