import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import type { CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import CoffeeEntryDetails from './CoffeeEntryDetails';
import { formatBrewMethod, formatRatingStars } from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

type CoffeeEntryCardProps = {
  entry: CoffeeEntrySummary;
  temperatureUnit: TemperatureUnit;
  canManage: boolean;
  isDeleting: boolean;
  onDelete: (entry: CoffeeEntrySummary) => void;
};

export default function CoffeeEntryCard({
  entry,
  temperatureUnit,
  canManage,
  isDeleting,
  onDelete,
}: CoffeeEntryCardProps) {
  return (
    <article className={styles.card}>
      <details className={styles.cardDetails}>
        <summary className={styles.cardSummary}>
          <h5 className={styles.cardTitle}>
            <Link
              className={styles.textLink}
              to={`${PAGES.Coffee}/${entry.id}`}
              onClick={(event) => event.stopPropagation()}
            >
              {formatBrewMethod(entry.brewMethod) || entry.date}
            </Link>
          </h5>
          <span className={styles.entryDate}>{entry.date}</span>
        </summary>

        <p className={styles.ratingRow} aria-label={`Rated ${entry.rating} out of 5`}>
          <span className={styles.stars} aria-hidden="true">
            {formatRatingStars(entry.rating)}
          </span>
          <span className={styles.ratingValue}>{entry.rating}/5</span>
        </p>

        {canManage && (
          <div className={styles.entryActions}>
            <Link
              className={styles.textLink}
              to={`${PAGES.CoffeeEntry}/${entry.id}`}
            >
              Edit
            </Link>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(entry)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting' : 'Delete'}
            </button>
          </div>
        )}

        <CoffeeEntryDetails entry={entry} temperatureUnit={temperatureUnit} />
      </details>
    </article>
  );
}
