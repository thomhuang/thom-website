import { getPageNumbers } from '../Shop/shopPagination';
import styles from './Coffee.module.css';

type CoffeePagerProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
};

export default function CoffeePager({
  page,
  totalPages,
  onPageChange,
  label,
}: CoffeePagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pager} aria-label={`${label} pagination`}>
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
