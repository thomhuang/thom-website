import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import AsciiFigure from '../../Components/AsciiFigure/AsciiFigure';
import { useAuth } from '../../Auth/AuthContext';
import {
  CoffeeEntrySummary,
  DeleteCoffeeEntryAsync,
  GetCoffeeEntriesAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import type {
  CoffeeGrinder,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import { brewMethods } from './CoffeeEntry';
import type { CoffeePrefill } from './CoffeeEntry';
import { formatTemperature } from './format';
import type { TemperatureUnit } from './format';
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
  if (daysSinceRoast == null) {
    return '';
  }

  return `${daysSinceRoast} day${daysSinceRoast === 1 ? '' : 's'}`;
};

const formatGrams = (value?: number) =>
  value != null ? `${value} g` : '';

const formatBloom = (entry: CoffeeEntrySummary) =>
  [
    entry.bloomTime,
    formatGrams(entry.bloomWater),
  ].filter(Boolean).join(' / ');

const getEntryStatGroups = (
  entry: CoffeeEntrySummary,
  temperatureUnit: TemperatureUnit
): EntryStatGroup[] =>
  [
    {
      title: 'Brew',
      stats: [
        { label: 'Method', value: entry.brewMethod },
        { label: 'Ratio', value: entry.ratio },
        { label: 'Dose', value: formatGrams(entry.dose) },
        { label: 'Yield', value: formatGrams(entry.yieldAmount) },
        {
          label: 'Water',
          value: formatTemperature(entry.waterTemperature, temperatureUnit),
        },
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

type CoffeeGroup = {
  key: string;
  coffeeName: string;
  entries: CoffeeEntrySummary[];
};

// Entries are grouped by name, preserving the order the API returned them in.
const groupEntriesByCoffee = (
  entries: CoffeeEntrySummary[]
): CoffeeGroup[] => {
  const groups = new Map<string, CoffeeGroup>();

  entries.forEach((entry) => {
    const key = entry.coffeeName.trim().toLowerCase();
    const existing = groups.get(key);

    if (existing) {
      existing.entries.push(entry);
      return;
    }

    groups.set(key, {
      key,
      coffeeName: entry.coffeeName,
      entries: [entry],
    });
  });

  return Array.from(groups.values());
};

// A new brew for an existing coffee carries the bean details forward; the brew
// specifics (date, method, grinder, dose, etc.) stay blank.
const getGroupPrefill = (group: CoffeeGroup): CoffeePrefill => {
  const entry = group.entries[0];

  return {
    coffeeName: entry.coffeeName,
    origin: entry.origin,
    coffeeVarietal: entry.coffeeVarietal,
    processingMethod: entry.processingMethod,
    daysSinceRoast: String(entry.daysSinceRoast ?? ''),
    roastLevel: entry.roastLevel ?? '',
    roasterId: entry.roasterId ?? '',
    roaster: entry.roaster,
  };
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
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadCoffeeEntries = async () => {
      setJournalError('');

      try {
        const [entries, roasters, grinders] = await Promise.all([
          GetCoffeeEntriesAsync(controller.signal),
          GetCoffeeRoastersAsync(controller.signal).catch(
            () => [] as CoffeeRoaster[]
          ),
          GetCoffeeGrindersAsync(controller.signal).catch(
            () => [] as CoffeeGrinder[]
          ),
        ]);

        if (isMounted) {
          setBrewLogs(entries);
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

  const hasFilters =
    roasterOptions.length > 0 ||
    grinderOptions.length > 0 ||
    brewMethodOptions.length > 0;

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="coffee-title">
        <h1 id="coffee-title">Coffee journal</h1>
        <AsciiFigure variant="coffee" size="large" />
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

      <div className={styles.logs}>
        {hasFilters && (
          <div className={styles.filterGroup}>
          <button
            type="button"
            className={styles.filterToggle}
            aria-expanded={filtersOpen}
            aria-controls="coffee-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            Filters
            <span aria-hidden="true">{filtersOpen ? '−' : '+'}</span>
          </button>

          <div
            id="coffee-filters"
            className={[
              styles.filterBar,
              filtersOpen ? styles.filterBarOpen : '',
            ].join(' ')}
          >
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
        </div>
      )}

      <section className={styles.entryList} aria-labelledby="coffee-entries">
        <div className={styles.sectionHeader}>
          <h2 id="coffee-entries">Brew entries</h2>
          {!isLoading && visibleLogs.length > 0 && (
            <div
              className={styles.unitToggle}
              role="group"
              aria-label="Temperature units"
            >
              {(['C', 'F'] as TemperatureUnit[]).map((unit) => (
                <button
                  type="button"
                  key={unit}
                  className={[
                    styles.unitToggleButton,
                    temperatureUnit === unit ? styles.selectedUnit : '',
                  ].join(' ')}
                  onClick={() => setTemperatureUnit(unit)}
                  aria-pressed={temperatureUnit === unit}
                >
                  °{unit}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <p className={styles.statusText}>Loading brew entries...</p>
        ) : visibleLogs.length > 0 ? (
          <div className={styles.coffeeGroups}>
            {groupEntriesByCoffee(visibleLogs).map((group) => {
              const roasters = Array.from(
                new Set(
                  group.entries.map((entry) => entry.roaster).filter(Boolean)
                )
              );
              const coffeeMetadata = Array.from(
                new Set(
                  group.entries.map(formatCoffeeMetadata).filter(Boolean)
                )
              );
              const groupMeta = coffeeMetadata.join(' · ');
              const brewCount = `${group.entries.length} ${
                group.entries.length === 1 ? 'brew' : 'brews'
              }`;

              return (
                <section className={styles.coffeeGroup} key={group.key}>
                  <details className={styles.groupDetails} open>
                    <summary className={styles.groupSummary}>
                      <h3 className={styles.groupTitle}>
                        {roasters.length > 0 && (
                          <>
                            <strong className={styles.groupRoaster}>
                              {roasters.join(', ')}
                            </strong>
                            {' : '}
                          </>
                        )}
                        {group.coffeeName}
                      </h3>
                      {!isAuthLoading && isAdmin && (
                        <Link
                          className={styles.textLink}
                          to={PAGES.CoffeeEntry}
                          state={{ prefill: getGroupPrefill(group) }}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`New brew for ${group.coffeeName}`}
                        >
                          + New brew
                        </Link>
                      )}
                      <span className={styles.groupCount}>{brewCount}</span>
                    </summary>
                    {groupMeta && (
                      <p className={styles.entryMeta}>{groupMeta}</p>
                    )}
                    <div className={styles.entryGrid}>
                      {group.entries.map((entry) => {
                        const statGroups = getEntryStatGroups(
                          entry,
                          temperatureUnit
                        );
                        const tastingNotes = getTastingNotes(entry);

                        return (
                          <article className={styles.card} key={entry.id}>
                            <details className={styles.cardDetails}>
                              <summary className={styles.cardSummary}>
                                <h4 className={styles.cardTitle}>
                                  {formatBrewMethod(entry.brewMethod) ||
                                    entry.date}
                                </h4>
                                <span className={styles.entryDate}>
                                  {entry.date}
                                </span>
                              </summary>
                              <p
                                className={styles.ratingRow}
                                aria-label={`Rated ${entry.rating} out of 5`}
                              >
                                <span className={styles.stars} aria-hidden="true">
                                  {formatRatingStars(entry.rating)}
                                </span>
                                <span className={styles.ratingValue}>
                                  {entry.rating}/5
                                </span>
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
                                    {deletingEntryId === entry.id
                                      ? 'Deleting'
                                      : 'Delete'}
                                  </button>
                                </div>
                              )}

                              {statGroups.map((statGroup) => (
                                <div
                                  className={styles.statGroup}
                                  key={statGroup.title}
                                >
                                  <h4 className={styles.statGroupTitle}>
                                    {statGroup.title}
                                  </h4>
                                  <dl className={styles.statList}>
                                    {statGroup.stats.map((stat) => (
                                      <div
                                        className={styles.statRow}
                                        key={stat.label}
                                      >
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
                                    <p className={styles.entryNotes}>
                                      {tastingNotes}
                                    </p>
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
                  </details>
                </section>
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
      </div>
    </main>
  );
}
