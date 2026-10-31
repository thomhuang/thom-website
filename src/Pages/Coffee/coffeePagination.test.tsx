import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  BREW_DESKTOP_PAGE_SIZE,
  BREW_MOBILE_PAGE_SIZE,
  BREW_TABLET_PAGE_SIZE,
  DESKTOP_PAGE_SIZE,
  MOBILE_PAGE_SIZE,
  TABLET_PAGE_SIZE,
  useBrewPageSize,
  useCoffeePageSize,
} from './coffeePagination';

const mockMatchMedia = (matching: string[]) =>
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList);

describe('useCoffeePageSize', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('uses five per page on desktop', () => {
    mockMatchMedia([]);
    const { result } = renderHook(() => useCoffeePageSize());
    expect(result.current).toBe(DESKTOP_PAGE_SIZE);
  });

  test('uses four per page on tablet', () => {
    mockMatchMedia(['(max-width: 1024px)']);
    const { result } = renderHook(() => useCoffeePageSize());
    expect(result.current).toBe(TABLET_PAGE_SIZE);
  });

  test('uses three per page on mobile', () => {
    mockMatchMedia(['(max-width: 640px)', '(max-width: 1024px)']);
    const { result } = renderHook(() => useCoffeePageSize());
    expect(result.current).toBe(MOBILE_PAGE_SIZE);
  });
});

describe('useBrewPageSize', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('uses three per page on desktop', () => {
    mockMatchMedia([]);
    const { result } = renderHook(() => useBrewPageSize());
    expect(result.current).toBe(BREW_DESKTOP_PAGE_SIZE);
  });

  test('uses two per page on tablet', () => {
    mockMatchMedia(['(max-width: 1024px)']);
    const { result } = renderHook(() => useBrewPageSize());
    expect(result.current).toBe(BREW_TABLET_PAGE_SIZE);
  });

  test('uses two per page on mobile', () => {
    mockMatchMedia(['(max-width: 640px)', '(max-width: 1024px)']);
    const { result } = renderHook(() => useBrewPageSize());
    expect(result.current).toBe(BREW_MOBILE_PAGE_SIZE);
  });
});
