import { useEffect, useState } from 'react';

import { getPageNumbers, getTotalPages } from '../Shop/shopPagination';

export { getPageNumbers, getTotalPages };

// The coffee journal paginates its three nesting levels (roasters, coffees,
// brews) to these counts depending on viewport width.
export const MOBILE_PAGE_SIZE = 3;
export const TABLET_PAGE_SIZE = 4;
export const DESKTOP_PAGE_SIZE = 5;

const MOBILE_QUERY = '(max-width: 640px)';
const TABLET_QUERY = '(max-width: 1024px)';

function resolvePageSize(): number {
  if (window.matchMedia(MOBILE_QUERY).matches) {
    return MOBILE_PAGE_SIZE;
  }
  if (window.matchMedia(TABLET_QUERY).matches) {
    return TABLET_PAGE_SIZE;
  }
  return DESKTOP_PAGE_SIZE;
}

export function useCoffeePageSize(): number {
  const [pageSize, setPageSize] = useState<number>(resolvePageSize);

  useEffect(() => {
    const queries = [
      window.matchMedia(MOBILE_QUERY),
      window.matchMedia(TABLET_QUERY),
    ];

    const onChange = () => setPageSize(resolvePageSize());

    queries.forEach((query) => query.addEventListener('change', onChange));
    return () =>
      queries.forEach((query) => query.removeEventListener('change', onChange));
  }, []);

  return pageSize;
}
