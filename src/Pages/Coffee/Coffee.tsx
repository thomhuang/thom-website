import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
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
import CoffeePager from './CoffeePager';
import CoffeeProfileManager from './CoffeeProfileManager';
import CoffeeRoasterSection from './CoffeeRoasterSection';
import { getTotalPages, useCoffeePageSize } from './coffeePagination';
import {
  filterEntries,
  getBrewMethodOptions,
  groupEntriesByRoaster,
} from './coffeeGroups';
import type { TemperatureUnit } from './format';
import styles from './Coffee.module.css';

export default function Coffee() {
  useDocumentTitle('Coffee journal');

  const { isAdmin, isAuthLoading } = useAuth();
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [selectedRoasterId, setSelectedRoasterId] = useState('');
  const [selectedGrinderId, setSelectedGrinderId] = useState('');
  const [selectedBrewMethod, setSelectedBrewMethod] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [roasterPage, setRoasterPage] = useState(1);
  const pageSize = useCoffeePageSize();

  const {
    data,
    setData,
    isLoading,
    error: loadError,
  } = useAsync(
    async (signal) => {
      const [entries, roasters, grinders] = await Promise.all([
        GetCoffeeEntriesAsync(signal),
        GetCoffeeRoastersAsync(signal).catch(() => [] as CoffeeRoaster[]),
        GetCoffeeGrindersAsync(signal).catch(() => [] as CoffeeGrinder[]),
      ]);

      return { entries, roasters, grinders };
    },
    [],
    {
      initialData: {
        entries: [] as CoffeeEntrySummary[],
        roasters: [] as CoffeeRoaster[],
        grinders: [] as CoffeeGrinder[],
      },
      errorMessage: 'Coffee entries could not be loaded.',
    }
  );
  const {
    entries: brewLogs,
    roasters: roasterOptions,
    grinders: grinderOptions,
  } = data;
  const journalError = loadError || actionError;

  const deleteEntry = async (entry: CoffeeEntrySummary) => {
    const confirmed = window.confirm(
      `Delete ${entry.coffeeName} from the coffee journal?`
    );

    if (!confirmed) {
      return;
    }

    setActionError('');
    setDeletingEntryId(entry.id);

    try {
      await DeleteCoffeeEntryAsync(entry.id);
      setData((current) => ({
        ...current,
        entries: current.entries.filter(
          (currentEntry) => currentEntry.id !== entry.id
        ),
      }));
    } catch {
      setActionError('Coffee entry could not be deleted.');
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
  const roasterGroups = groupEntriesByRoaster(visibleLogs);
  const totalPages = getTotalPages(roasterGroups.length, pageSize);
  const currentPage = Math.min(roasterPage, totalPages);
  const pageGroups = roasterGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const hasFilters =
    roasterOptions.length > 0 ||
    grinderOptions.length > 0 ||
    brewMethodOptions.length > 0;
  const canManage = !isAuthLoading && isAdmin;

  // Changing the result set starts back at the first page.
  const changeRoaster = (roasterId: string) => {
    setSelectedRoasterId(roasterId);
    setRoasterPage(1);
  };

  const changeGrinder = (grinderId: string) => {
    setSelectedGrinderId(grinderId);
    setRoasterPage(1);
  };

  const changeBrewMethod = (brewMethod: string) => {
    setSelectedBrewMethod(brewMethod);
    setRoasterPage(1);
  };

  // Keep the page in range when the result set shrinks (filter change or
  // deletion). Adjusting during render is React's alternative to an effect
  // here, and avoids committing a frame with an out-of-range page.
  if (roasterPage > totalPages) {
    setRoasterPage(totalPages);
  }

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="coffee-title">
        <h1 id="coffee-title">Coffee journal</h1>
        <AsciiFigure variant="coffee" size="large" />
      </section>

      {canManage && (
        <div>
          <Link className={styles.textLink} to={PAGES.CoffeeEntry}>
            New brew entry
          </Link>
        </div>
      )}

      {canManage && <CoffeeProfileManager />}

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
            onRoasterChange={changeRoaster}
            onGrinderChange={changeGrinder}
            onBrewMethodChange={changeBrewMethod}
          />
        )}

        <section aria-labelledby="coffee-entries">
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
            <>
              <div className={styles.roasterGroups}>
                {pageGroups.map((group) => (
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
              <CoffeePager
                label="Roasters"
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setRoasterPage}
              />
            </>
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
