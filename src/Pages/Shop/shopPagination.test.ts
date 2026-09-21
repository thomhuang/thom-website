import { describe, expect, test } from 'vitest';

import { getPageNumbers, getPageSize, getTotalPages } from './shopPagination';

describe('getPageSize', () => {
  test('list layout shows two rows of one card', () => {
    expect(getPageSize('list', 4)).toBe(2);
  });

  test('grid layout shows two rows of the current column count', () => {
    expect(getPageSize('grid', 4)).toBe(8);
  });

  test('treats a missing column count as a single column', () => {
    expect(getPageSize('grid', 0)).toBe(2);
  });
});

describe('getTotalPages', () => {
  test('is at least one even with no items', () => {
    expect(getTotalPages(0, 8)).toBe(1);
  });

  test('rounds up partial pages', () => {
    expect(getTotalPages(9, 8)).toBe(2);
    expect(getTotalPages(16, 8)).toBe(2);
    expect(getTotalPages(17, 8)).toBe(3);
  });
});

describe('getPageNumbers', () => {
  test('lists every page when there are few', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('collapses long runs around the current page', () => {
    expect(getPageNumbers(10, 20)).toEqual([
      1,
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
      20,
    ]);
  });

  test('keeps the first page boundary compact', () => {
    expect(getPageNumbers(1, 20)).toEqual([1, 2, 'ellipsis', 20]);
  });

  test('keeps the last page boundary compact', () => {
    expect(getPageNumbers(20, 20)).toEqual([1, 'ellipsis', 19, 20]);
  });
});
