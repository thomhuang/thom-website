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

const formatCoffeeMetadata = (entry: CoffeeEntrySummary) =>
  [entry.origin, entry.coffeeVarietal, entry.processingMethod]
    .filter(Boolean)
    .join(' / ');

const formatDaysSinceRoast = (daysSinceRoast?: string) => {
  const days = daysSinceRoast?.trim();

  if (!days) {
    return '';
  }

  return `${days} day${days === '1' ? '' : 's'} off roast`;
};

const formatBloom = (entry: CoffeeEntrySummary) =>
  [entry.bloomTime, entry.bloomWater].filter(Boolean).join(' / ');

const getEntryStats = (entry: CoffeeEntrySummary): EntryStat[] =>
  [
    { label: 'Method', value: entry.brewMethod },
    { label: 'Ratio', value: entry.ratio },
    { label: 'Rating', value: `${entry.rating}/5` },
    { label: 'Grinder', value: entry.grinder || '' },
    { label: 'Grind', value: entry.grindSetting || '' },
    { label: 'Dose', value: entry.dose || '' },
    { label: 'Yield', value: entry.yieldAmount || '' },
    { label: 'Water', value: entry.waterTemperature || '' },
    { label: 'Time', value: entry.brewTime || '' },
    { label: 'Bloom', value: formatBloom(entry) },
    { label: 'Roast', value: entry.roastLevel || '' },
    { label: 'Rest', value: formatDaysSinceRoast(entry.daysSinceRoast) },
  ].filter((stat) => Boolean(stat.value));

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
        <p className={styles.eyebrow}>Coffee</p>
        <h1 id="coffee-title">Coffee journal</h1>
      </section>

      {!isAuthLoading && isAdmin && (
        <div className={styles.adminActions}>
          <Link className={styles.primaryLink} to={PAGES.CoffeeEntry}>
            New brew entry
          </Link>
        </div>
      )}

      {journalError && (
        <aside className={styles.errorNotice}>{journalError}</aside>
      )}

      <section className={styles.entryList} aria-labelledby="coffee-entries">
        <div className={styles.journalHeader}>
          <p className={styles.sectionKicker}>Journal</p>
          <h2 id="coffee-entries">Brew entries</h2>
        </div>

        {isLoading ? (
          <p className={styles.statusText}>Loading brew entries...</p>
        ) : brewLogs.length > 0 ? (
          brewLogs.map((entry) => {
            const coffeeMetadata = formatCoffeeMetadata(entry);
            const entryStats = getEntryStats(entry);
            const tastingNotes = getTastingNotes(entry);

            return (
              <article className={styles.entryCard} key={entry.id}>
                <div className={styles.entryCardHeader}>
                  <div>
                    <p className={styles.entryMeta}>{entry.date}</p>
                    <h3>{entry.coffeeName}</h3>
                    <p className={styles.entryMeta}>{entry.roaster}</p>
                    {coffeeMetadata && (
                      <p className={styles.entryOriginDetails}>
                        {coffeeMetadata}
                      </p>
                    )}
                  </div>

                  {!isAuthLoading && isAdmin && (
                    <div className={styles.entryActions}>
                      <Link
                        className={styles.secondaryLink}
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
                </div>
                <dl className={styles.entryStats}>
                  {entryStats.map((stat) => (
                    <div key={stat.label}>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>
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
              </article>
            );
          })
        ) : (
          <div className={styles.emptyJournal}>
            <h3>No published brew entries yet.</h3>
            <p>Published entries will show here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
