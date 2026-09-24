import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import { useDocumentTitle } from '../../hooks';
import {
  CreateCoffeeEntryAsync,
  UpdateCoffeeEntryAsync,
} from '../../api/Coffee/CoffeeRouter';
import CoffeeEntryBrewSection from './CoffeeEntryBrewSection';
import CoffeeEntryDetailsSection from './CoffeeEntryDetailsSection';
import CoffeeEntryNotesSection from './CoffeeEntryNotesSection';
import {
  createEmptyDraft,
  createRequestFromDraft,
  getYieldAmount,
  validateDraft,
} from './coffeeEntryDraft';
import type {
  BrewLogDraft,
  CoffeePrefill,
  UpdateDraft,
} from './coffeeEntryDraft';
import { fromCelsius, roundToTenth, toCelsius } from './format';
import type { TemperatureUnit } from './format';
import {
  loadGrinderOptions,
  loadRoasterOptions,
  saveGrinderOption,
  saveRoasterOption,
  useCoffeeLookup,
} from './useCoffeeLookup';
import { useCoffeeEntryLoader } from './useCoffeeEntryLoader';
import styles from './Coffee.module.css';

export default function CoffeeEntry() {
  const { entryId } = useParams<{ entryId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: CoffeePrefill } | null)
    ?.prefill;
  const { isAdmin, isAuthLoading } = useAuth();
  const isEditing = Boolean(entryId);

  useDocumentTitle(isEditing ? 'Edit brew entry' : 'New brew entry');

  const [draft, setDraft] = useState<BrewLogDraft>(createEmptyDraft);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roaster = useCoffeeLookup({
    loadOptions: loadRoasterOptions,
    saveOption: saveRoasterOption,
    enabled: !isAuthLoading && isAdmin,
    selectedId: draft.roasterId,
    loadErrorMessage: 'Roasters could not be loaded.',
    saveErrorMessage: 'Roaster could not be saved.',
    onSelect: (roasterId) =>
      setDraft((currentDraft) => ({ ...currentDraft, roasterId })),
    onError: setFormError,
  });

  const grinder = useCoffeeLookup({
    loadOptions: loadGrinderOptions,
    saveOption: saveGrinderOption,
    enabled: !isAuthLoading && isAdmin,
    selectedId: draft.grinderId,
    loadErrorMessage: 'Grinders could not be loaded.',
    saveErrorMessage: 'Grinder could not be saved.',
    onSelect: (grinderId) =>
      setDraft((currentDraft) => ({ ...currentDraft, grinderId })),
    onError: setFormError,
  });

  const { isEntryLoading, entryLoadFailed } = useCoffeeEntryLoader({
    entryId,
    isEditing,
    isAdmin,
    isAuthLoading,
    prefill,
    roaster,
    grinder,
    setDraft,
    setFormError,
  });

  const selectedRoaster = roaster.selectedOption;
  const selectedGrinder = grinder.selectedOption;
  const fieldErrors = useMemo(() => validateDraft(draft), [draft]);
  const yieldAmount = useMemo(
    () => getYieldAmount(draft.dose, draft.ratio),
    [draft.dose, draft.ratio]
  );
  const isFormLoading = isEntryLoading || roaster.isLoading || grinder.isLoading;
  const canShowEntryFailure =
    !isAuthLoading && isAdmin && !isFormLoading && entryLoadFailed;
  const canShowForm =
    !isAuthLoading && isAdmin && !isFormLoading && !entryLoadFailed;

  const updateDraft: UpdateDraft =
    (field) =>
    (event) => {
      setDraft((currentDraft) => ({
        ...currentDraft,
        [field]: event.target.value,
      }));
    };

  const changeTemperatureUnit = (nextUnit: TemperatureUnit) => {
    if (nextUnit === temperatureUnit) {
      return;
    }

    setDraft((currentDraft) => {
      const trimmed = currentDraft.waterTemperature.trim();
      const parsed = Number(trimmed);

      if (!trimmed || Number.isNaN(parsed)) {
        return currentDraft;
      }

      const converted = fromCelsius(
        toCelsius(parsed, temperatureUnit),
        nextUnit
      );

      return {
        ...currentDraft,
        waterTemperature: String(roundToTenth(converted)),
      };
    });
    setTemperatureUnit(nextUnit);
  };

  const changeRating = (rating: number) => {
    setDraft((currentDraft) => ({ ...currentDraft, rating }));
  };

  const saveEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    if (!selectedRoaster) {
      setFormError('Select or add a roaster before saving.');
      return;
    }

    if (!selectedGrinder) {
      setFormError('Select or add a grinder before saving.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const request = createRequestFromDraft(
        draft,
        selectedRoaster,
        selectedGrinder,
        temperatureUnit
      );

      if (isEditing && entryId) {
        await UpdateCoffeeEntryAsync(entryId, request);
      } else {
        await CreateCoffeeEntryAsync(request);
      }

      navigate(PAGES.Coffee);
    } catch {
      setFormError(
        isEditing
          ? 'Coffee entry could not be updated.'
          : 'Coffee entry could not be saved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="coffee-entry-title">
        <h1 id="coffee-entry-title">
          {isEditing ? 'Edit brew entry' : 'New brew entry'}
        </h1>
        <p className={styles.deck}>Draft the details behind the next cup.</p>
      </section>

      {isAuthLoading && (
        <aside className={styles.notice}>Checking admin access...</aside>
      )}

      {!isAuthLoading && !isAdmin && (
        <section className={styles.publicState} aria-labelledby="coffee-entry-admin">
          <h2 id="coffee-entry-admin">Sign in to manage brew entries.</h2>
          <p>The public coffee journal is view-only.</p>
        </section>
      )}

      {!isAuthLoading && isAdmin && isFormLoading && (
        <aside className={styles.notice}>
          {isEntryLoading ? 'Loading brew entry...' : 'Loading lookups...'}
        </aside>
      )}

      {canShowEntryFailure && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}
          <div className={styles.actions}>
            <Link className={styles.textLink} to={PAGES.Coffee}>
              Back to coffee journal
            </Link>
          </div>
        </>
      )}

      {canShowForm && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}

          <form className={styles.form} onSubmit={saveEntry}>
            <CoffeeEntryDetailsSection
              draft={draft}
              updateDraft={updateDraft}
              roaster={roaster}
            />
            <CoffeeEntryBrewSection
              draft={draft}
              fieldErrors={fieldErrors}
              yieldAmount={yieldAmount}
              temperatureUnit={temperatureUnit}
              updateDraft={updateDraft}
              changeTemperatureUnit={changeTemperatureUnit}
              grinder={grinder}
            />
            <CoffeeEntryNotesSection
              draft={draft}
              fieldErrors={fieldErrors}
              updateDraft={updateDraft}
              changeRating={changeRating}
            />

            <div className={styles.actions}>
              <Link className={styles.textLink} to={PAGES.Coffee}>
                Cancel
              </Link>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving'
                  : isEditing
                    ? 'Save changes'
                    : 'Save brew log'}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
