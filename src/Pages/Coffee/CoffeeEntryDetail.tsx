import { Link, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { GetCoffeeEntryByIdAsync } from '../../api/Coffee/CoffeeRouter';
import type { CoffeeEntry } from '../../api/Coffee/CoffeeRouter';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
import CoffeeEntryDetails from './CoffeeEntryDetails';
import { formatCoffeeMetadata, formatRatingStars } from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

const temperatureUnit: TemperatureUnit = 'C';

export default function CoffeeEntryDetail() {
  const { entryId } = useParams<{ entryId?: string }>();

  const {
    data: entry,
    isLoading,
    error,
  } = useAsync<CoffeeEntry | null>(
    (signal) => GetCoffeeEntryByIdAsync(entryId ?? '', signal),
    [entryId],
    {
      enabled: Boolean(entryId),
      initialData: null,
      errorMessage: 'Brew entry could not be loaded.',
    }
  );
  const loadFailed = Boolean(error);

  useDocumentTitle(entry ? `${entry.coffeeName} #${entry.id}` : 'Coffee journal');

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.statusText}>Loading brew entry...</p>
      </main>
    );
  }

  if (loadFailed || !entry) {
    return (
      <main className={styles.page}>
        <aside className={styles.errorNotice}>
          Brew entry could not be found.
        </aside>
        <div className={styles.actions}>
          <Link className={styles.textLink} to={PAGES.Coffee}>
            Back to coffee journal
          </Link>
        </div>
      </main>
    );
  }

  const metadata = formatCoffeeMetadata(entry);

  return (
    <main className={styles.page}>
      <div className={styles.actions}>
        <Link className={styles.textLink} to={PAGES.Coffee}>
          Back to coffee journal
        </Link>
      </div>

      <section className={styles.intro}>
        <h1>{entry.coffeeName}</h1>
        {entry.roaster && <p className={styles.deck}>{entry.roaster}</p>}
      </section>

      <article className={styles.card}>
        <div className={styles.cardDetails}>
          <p className={styles.entryDate}>{entry.date}</p>
          {metadata && <p className={styles.entryMeta}>{metadata}</p>}
          <p
            className={styles.ratingRow}
            aria-label={`Rated ${entry.rating} out of 5`}
          >
            <span className={styles.stars} aria-hidden="true">
              {formatRatingStars(entry.rating)}
            </span>
            <span className={styles.ratingValue}>{entry.rating}/5</span>
          </p>

          <CoffeeEntryDetails entry={entry} temperatureUnit={temperatureUnit} />
        </div>
      </article>
    </main>
  );
}
