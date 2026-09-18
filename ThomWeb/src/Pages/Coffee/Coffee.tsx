import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CoffeeEntrySummary,
  DeleteCoffeeEntryAsync,
  GetCoffeeEntriesAsync,
  GetCoffeeEntryByIdAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import type {
  CoffeeGrinder,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import { brewMethods } from './CoffeeEntry';
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

const formatBrewMethod = (value: string) =>
  brewMethods.find((option) => option.value === value)?.label ?? value;

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
  const [roasterOptions, setRoasterOptions] = useState<CoffeeRoaster[]>([]);
  const [grinderOptions, setGrinderOptions] = useState<CoffeeGrinder[]>([]);
  const [selectedRoasterId, setSelectedRoasterId] = useState('');
  const [selectedGrinderId, setSelectedGrinderId] = useState('');
  const [selectedBrewMethod, setSelectedBrewMethod] = useState('');

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
        const roasters = await GetCoffeeRoastersAsync(controller.signal).catch(
          () => [] as CoffeeRoaster[]
        );
        const grinders = await GetCoffeeGrindersAsync(controller.signal).catch(
          () => [] as CoffeeGrinder[]
        );

        if (isMounted) {
          setBrewLogs(entriesWithDetails);
          setRoasterOptions(roasters);
          setGrinderOptions(grinders);
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

  const brewMethodOptions = Array.from(
    new Set(brewLogs.map((entry) => entry.brewMethod))
  ).sort((a, b) => formatBrewMethod(a).localeCompare(formatBrewMethod(b)));

  const visibleLogs = brewLogs.filter((entry) => {
    if (selectedRoasterId) {
      if (entry.roasterId) {
        if (entry.roasterId !== selectedRoasterId) {
          return false;
        }
      } else {
        const selected = roasterOptions.find(
          (roaster) => roaster.id === selectedRoasterId
        );
        if (selected && entry.roaster !== selected.roaster) {
          return false;
        }
      }
    }
    if (selectedGrinderId && entry.grinderId !== selectedGrinderId) {
      return false;
    }
    if (selectedBrewMethod && entry.brewMethod !== selectedBrewMethod) {
      return false;
    }

    return true;
  });

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

      {(roasterOptions.length > 0 ||
        grinderOptions.length > 0 ||
        brewMethodOptions.length > 0) && (
        <div className={styles.filterBar}>
          {roasterOptions.length > 0 && (
            <label className={styles.field} htmlFor="coffee-roaster-filter">
              Roaster
              <select
                id="coffee-roaster-filter"
                value={selectedRoasterId}
                onChange={(event) => setSelectedRoasterId(event.target.value)}
              >
                <option value="">All roasters</option>
                {roasterOptions.map((roaster) => (
                  <option value={roaster.id} key={roaster.id}>
                    {roaster.roaster}
                  </option>
                ))}
              </select>
            </label>
          )}

          {grinderOptions.length > 0 && (
            <label className={styles.field} htmlFor="coffee-grinder-filter">
              Grinder
              <select
                id="coffee-grinder-filter"
                value={selectedGrinderId}
                onChange={(event) => setSelectedGrinderId(event.target.value)}
              >
                <option value="">All grinders</option>
                {grinderOptions.map((grinder) => (
                  <option value={grinder.id} key={grinder.id}>
                    {grinder.grinder}
                  </option>
                ))}
              </select>
            </label>
          )}

          {brewMethodOptions.length > 0 && (
            <label className={styles.field} htmlFor="coffee-method-filter">
              Brew method
              <select
                id="coffee-method-filter"
                value={selectedBrewMethod}
                onChange={(event) => setSelectedBrewMethod(event.target.value)}
              >
                <option value="">All methods</option>
                {brewMethodOptions.map((method) => (
                  <option value={method} key={method}>
                    {formatBrewMethod(method)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <section className={styles.entryList} aria-labelledby="coffee-entries">
        <h2 id="coffee-entries">Brew entries</h2>

        {isLoading ? (
          <p className={styles.statusText}>Loading brew entries...</p>
        ) : visibleLogs.length > 0 ? (
          <div className={styles.entryGrid}>
            {visibleLogs.map((entry) => {
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
            <p>
              {brewLogs.length > 0
                ? 'No brew entries match these filters.'
                : 'No published brew entries yet.'}
            </p>
            <p>Published entries will show here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
