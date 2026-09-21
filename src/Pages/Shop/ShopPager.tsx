import { getPageNumbers } from './shopPagination';
import styles from './Shop.module.css';

type ShopPagerProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ShopPager({
  page,
  totalPages,
  onPageChange,
}: ShopPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pager} aria-label="Listings pagination">
      <button
        type="button"
        className={styles.pagerButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>

      {getPageNumbers(page, totalPages).map((entry, index) =>
        entry === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className={styles.pagerEllipsis}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            type="button"
            key={entry}
            className={[
              styles.pagerButton,
              entry === page ? styles.pagerCurrent : '',
            ].join(' ')}
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        className={styles.pagerButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}
