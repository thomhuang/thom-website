import { useEffect, useState } from 'react';

import { getPageNumbers, getTotalPages } from '../Shop/shopPagination';

export { getPageNumbers, getTotalPages };

// The coffee journal paginates its nesting levels to these counts per viewport.
// Roasters and coffees share one scale; the more verbose brew cards page more
// aggressively.
const MOBILE_QUERY = '(max-width: 640px)';
const TABLET_QUERY = '(max-width: 1024px)';

export const MOBILE_PAGE_SIZE = 3;
export const TABLET_PAGE_SIZE = 4;
export const DESKTOP_PAGE_SIZE = 5;

export const BREW_MOBILE_PAGE_SIZE = 2;
export const BREW_TABLET_PAGE_SIZE = 2;
export const BREW_DESKTOP_PAGE_SIZE = 3;

type PageSizes = {
  mobile: number;
  tablet: number;
  desktop: number;
};

const COFFEE_PAGE_SIZES: PageSizes = {
  mobile: MOBILE_PAGE_SIZE,
  tablet: TABLET_PAGE_SIZE,
  desktop: DESKTOP_PAGE_SIZE,
};

const BREW_PAGE_SIZES: PageSizes = {
  mobile: BREW_MOBILE_PAGE_SIZE,
  tablet: BREW_TABLET_PAGE_SIZE,
  desktop: BREW_DESKTOP_PAGE_SIZE,
};

function resolvePageSize(sizes: PageSizes): number {
  if (window.matchMedia(MOBILE_QUERY).matches) {
    return sizes.mobile;
  }
  if (window.matchMedia(TABLET_QUERY).matches) {
    return sizes.tablet;
  }
  return sizes.desktop;
}

function usePageSize(sizes: PageSizes): number {
  const [pageSize, setPageSize] = useState<number>(() => resolvePageSize(sizes));

  useEffect(() => {
    const queries = [
      window.matchMedia(MOBILE_QUERY),
      window.matchMedia(TABLET_QUERY),
    ];

    const onChange = () => setPageSize(resolvePageSize(sizes));

    queries.forEach((query) => query.addEventListener('change', onChange));
    return () =>
      queries.forEach((query) => query.removeEventListener('change', onChange));
  }, [sizes]);

  return pageSize;
}

export function useCoffeePageSize(): number {
  return usePageSize(COFFEE_PAGE_SIZES);
}

export function useBrewPageSize(): number {
  return usePageSize(BREW_PAGE_SIZES);
}
