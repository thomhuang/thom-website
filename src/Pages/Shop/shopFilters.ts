import type { ShopItemSummary } from '../../api/Shop/ShopRouter';

export type SortOrder =
  | 'random'
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc';
export type LayoutMode = 'grid' | 'list';
export type StockFilter = 'all' | 'in-stock' | 'out-of-stock';

export const layoutStorageKey = 'shop-layout';

export const getInitialLayout = (): LayoutMode =>
  localStorage.getItem(layoutStorageKey) === 'grid' ? 'grid' : 'list';

// Deterministic PRNG so a given visit shuffles once and keeps that order while
// the user filters or re-sorts, then reshuffles on the next mount/refresh.
const seededRandom = (seed: number) => {
  let state = Math.floor(seed * 2 ** 32) || 1;

  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
};

const shuffle = <T,>(items: T[], seed: number): T[] => {
  const shuffled = [...items];
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

// Listings arrive newest first. `id` is the insertion order, so ascending id is
// oldest first; the price orders are plain numeric comparisons.
export const sortItems = (
  items: ShopItemSummary[],
  sortOrder: SortOrder,
  randomSeed = 0
) => {
  const sortedItems = [...items];

  switch (sortOrder) {
    case 'random':
      return shuffle(sortedItems, randomSeed);
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
