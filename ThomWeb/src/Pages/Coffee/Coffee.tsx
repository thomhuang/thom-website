import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CoffeeEntrySummary,
  DeleteCoffeeEntryAsync,
  GetCoffeeEntriesAsync,
  GetCoffeeEntryByIdAsync,
} from '../../api/Coffee/CoffeeRouter';
import styles from './Coffee.module.css';

type EntryStat = {
  label: string;
  value: string;
};

type EntryStatGroup = {
  title: string;
  stats: EntryStat[];
};

const formatCoffeeMetadata = (entry: CoffeeEntrySummary) =>
  [entry.origin, entry.coffeeVarietal, entry.processingMethod]
    .filter(Boolean)
    .join(' / ');

const formatDaysSinceRoast = (daysSinceRoast?: number) => {
  if (!daysSinceRoast) {
    return '';
  }

  return `${daysSinceRoast} day${daysSinceRoast === 1 ? '' : 's'}`;
};

const formatGrams = (value?: number) =>
  value != null ? `${value} g` : '';

const formatTemperature = (value?: number) =>
  value != null ? `${value} °C` : '';

const formatBloom = (entry: CoffeeEntrySummary) =>
  [
    entry.bloomTime,
    formatGrams(entry.bloomWater),
  ].filter(Boolean).join(' / ');

const getEntryStatGroups = (entry: CoffeeEntrySummary): EntryStatGroup[] =>
  [
    {
      title: 'Brew',
      stats: [
        { label: 'Method', value: entry.brewMethod },
        { label: 'Ratio', value: entry.ratio },
        { label: 'Dose', value: formatGrams(entry.dose) },
        { label: 'Yield', value: formatGrams(entry.yieldAmount) },
        { label: 'Water', value: formatTemperature(entry.waterTemperature) },
        { label: 'Time', value: entry.brewTime || '' },
        { label: 'Bloom', value: formatBloom(entry) },
      ],
    },
    {
      title: 'Setup',
      stats: [
        { label: 'Grinder', value: entry.grinder || '' },
        { label: 'Grind', value: entry.grindSetting != null ? String(entry.grindSetting) : '' },
      ],
    },
    {
      title: 'Bean',
      stats: [
        { label: 'Roast', value: entry.roastLevel || '' },
        { label: 'Rest', value: formatDaysSinceRoast(entry.daysSinceRoast) },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      stats: group.stats.filter((stat) => Boolean(stat.value)),
    }))
    .filter((group) => group.stats.length > 0);

const formatRatingStars = (rating: number) =>
  '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));

const getTastingNotes = (entry: CoffeeEntrySummary) =>
  entry.tastingNotes || entry.notes || '';

const loadCoffeeEntryDetails = async (
  entry: CoffeeEntrySummary,
  signal: AbortSignal
) => {
  try {
    return await GetCoffeeEntryByIdAsync(entry.id, signal);
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }

    return entry;
  }
};

export default function Coffee() {
  const { isAdmin, isAuthLoading } = useAuth();
  const [brewLogs, setBrewLogs] = useState<CoffeeEntrySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [journalError, setJournalError] = useState('');
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadCoffeeEntries = async () => {
      setJournalError('');

      try {
        const entries = await GetCoffeeEntriesAsync(controller.signal);
        const entriesWithDetails = await Promise.all(
          entries.map((entry) =>
            loadCoffeeEntryDetails(entry, controller.signal)
          )
        );

        if (isMounted) {
          setBrewLogs(entriesWithDetails);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setJournalError('Coffee entries could not be loaded.');
          setBrewLogs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCoffeeEntries();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const deleteEntry = async (entry: CoffeeEntrySummary) => {
    const confirmed = window.confirm(
      `Delete ${entry.coffeeName} from the coffee journal?`
    );

    if (!confirmed) {
      return;
    }

    setJournalError('');
    setDeletingEntryId(entry.id);

    try {
      await DeleteCoffeeEntryAsync(entry.id);
      setBrewLogs((currentEntries) =>
        currentEntries.filter((currentEntry) => currentEntry.id !== entry.id)
      );
    } catch {
      setJournalError('Coffee entry could not be deleted.');
    } finally {
      setDeletingEntryId(null);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="coffee-title">
        <h1 id="coffee-title">Coffee journal</h1>
      </section>

      {!isAuthLoading && isAdmin && (
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.CoffeeEntry}>
            New brew entry
          </Link>
        </div>
      )}

      {journalError && (
        <aside className={styles.errorNotice}>{journalError}</aside>
      )}

      <section className={styles.entryList} aria-labelledby="coffee-entries">
        <h2 id="coffee-entries">Brew entries</h2>

        {isLoading ? (
          <p className={styles.statusText}>Loading brew entries...</p>
        ) : brewLogs.length > 0 ? (
          <div className={styles.entryGrid}>
            {brewLogs.map((entry) => {
              const coffeeMetadata = formatCoffeeMetadata(entry);
              const statGroups = getEntryStatGroups(entry);
              const tastingNotes = getTastingNotes(entry);

              return (
                <article className={styles.card} key={entry.id}>
                  <details className={styles.cardDetails}>
                    <summary className={styles.cardSummary}>
                      <h3>{entry.coffeeName}</h3>
                      <span className={styles.entryDate}>{entry.date}</span>
                    </summary>
                    {coffeeMetadata && (
                      <p className={styles.entryMeta}>
                        {[entry.roaster, coffeeMetadata].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p
                      className={styles.ratingRow}
                      aria-label={`Rated ${entry.rating} out of 5`}
                    >
                      <span className={styles.stars} aria-hidden="true">
                        {formatRatingStars(entry.rating)}
                      </span>
                      <span className={styles.ratingValue}>{entry.rating}/5</span>
                    </p>

                    {!isAuthLoading && isAdmin && (
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
                          onClick={() => deleteEntry(entry)}
                          disabled={deletingEntryId === entry.id}
                        >
                          {deletingEntryId === entry.id ? 'Deleting' : 'Delete'}
                        </button>
                      </div>
                    )}

                    {statGroups.map((group) => (
                      <div className={styles.statGroup} key={group.title}>
                        <h4 className={styles.statGroupTitle}>{group.title}</h4>
                        <dl className={styles.statList}>
                          {group.stats.map((stat) => (
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
                        {tastingNotes && (
                          <p className={styles.entryNotes}>{tastingNotes}</p>
                        )}
                        {entry.pourNotes && (
                          <p className={styles.entryNotes}>
                            <span className={styles.entryNoteLabel}>
                              Pour notes
                            </span>
                            {entry.pourNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </details>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyJournal}>
            <p>No published brew entries yet.</p>
            <p>Published entries will show here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
