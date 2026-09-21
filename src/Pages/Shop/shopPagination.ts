import type { LayoutMode } from './shopFilters';

// The storefront shows two rows per page. A list row holds one card; a grid row
// holds however many columns the responsive grid currently fits, so a grid page
// is sized from the measured column count rather than a fixed item count.
export const ROWS_PER_PAGE = 2;

export const getPageSize = (layout: LayoutMode, gridColumns: number): number =>
  layout === 'list' ? ROWS_PER_PAGE : Math.max(1, gridColumns) * ROWS_PER_PAGE;

export const getTotalPages = (itemCount: number, pageSize: number): number =>
  Math.max(1, Math.ceil(itemCount / pageSize));

// A compact page list: every page when they are few, otherwise the first, last,
// and current page with its neighbours, separated by ellipses.
export const getPageNumbers = (
  currentPage: number,
  totalPages: number
): (number | 'ellipsis')[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [
    ...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]),
  ]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let previous = 0;

  for (const page of pages) {
    if (page - previous > 1) {
      result.push('ellipsis');
    }
    result.push(page);
    previous = page;
  }

  return result;
};
