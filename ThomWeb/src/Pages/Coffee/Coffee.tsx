import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CoffeeEntrySummary,
  DeleteCoffeeEntryAsync,
  GetCoffeeEntriesAsync,
} from '../../api/Coffee/CoffeeRouter';
import styles from './Coffee.module.css';

const formatCoffeeMetadata = (entry: CoffeeEntrySummary) =>
  [entry.origin, entry.coffeeVarietal, entry.processingMethod]
    .filter(Boolean)
    .join(' / ');

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

        if (isMounted) {
          setBrewLogs(entries);
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
                  <div>
                    <dt>Method</dt>
                    <dd>{entry.brewMethod}</dd>
                  </div>
                  <div>
                    <dt>Ratio</dt>
                    <dd>{entry.ratio}</dd>
                  </div>
                  <div>
                    <dt>Rating</dt>
                    <dd>{entry.rating}/5</dd>
                  </div>
                </dl>
                <p className={styles.entryNotes}>{entry.tastingNotes}</p>
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
