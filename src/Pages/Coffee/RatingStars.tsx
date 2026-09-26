import styles from './Coffee.module.css';

const STAR_COUNT = 5;

// A single star filled to `fraction` (0-1). Filled stars are a solid glyph
// clipped over an outline, so a half reads as a half-filled star.
export function Star({ fraction }: { fraction: number }) {
  const filled = Math.max(0, Math.min(1, fraction));

  return (
    <span className={styles.star} aria-hidden="true">
      ☆
      {filled > 0 && (
        <span
          className={styles.starFill}
          style={{ width: `${filled * 100}%` }}
        >
          ★
        </span>
      )}
    </span>
  );
}

// Read-only star row; callers supply their own text/aria label.
export default function RatingStars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <Star key={index} fraction={rating - index} />
      ))}
    </span>
  );
}
