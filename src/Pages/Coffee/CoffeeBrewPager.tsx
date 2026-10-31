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
        ‹
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
        ›
      </button>
    </nav>
  );
}
