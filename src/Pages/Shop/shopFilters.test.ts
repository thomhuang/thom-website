import { beforeEach, describe, expect, test } from 'vitest';

import type { ShopItemSummary } from '../../api/Shop/ShopRouter';
import {
  filterItems,
  getInitialLayout,
  layoutStorageKey,
  sortItems,
} from './shopFilters';

const makeItem = (
  overrides: Partial<ShopItemSummary> = {}
): ShopItemSummary => ({
  id: '1',
  title: 'Item',
  brandId: '1',
  brand: 'Brand',
  priceCents: 1000,
  currency: 'usd',
  stock: 1,
  isPublished: true,
  primaryImageUrl: '',
  ...overrides,
});

const ALPHA = makeItem({ id: '1', title: 'Alpha', priceCents: 2000 });
const BETA = makeItem({
  id: '2',
  title: 'Beta',
  brandId: '2',
  priceCents: 1000,
  stock: 0,
});

describe('sortItems', () => {
  test('sorts by price in both directions', () => {
    expect(sortItems([ALPHA, BETA], 'price-asc').map((i) => i.title)).toEqual([
      'Beta',
      'Alpha',
    ]);
    expect(sortItems([ALPHA, BETA], 'price-desc').map((i) => i.title)).toEqual([
      'Alpha',
      'Beta',
    ]);
  });

  test('sorts oldest first by ascending id', () => {
    expect(sortItems([BETA, ALPHA], 'oldest').map((i) => i.id)).toEqual([
      '1',
      '2',
    ]);
  });

  test('leaves newest order untouched', () => {
    expect(sortItems([BETA, ALPHA], 'newest').map((i) => i.id)).toEqual([
      '2',
      '1',
    ]);
  });
});

describe('filterItems', () => {
  test('filters by brand and stock', () => {
    expect(
      filterItems([ALPHA, BETA], { selectedBrandId: '2', stockFilter: 'all' })
    ).toEqual([BETA]);
    expect(
      filterItems([ALPHA, BETA], { selectedBrandId: '', stockFilter: 'in-stock' })
    ).toEqual([ALPHA]);
    expect(
      filterItems([ALPHA, BETA], {
        selectedBrandId: '',
        stockFilter: 'out-of-stock',
      })
    ).toEqual([BETA]);
  });
});

describe('getInitialLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to grid', () => {
    expect(getInitialLayout()).toBe('grid');
  });

  test('reads a stored list preference', () => {
    localStorage.setItem(layoutStorageKey, 'list');
    expect(getInitialLayout()).toBe('list');
  });
});
