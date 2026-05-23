import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CreateCoffeeEntryAsync,
  CreateCoffeeRoasterAsync,
  GetCoffeeEntryByIdAsync,
  GetCoffeeRoastersAsync,
  UpdateCoffeeEntryAsync,
} from '../../api/Coffee/CoffeeRouter';
import type {
  CoffeeEntry as CoffeeEntryResponse,
  CoffeeEntryRequest,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import styles from './Coffee.module.css';

export type RoasterOption = CoffeeRoaster;

type BrewLogDraft = {
  date: string;
  coffeeName: string;
  origin: string;
  coffeeVarietal: string;
  processingMethod: string;
  daysSinceRoast: string;
  roasterId: string;
  brewMethod: string;
  ratio: string;
  grinder: string;
  grindSetting: string;
  dose: string;
  yieldAmount: string;
  waterTemperature: string;
  brewTime: string;
  bloomTime: string;
  bloomWater: string;
  pourNotes: string;
  roastLevel: string;
  notes: string;
  rating: number;
};

type BrewLogTextField = Exclude<keyof BrewLogDraft, 'rating'>;

type SelectOption = {
  value: string;
  label: string;
};

const brewMethods: SelectOption[] = [
  { value: 'v60', label: 'V60' },
  { value: 'turbo-shot', label: 'Turbo Shot' },
  { value: 'orea-z1', label: 'Orea Z1' },
];

const ratios: SelectOption[] = [
  { value: '1:15', label: '1:15' },
  { value: '1:16', label: '1:16' },
  { value: '1:16.67', label: '1:16.67' },
  { value: '1:17', label: '1:17' },
  { value: '1:18', label: '1:18' },
];

const grinders: SelectOption[] = [
  { value: 'k-ultra', label: '1zpresso K-Ultra' },
  { value: 'df64', label: 'DF64V mk. II with SSP MP Burrs' },
];

const roastLevels: SelectOption[] = [
  { value: 'ultralight', label: 'Ultralight' },
  { value: 'light', label: 'Light' },
  { value: 'light-medium', label: 'Light-medium' },
];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const createEmptyDraft = (): BrewLogDraft => ({
  date: getTodayDate(),
  coffeeName: '',
  origin: '',
  coffeeVarietal: '',
  processingMethod: '',
  daysSinceRoast: '',
  roasterId: '',
  brewMethod: '',
  ratio: '',
  grinder: '',
  grindSetting: '',
  dose: '',
  yieldAmount: '',
  waterTemperature: '',
  brewTime: '',
  bloomTime: '',
  bloomWater: '',
  pourNotes: '',
  roastLevel: '',
  notes: '',
  rating: 0,
});

const createDraftFromEntry = (
  entry: CoffeeEntryResponse,
  roasterId: string
): BrewLogDraft => ({
  date: entry.date,
  coffeeName: entry.coffeeName,
  origin: entry.origin || '',
  coffeeVarietal: entry.coffeeVarietal || '',
  processingMethod: entry.processingMethod || '',
  daysSinceRoast: entry.daysSinceRoast,
  roasterId,
  brewMethod: entry.brewMethod,
  ratio: entry.ratio,
  grinder: entry.grinder,
  grindSetting: entry.grindSetting,
  dose: entry.dose,
  yieldAmount: entry.yieldAmount,
  waterTemperature: entry.waterTemperature,
  brewTime: entry.brewTime,
  bloomTime: entry.bloomTime,
  bloomWater: entry.bloomWater,
  pourNotes: entry.pourNotes,
  roastLevel: entry.roastLevel,
  notes: entry.notes || entry.tastingNotes,
  rating: entry.rating,
});

const formatRoasterLabel = (roaster: RoasterOption) => roaster.roaster;

const slugifyRoaster = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createRoasterOption = (roaster: string): RoasterOption => ({
  id: slugifyRoaster(roaster) || `custom-${Date.now()}`,
  roaster,
});

const mergeRoasterOptions = (
  primaryOptions: RoasterOption[],
  secondaryOptions: RoasterOption[] = []
): RoasterOption[] => {
  const optionsById = new Map<string, RoasterOption>();

  [...primaryOptions, ...secondaryOptions].forEach((roaster) => {
    if (!optionsById.has(roaster.id)) {
      optionsById.set(roaster.id, roaster);
    }
  });

  return Array.from(optionsById.values());
};

const createRequestFromDraft = (
  draft: BrewLogDraft,
  roaster: RoasterOption
): CoffeeEntryRequest => ({
  ...draft,
  roaster: roaster.roaster,
});

export default function CoffeeEntry() {
  const { entryId } = useParams<{ entryId?: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthLoading } = useAuth();
  const isEditing = Boolean(entryId);
  const [roasterOptions, setRoasterOptions] = useState<RoasterOption[]>([]);
  const [draft, setDraft] = useState<BrewLogDraft>(createEmptyDraft);
  const [roasterSearch, setRoasterSearch] = useState('');
  const [newRoaster, setNewRoaster] = useState('');
  const [formError, setFormError] = useState('');
  const [entryLoadFailed, setEntryLoadFailed] = useState(false);
  const [isEntryLoading, setIsEntryLoading] = useState(isEditing);
  const [isRoasterLoading, setIsRoasterLoading] = useState(false);
  const [isRoasterSubmitting, setIsRoasterSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFormLoading = isEntryLoading || isRoasterLoading;
  const canShowEntryFailure =
    !isAuthLoading && isAdmin && !isFormLoading && entryLoadFailed;
  const canShowForm =
    !isAuthLoading && isAdmin && !isFormLoading && !entryLoadFailed;

  const selectedRoaster = roasterOptions.find(
    (roaster) => roaster.id === draft.roasterId
  );
  const filteredRoasterOptions = useMemo(() => {
    const normalizedSearch = roasterSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return roasterOptions;
    }

    return roasterOptions.filter((roaster) =>
      formatRoasterLabel(roaster).toLowerCase().includes(normalizedSearch)
    );
  }, [roasterOptions, roasterSearch]);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) {
      setIsRoasterLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadRoasters = async () => {
      setIsRoasterLoading(true);

      try {
        const roasters = await GetCoffeeRoastersAsync(controller.signal);

        if (isMounted) {
          setRoasterOptions((currentOptions) =>
            mergeRoasterOptions(roasters, currentOptions)
          );
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setFormError('Roasters could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsRoasterLoading(false);
        }
      }
    };

    loadRoasters();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading]);

  useEffect(() => {
    if (!isEditing || !entryId) {
      setDraft(createEmptyDraft());
      setRoasterSearch('');
      setFormError('');
      setEntryLoadFailed(false);
      setIsEntryLoading(false);
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (!isAdmin) {
      setIsEntryLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadEntry = async () => {
      setIsEntryLoading(true);
      setFormError('');
      setEntryLoadFailed(false);

      try {
        const entry = await GetCoffeeEntryByIdAsync(entryId, controller.signal);
        const roasterOption = {
          ...createRoasterOption(entry.roaster),
          id:
            entry.roasterId ||
            slugifyRoaster(entry.roaster) ||
            `custom-${Date.now()}`,
        };

        if (isMounted) {
          setRoasterOptions((currentOptions) =>
            mergeRoasterOptions(currentOptions, [roasterOption])
          );
          setDraft(createDraftFromEntry(entry, roasterOption.id));
          setRoasterSearch(formatRoasterLabel(roasterOption));
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setEntryLoadFailed(true);
          setFormError('Coffee entry could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsEntryLoading(false);
        }
      }
    };

    loadEntry();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [entryId, isAdmin, isAuthLoading, isEditing]);

  const updateDraft =
    (field: BrewLogTextField) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setDraft((currentDraft) => ({
        ...currentDraft,
        [field]: event.target.value,
      }));
    };

  const updateRoasterSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.target.value;

    setRoasterSearch(nextSearch);

    if (
      selectedRoaster &&
      nextSearch !== formatRoasterLabel(selectedRoaster)
    ) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        roasterId: '',
      }));
    }
  };

  const selectRoaster = (roaster: RoasterOption) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      roasterId: roaster.id,
    }));
    setRoasterSearch(formatRoasterLabel(roaster));
  };

  const addRoaster = async () => {
    const trimmedRoaster = newRoaster.trim();

    if (!trimmedRoaster) {
      return;
    }

    const existingRoaster = roasterOptions.find(
      (roaster) => roaster.roaster.toLowerCase() === trimmedRoaster.toLowerCase()
    );

    if (existingRoaster) {
      selectRoaster(existingRoaster);
      setNewRoaster('');
      return;
    }

    const roaster = createRoasterOption(trimmedRoaster);

    setFormError('');
    setIsRoasterSubmitting(true);

    try {
      const savedRoaster = await CreateCoffeeRoasterAsync(roaster);

      setRoasterOptions((currentOptions) =>
        mergeRoasterOptions(currentOptions, [savedRoaster])
      );
      selectRoaster(savedRoaster);
      setNewRoaster('');
    } catch {
      setFormError('Roaster could not be saved.');
    } finally {
      setIsRoasterSubmitting(false);
    }
  };

  const saveEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRoaster) {
      setFormError('Select or add a roaster before saving.');
      return;
    }

    if (isEditing && !entryId) {
      setFormError('Coffee entry could not be found.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const request = createRequestFromDraft(draft, selectedRoaster);

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

  const renderSelect = (
    id: string,
    label: string,
    field: BrewLogTextField,
    options: SelectOption[],
    isRequired = false
  ) => (
    <label className={styles.field} htmlFor={id}>
      <span className={styles.labelRow}>
        {label}
        {isRequired && <span className={styles.required}>Required</span>}
      </span>
      <select
        id={id}
        value={draft[field]}
        onChange={updateDraft(field)}
        required={isRequired}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="coffee-entry-title">
        <p className={styles.eyebrow}>Coffee</p>
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
          <p className={styles.sectionKicker}>Admin</p>
          <h2 id="coffee-entry-admin">Sign in to manage brew entries.</h2>
          <p>The public coffee journal is view-only.</p>
        </section>
      )}

      {!isAuthLoading && isAdmin && isFormLoading && (
        <aside className={styles.notice}>
          {isEntryLoading ? 'Loading brew entry...' : 'Loading roasters...'}
        </aside>
      )}

      {canShowEntryFailure && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}
          <div className={styles.actions}>
            <Link className={styles.secondaryLink} to={PAGES.Coffee}>
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
            <section className={styles.section} aria-labelledby="coffee-details">
              <div className={styles.sectionHeader}>
                <p className={styles.sectionKicker}>Entry</p>
                <h2 id="coffee-details">Coffee details</h2>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field} htmlFor="brew-date">
                  <span className={styles.labelRow}>
                    Date
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="brew-date"
                    type="date"
                    value={draft.date}
                    onChange={updateDraft('date')}
                    required
                  />
                </label>

                {renderSelect(
                  'brew-method',
                  'Brew method',
                  'brewMethod',
                  brewMethods,
                  true
                )}

                <label className={styles.field} htmlFor="coffee-name">
                  <span className={styles.labelRow}>
                    Coffee
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="coffee-name"
                    type="text"
                    value={draft.coffeeName}
                    onChange={updateDraft('coffeeName')}
                    required
                  />
                </label>

                <label className={styles.field} htmlFor="coffee-origin">
                  Origin
                  <input
                    id="coffee-origin"
                    type="text"
                    value={draft.origin}
                    onChange={updateDraft('origin')}
                    placeholder="Mbeya, Tanzania"
                  />
                </label>

                <label className={styles.field} htmlFor="coffee-varietal">
                  Coffee varietal
                  <input
                    id="coffee-varietal"
                    type="text"
                    value={draft.coffeeVarietal}
                    onChange={updateDraft('coffeeVarietal')}
                    placeholder="Bourbon"
                  />
                </label>

                <label className={styles.field} htmlFor="processing-method">
                  Processing method
                  <input
                    id="processing-method"
                    type="text"
                    value={draft.processingMethod}
                    onChange={updateDraft('processingMethod')}
                    placeholder="Washed"
                  />
                </label>

                <label className={styles.field} htmlFor="days-since-roast">
                  Days since roast
                  <input
                    id="days-since-roast"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={draft.daysSinceRoast}
                    onChange={updateDraft('daysSinceRoast')}
                    placeholder="12"
                  />
                </label>
              </div>

              <div
                className={styles.roasterPicker}
                role="group"
                aria-labelledby="roaster-picker-label"
              >
                <div className={styles.labelRow} id="roaster-picker-label">
                  Roaster
                  <span className={styles.required}>Required</span>
                </div>
                <input
                  type="search"
                  value={roasterSearch}
                  onChange={updateRoasterSearch}
                  placeholder="Search roaster"
                  aria-label="Search roaster"
                />
                {selectedRoaster && (
                  <p className={styles.selectedRoaster}>
                    Selected: {formatRoasterLabel(selectedRoaster)}
                  </p>
                )}
                <div className={styles.roasterResults}>
                  {filteredRoasterOptions.map((roaster) => (
                    <button
                      type="button"
                      className={[
                        styles.roasterOption,
                        draft.roasterId === roaster.id ? styles.selectedOption : '',
                      ].join(' ')}
                      key={roaster.id}
                      onClick={() => selectRoaster(roaster)}
                      aria-pressed={draft.roasterId === roaster.id}
                    >
                      <span>{roaster.roaster}</span>
                    </button>
                  ))}
                  {filteredRoasterOptions.length === 0 && (
                    <p className={styles.emptyResults}>No matching roasters yet.</p>
                  )}
                </div>

                <div className={styles.inlineAdd}>
                  <p className={styles.inlineTitle}>Add roaster</p>
                  <div className={styles.inlineFields}>
                    <label className={styles.field} htmlFor="new-roaster">
                      Roaster
                      <input
                        id="new-roaster"
                        type="text"
                        value={newRoaster}
                        onChange={(event) => setNewRoaster(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={addRoaster}
                      disabled={!newRoaster.trim() || isRoasterSubmitting}
                    >
                      {isRoasterSubmitting ? 'Saving' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="brew-setup">
              <div className={styles.sectionHeader}>
                <p className={styles.sectionKicker}>Setup</p>
                <h2 id="brew-setup">Brew setup</h2>
              </div>

              <div className={styles.fieldGrid}>
                {renderSelect('ratio', 'Ratio', 'ratio', ratios, true)}
                {renderSelect('grinder', 'Grinder', 'grinder', grinders, true)}

                <label className={styles.field} htmlFor="grind-setting">
                  <span className={styles.labelRow}>
                    Grind setting
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="grind-setting"
                    type="text"
                    value={draft.grindSetting}
                    onChange={updateDraft('grindSetting')}
                    required
                  />
                </label>

                {renderSelect('roast-level', 'Roast level', 'roastLevel', roastLevels)}

                <label className={styles.field} htmlFor="dose">
                  Dose
                  <input
                    id="dose"
                    type="text"
                    inputMode="decimal"
                    value={draft.dose}
                    onChange={updateDraft('dose')}
                    placeholder="20g"
                  />
                </label>

                <label className={styles.field} htmlFor="yield-amount">
                  Yield
                  <input
                    id="yield-amount"
                    type="text"
                    inputMode="decimal"
                    value={draft.yieldAmount}
                    onChange={updateDraft('yieldAmount')}
                    placeholder="320g"
                  />
                </label>

                <label className={styles.field} htmlFor="water-temp">
                  Water temperature
                  <input
                    id="water-temp"
                    type="text"
                    inputMode="decimal"
                    value={draft.waterTemperature}
                    onChange={updateDraft('waterTemperature')}
                    placeholder="203F"
                  />
                </label>

                <label className={styles.field} htmlFor="brew-time">
                  Brew time
                  <input
                    id="brew-time"
                    type="text"
                    value={draft.brewTime}
                    onChange={updateDraft('brewTime')}
                    placeholder="3:20"
                  />
                </label>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="brew-flow">
              <div className={styles.sectionHeader}>
                <p className={styles.sectionKicker}>Process</p>
                <h2 id="brew-flow">Bloom and pours</h2>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field} htmlFor="bloom-time">
                  Bloom time
                  <input
                    id="bloom-time"
                    type="text"
                    value={draft.bloomTime}
                    onChange={updateDraft('bloomTime')}
                    placeholder="45s"
                  />
                </label>

                <label className={styles.field} htmlFor="bloom-water">
                  Bloom water
                  <input
                    id="bloom-water"
                    type="text"
                    inputMode="decimal"
                    value={draft.bloomWater}
                    onChange={updateDraft('bloomWater')}
                    placeholder="50g"
                  />
                </label>
              </div>

              <label className={styles.field} htmlFor="pour-notes">
                Pour notes
                <textarea
                  id="pour-notes"
                  value={draft.pourNotes}
                  onChange={updateDraft('pourNotes')}
                  rows={4}
                />
              </label>
            </section>

            <section className={styles.section} aria-labelledby="tasting-notes">
              <div className={styles.sectionHeader}>
                <p className={styles.sectionKicker}>Cup</p>
                <h2 id="tasting-notes">Tasting notes</h2>
              </div>

              <label className={styles.field} htmlFor="notes">
                <span className={styles.labelRow}>
                  Notes
                  <span className={styles.required}>Required</span>
                </span>
                <textarea
                  id="notes"
                  value={draft.notes}
                  onChange={updateDraft('notes')}
                  rows={6}
                  required
                />
              </label>

              <div className={styles.ratingField}>
                <span>Rating</span>
                <div className={styles.ratingButtons}>
                  {[1, 2, 3, 4, 5].map((ratingValue) => (
                    <button
                      type="button"
                      className={[
                        styles.starButton,
                        draft.rating >= ratingValue ? styles.activeStar : '',
                      ].join(' ')}
                      onClick={() =>
                        setDraft((currentDraft) => ({
                          ...currentDraft,
                          rating: ratingValue,
                        }))
                      }
                      aria-label={`${ratingValue} star rating`}
                      aria-pressed={draft.rating === ratingValue}
                      key={ratingValue}
                    >
                      <span aria-hidden="true">
                        {draft.rating >= ratingValue ? '\u2605' : '\u2606'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className={styles.actions}>
              <Link className={styles.secondaryLink} to={PAGES.Coffee}>
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
