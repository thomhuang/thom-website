import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  DeleteCoffeeEntryAsync,
  GetCoffeeEntriesAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import type {
  CoffeeEntrySummary,
  CoffeeGrinder,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import AsciiFigure from '../../Components/AsciiFigure/AsciiFigure';
import CoffeeFilters from './CoffeeFilters';
import CoffeeRoasterSection from './CoffeeRoasterSection';
import {
  filterEntries,
  getBrewMethodOptions,
  groupEntriesByRoaster,
} from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

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

  const brewMethodOptions = getBrewMethodOptions(brewLogs);
  const visibleLogs = filterEntries(brewLogs, {
    selectedRoasterId,
    selectedGrinderId,
    selectedBrewMethod,
    roasterOptions,
  });
  const hasFilters =
    roasterOptions.length > 0 ||
    grinderOptions.length > 0 ||
    brewMethodOptions.length > 0;
  const canManage = !isAuthLoading && isAdmin;

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="coffee-title">
        <h1 id="coffee-title">Coffee journal</h1>
        <AsciiFigure variant="coffee" size="large" />
      </section>

      {canManage && (
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
          <CoffeeFilters
            isOpen={filtersOpen}
            roasterOptions={roasterOptions}
            grinderOptions={grinderOptions}
            brewMethodOptions={brewMethodOptions}
            selectedRoasterId={selectedRoasterId}
            selectedGrinderId={selectedGrinderId}
            selectedBrewMethod={selectedBrewMethod}
            onToggle={() => setFiltersOpen((open) => !open)}
            onRoasterChange={setSelectedRoasterId}
            onGrinderChange={setSelectedGrinderId}
            onBrewMethodChange={setSelectedBrewMethod}
          />
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
            <div className={styles.roasterGroups}>
              {groupEntriesByRoaster(visibleLogs).map((group) => (
                <CoffeeRoasterSection
                  key={group.key}
                  group={group}
                  temperatureUnit={temperatureUnit}
                  canManage={canManage}
                  deletingEntryId={deletingEntryId}
                  onDelete={deleteEntry}
                />
              ))}
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
