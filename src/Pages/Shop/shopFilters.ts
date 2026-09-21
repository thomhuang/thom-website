import type { ShopItemSummary } from '../../api/Shop/ShopRouter';

export type SortOrder = 'newest' | 'oldest' | 'price-asc' | 'price-desc';
export type LayoutMode = 'grid' | 'list';
export type StockFilter = 'all' | 'in-stock' | 'out-of-stock';

export const layoutStorageKey = 'shop-layout';

export const getInitialLayout = (): LayoutMode =>
  localStorage.getItem(layoutStorageKey) === 'grid' ? 'grid' : 'list';

// Listings arrive newest first. `id` is the insertion order, so ascending id is
// oldest first; the price orders are plain numeric comparisons.
export const sortItems = (
  items: ShopItemSummary[],
  sortOrder: SortOrder
) => {
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

type ItemFilterOptions = {
  selectedBrandId: string;
  stockFilter: StockFilter;
};

export const filterItems = (
  items: ShopItemSummary[],
  { selectedBrandId, stockFilter }: ItemFilterOptions
) =>
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
  });
