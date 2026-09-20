import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import type { CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import {
  formatBrewMethod,
  formatRatingStars,
  getEntryStatGroups,
  getTastingNotes,
} from './coffeeGroups';
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
  const statGroups = getEntryStatGroups(entry, temperatureUnit);
  const tastingNotes = getTastingNotes(entry);

  return (
    <article className={styles.card}>
      <details className={styles.cardDetails}>
        <summary className={styles.cardSummary}>
          <h5 className={styles.cardTitle}>
            {formatBrewMethod(entry.brewMethod) || entry.date}
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

        {statGroups.map((statGroup) => (
          <div className={styles.statGroup} key={statGroup.title}>
            <h5 className={styles.statGroupTitle}>{statGroup.title}</h5>
            <dl className={styles.statList}>
              {statGroup.stats.map((stat) => (
                <div className={styles.statRow} key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        {(tastingNotes || entry.pourNotes) && (
          <div className={styles.entryText}>
            {tastingNotes && <p className={styles.entryNotes}>{tastingNotes}</p>}
            {entry.pourNotes && (
              <p className={styles.entryNotes}>
                <span className={styles.entryNoteLabel}>Pour notes</span>
                {entry.pourNotes}
              </p>
            )}
          </div>
        )}
      </details>
    </article>
  );
}
