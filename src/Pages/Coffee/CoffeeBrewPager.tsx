import styles from './Coffee.module.css';

type CoffeeBrewPagerProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function CoffeeBrewPager({
  page,
  totalPages,
  onPageChange,
}: CoffeeBrewPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.brewPager} aria-label="Brews pagination">
      <button
        type="button"
        className={styles.brewPagerButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous brews"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M15 5l-7 7 7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className={styles.brewPagerCount}>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className={styles.brewPagerButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next brews"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </nav>
  );
}
