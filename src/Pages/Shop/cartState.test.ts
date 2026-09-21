import { beforeEach, describe, expect, test } from 'vitest';

import {
  addCartLine,
  CartLine,
  cartCount,
  cartStorageKey,
  cartSubtotalCents,
  loadCart,
  removeCartLine,
  setCartLineQuantity,
} from './cartState';

const makeLine = (overrides: Partial<CartLine> = {}): CartLine => ({
  itemId: '1',
  title: 'Alpha Jacket',
  priceCents: 2000,
  currency: 'usd',
  stock: 5,
  primaryImageUrl: '',
  quantity: 1,
  ...overrides,
});

describe('addCartLine', () => {
  test('appends a new item', () => {
    const line = makeLine({ itemId: '2' });
    expect(addCartLine([], line)).toEqual([line]);
  });

  test('increments an existing item and caps at stock', () => {
    const existing = makeLine({ quantity: 4 });
    const result = addCartLine([existing], makeLine({ quantity: 3 }));

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
  });
});

describe('setCartLineQuantity', () => {
  test('updates a quantity clamped to the stock', () => {
    const line = makeLine({ stock: 3, quantity: 1 });

    expect(setCartLineQuantity([line], '1', 2)[0].quantity).toBe(2);
    expect(setCartLineQuantity([line], '1', 99)[0].quantity).toBe(3);
    expect(setCartLineQuantity([line], '1', 0)[0].quantity).toBe(1);
  });
});

describe('removeCartLine', () => {
  test('removes a line by item id', () => {
    const keep = makeLine({ itemId: '1' });
    const drop = makeLine({ itemId: '2' });

    expect(removeCartLine([keep, drop], '2')).toEqual([keep]);
  });
});

describe('cart totals', () => {
  test('counts quantities and sums the subtotal', () => {
    const lines = [makeLine({ priceCents: 2000, quantity: 2 }), makeLine({ itemId: '2', priceCents: 500, quantity: 3 })];

    expect(cartCount(lines)).toBe(5);
    expect(cartSubtotalCents(lines)).toBe(5500);
  });
});

describe('loadCart', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns an empty cart with nothing stored', () => {
    expect(loadCart()).toEqual([]);
  });

  test('restores stored lines and drops malformed entries', () => {
    const line = makeLine();
    localStorage.setItem(
      cartStorageKey,
      JSON.stringify([line, { itemId: 'bad' }, 'nonsense'])
    );

    expect(loadCart()).toEqual([line]);
  });
});
