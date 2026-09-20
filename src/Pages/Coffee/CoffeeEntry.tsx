import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CreateCoffeeEntryAsync,
  CreateCoffeeGrinderAsync,
  CreateCoffeeRoasterAsync,
  GetCoffeeEntryByIdAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
  UpdateCoffeeEntryAsync,
} from '../../api/Coffee/CoffeeRouter';
import type {
  CoffeeEntry as CoffeeEntryResponse,
  CoffeeEntryRequest,
  CoffeeGrinder,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import styles from './Coffee.module.css';
import { fromCelsius, roundToTenth, toCelsius } from './format';
import type { TemperatureUnit } from './format';

type RoasterOption = CoffeeRoaster;
type GrinderOption = CoffeeGrinder;

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
  grinderId: string;
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

type FieldErrors = Partial<Record<BrewLogTextField, string>>;

type SelectOption = {
  value: string;
  label: string;
};

export const brewMethods: SelectOption[] = [
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

export type CoffeePrefill = {
  coffeeName: string;
  origin: string;
  coffeeVarietal: string;
  processingMethod: string;
  daysSinceRoast: string;
  roastLevel: string;
  roasterId: string;
  roaster: string;
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
  grinderId: '',
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

const createDraftFromPrefill = (
  prefill: CoffeePrefill,
  roasterId: string
): BrewLogDraft => ({
  ...createEmptyDraft(),
  coffeeName: prefill.coffeeName,
  origin: prefill.origin,
  coffeeVarietal: prefill.coffeeVarietal,
  processingMethod: prefill.processingMethod,
  daysSinceRoast: prefill.daysSinceRoast,
  roastLevel: prefill.roastLevel,
  roasterId,
});

const createDraftFromEntry = (
  entry: CoffeeEntryResponse,
  roasterId: string,
  grinderId: string
): BrewLogDraft => ({
  date: entry.date,
  coffeeName: entry.coffeeName,
  origin: entry.origin || '',
  coffeeVarietal: entry.coffeeVarietal || '',
  processingMethod: entry.processingMethod || '',
  daysSinceRoast: String(entry.daysSinceRoast),
  roasterId,
  brewMethod: entry.brewMethod,
  ratio: entry.ratio,
  grinderId,
  grindSetting: String(entry.grindSetting),
  dose: String(entry.dose),
  yieldAmount: String(entry.yieldAmount),
  waterTemperature: String(entry.waterTemperature),
  brewTime: entry.brewTime,
  bloomTime: entry.bloomTime,
  bloomWater: String(entry.bloomWater),
  pourNotes: entry.pourNotes,
  roastLevel: entry.roastLevel,
  notes: entry.notes || entry.tastingNotes,
  rating: entry.rating,
});

const formatRoasterLabel = (roaster: RoasterOption) => roaster.roaster;

const slugifyCoffeeValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createCustomId = () => `custom-${Date.now()}`;

const createRoasterOption = (roaster: string): RoasterOption => ({
  id: slugifyCoffeeValue(roaster) || createCustomId(),
  roaster,
});

const createGrinderOption = (grinder: string): GrinderOption => ({
  id: slugifyCoffeeValue(grinder) || createCustomId(),
  grinder,
});

// Merge fetched and locally-added options, keeping the first occurrence of an id.
const mergeById = <T extends { id: string }>(
  primaryOptions: T[],
  secondaryOptions: T[] = []
): T[] => {
  const optionsById = new Map<string, T>();

  [...primaryOptions, ...secondaryOptions].forEach((option) => {
    if (!optionsById.has(option.id)) {
      optionsById.set(option.id, option);
    }
  });

  return Array.from(optionsById.values());
};

const formatGrinderLabel = (grinder: GrinderOption) => grinder.grinder;

// Water temperature is stored as whole degrees Celsius. The form can display it
// in Fahrenheit, so convert and round back to the server's integer on save.
const createRequestFromDraft = (
  draft: BrewLogDraft,
  roaster: RoasterOption,
  grinder: GrinderOption,
  temperatureUnit: TemperatureUnit
): CoffeeEntryRequest => ({
  ...draft,
  roaster: roaster.roaster,
  grinder: grinder.grinder,
  grindSetting: draft.grindSetting ? Number(draft.grindSetting) : undefined,
  daysSinceRoast: draft.daysSinceRoast ? Number(draft.daysSinceRoast) : undefined,
  dose: draft.dose ? Number(draft.dose) : undefined,
  yieldAmount: draft.yieldAmount ? Number(draft.yieldAmount) : undefined,
  waterTemperature: draft.waterTemperature
    ? Math.round(toCelsius(Number(draft.waterTemperature), temperatureUnit))
    : undefined,
  bloomWater: draft.bloomWater ? Number(draft.bloomWater) : undefined,
});

const validateDraft = (draft: BrewLogDraft): FieldErrors => {
  const errors: FieldErrors = {};

  if (draft.grindSetting && !/^\d+(\.\d+)?$/.test(String(draft.grindSetting).trim())) {
    errors.grindSetting = 'Enter a number';
  }
  if (draft.dose && !/^\d+$/.test(String(draft.dose).trim())) {
    errors.dose = 'Enter a whole number';
  }
  if (draft.yieldAmount && !/^\d+$/.test(String(draft.yieldAmount).trim())) {
    errors.yieldAmount = 'Enter a whole number';
  }
  if (
    draft.waterTemperature &&
    !/^\d+(\.\d+)?$/.test(String(draft.waterTemperature).trim())
  ) {
    errors.waterTemperature = 'Enter a number';
  }
  if (draft.brewTime && !/^\d{1,2}:[0-5]\d$/.test(String(draft.brewTime).trim())) {
    errors.brewTime = 'Enter a time (e.g. 3:20)';
  }
  if (draft.bloomTime && !/^\d{1,2}:[0-5]\d$/.test(String(draft.bloomTime).trim())) {
    errors.bloomTime = 'Enter a time (e.g. 0:45)';
  }
  if (draft.bloomWater && !/^\d+$/.test(String(draft.bloomWater).trim())) {
    errors.bloomWater = 'Enter a whole number';
  }

  return errors;
};

export default function CoffeeEntry() {
  const { entryId } = useParams<{ entryId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: CoffeePrefill } | null)
    ?.prefill;
  const { isAdmin, isAuthLoading } = useAuth();
  const isEditing = Boolean(entryId);
  const [roasterOptions, setRoasterOptions] = useState<RoasterOption[]>([]);
  const [grinderOptions, setGrinderOptions] = useState<GrinderOption[]>([]);
  const [draft, setDraft] = useState<BrewLogDraft>(createEmptyDraft);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('C');
  const [roasterSearch, setRoasterSearch] = useState('');
  const [grinderSearch, setGrinderSearch] = useState('');
  const [newRoaster, setNewRoaster] = useState('');
  const [newGrinder, setNewGrinder] = useState('');
  const [formError, setFormError] = useState('');
  const fieldErrors = useMemo(() => validateDraft(draft), [draft]);
  const [entryLoadFailed, setEntryLoadFailed] = useState(false);
  const [isEntryLoading, setIsEntryLoading] = useState(isEditing);
  const [isRoasterLoading, setIsRoasterLoading] = useState(false);
  const [isRoasterSubmitting, setIsRoasterSubmitting] = useState(false);
  const [isGrinderLoading, setIsGrinderLoading] = useState(false);
  const [isGrinderSubmitting, setIsGrinderSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFormLoading = isEntryLoading || isRoasterLoading || isGrinderLoading;
  const canShowEntryFailure =
    !isAuthLoading && isAdmin && !isFormLoading && entryLoadFailed;
  const canShowForm =
    !isAuthLoading && isAdmin && !isFormLoading && !entryLoadFailed;

  const selectedRoaster = roasterOptions.find(
    (roaster) => roaster.id === draft.roasterId
  );
  const selectedGrinder = grinderOptions.find(
    (grinder) => grinder.id === draft.grinderId
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
  const filteredGrinderOptions = useMemo(() => {
    const normalizedSearch = grinderSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return grinderOptions;
    }

    return grinderOptions.filter((grinder) =>
      formatGrinderLabel(grinder).toLowerCase().includes(normalizedSearch)
    );
  }, [grinderOptions, grinderSearch]);

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
            mergeById(roasters, currentOptions)
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
    if (isAuthLoading || !isAdmin) {
      setIsGrinderLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadGrinders = async () => {
      setIsGrinderLoading(true);

      try {
        const grinders = await GetCoffeeGrindersAsync(controller.signal);

        if (isMounted) {
          setGrinderOptions((currentOptions) =>
            mergeById(grinders, currentOptions)
          );
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setFormError('Grinders could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsGrinderLoading(false);
        }
      }
    };

    loadGrinders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isAdmin, isAuthLoading]);

  useEffect(() => {
    if (!isEditing || !entryId) {
      if (prefill) {
        let roasterId = '';

        if (prefill.roaster.trim()) {
          const roasterOption = {
            ...createRoasterOption(prefill.roaster),
            id:
              prefill.roasterId ||
              slugifyCoffeeValue(prefill.roaster) ||
              createCustomId(),
          };

          roasterId = roasterOption.id;
          setRoasterOptions((currentOptions) =>
            mergeById(currentOptions, [roasterOption])
          );
          setRoasterSearch(formatRoasterLabel(roasterOption));
        } else {
          setRoasterSearch('');
        }

        setDraft(createDraftFromPrefill(prefill, roasterId));
      } else {
        setDraft(createEmptyDraft());
        setRoasterSearch('');
      }

      setGrinderSearch('');
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
            slugifyCoffeeValue(entry.roaster) ||
            `custom-${Date.now()}`,
        };
        const grinderOption = {
          ...createGrinderOption(entry.grinder),
          id:
            entry.grinderId ||
            slugifyCoffeeValue(entry.grinder) ||
            `custom-${Date.now()}`,
        };

        if (isMounted) {
          setRoasterOptions((currentOptions) =>
            mergeById(currentOptions, [roasterOption])
          );
          setGrinderOptions((currentOptions) =>
            mergeById(currentOptions, [grinderOption])
          );
          setDraft(
            createDraftFromEntry(entry, roasterOption.id, grinderOption.id)
          );
          setRoasterSearch(formatRoasterLabel(roasterOption));
          setGrinderSearch(formatGrinderLabel(grinderOption));
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
  }, [entryId, isAdmin, isAuthLoading, isEditing, prefill]);

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
        mergeById(currentOptions, [savedRoaster])
      );
      selectRoaster(savedRoaster);
      setNewRoaster('');
    } catch {
      setFormError('Roaster could not be saved.');
    } finally {
      setIsRoasterSubmitting(false);
    }
  };

  const updateGrinderSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.target.value;

    setGrinderSearch(nextSearch);

    if (
      selectedGrinder &&
      nextSearch !== formatGrinderLabel(selectedGrinder)
    ) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        grinderId: '',
      }));
    }
  };

  const selectGrinder = (grinder: GrinderOption) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      grinderId: grinder.id,
    }));
    setGrinderSearch(formatGrinderLabel(grinder));
  };

  const addGrinder = async () => {
    const trimmedGrinder = newGrinder.trim();

    if (!trimmedGrinder) {
      return;
    }

    const existingGrinder = grinderOptions.find(
      (grinder) => grinder.grinder.toLowerCase() === trimmedGrinder.toLowerCase()
    );

    if (existingGrinder) {
      selectGrinder(existingGrinder);
      setNewGrinder('');
      return;
    }

    const grinder = createGrinderOption(trimmedGrinder);

    setFormError('');
    setIsGrinderSubmitting(true);

    try {
      const savedGrinder = await CreateCoffeeGrinderAsync(grinder);

      setGrinderOptions((currentOptions) =>
        mergeById(currentOptions, [savedGrinder])
      );
      selectGrinder(savedGrinder);
      setNewGrinder('');
    } catch {
      setFormError('Grinder could not be saved.');
    } finally {
      setIsGrinderSubmitting(false);
    }
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
            <section className={styles.section} aria-labelledby="coffee-details">
              <h2 id="coffee-details">Coffee details</h2>

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
              <h2 id="brew-setup">Brew setup</h2>

              <div className={styles.fieldGrid}>
                {renderSelect('ratio', 'Ratio', 'ratio', ratios, true)}

                <label className={styles.field} htmlFor="grind-setting">
                  <span className={styles.labelRow}>
                    Grind setting
                    <span className={styles.required}>Required</span>
                  </span>
                  <input
                    id="grind-setting"
                    className={fieldErrors.grindSetting ? styles.invalid : undefined}
                    type="text"
                    inputMode="decimal"
                    pattern="\d+(\.\d+)?"
                    title="Enter a number"
                    value={draft.grindSetting}
                    onChange={updateDraft('grindSetting')}
                    required
                  />
                  {fieldErrors.grindSetting && <span className={styles.fieldError}>{fieldErrors.grindSetting}</span>}
                </label>

                {renderSelect('roast-level', 'Roast level', 'roastLevel', roastLevels)}

                <label className={styles.field} htmlFor="dose">
                  Dose (g)
                  <input
                    id="dose"
                    className={fieldErrors.dose ? styles.invalid : undefined}
                    type="text"
                    inputMode="numeric"
                    pattern="\d+"
                    value={draft.dose}
                    onChange={updateDraft('dose')}
                    placeholder="20"
                  />
                  {fieldErrors.dose && <span className={styles.fieldError}>{fieldErrors.dose}</span>}
                </label>

                <label className={styles.field} htmlFor="yield-amount">
                  Yield (g)
                  <input
                    id="yield-amount"
                    className={fieldErrors.yieldAmount ? styles.invalid : undefined}
                    type="text"
                    inputMode="numeric"
                    pattern="\d+"
                    value={draft.yieldAmount}
                    onChange={updateDraft('yieldAmount')}
                    placeholder="320"
                  />
                  {fieldErrors.yieldAmount && <span className={styles.fieldError}>{fieldErrors.yieldAmount}</span>}
                </label>

                <label className={styles.field} htmlFor="water-temp">
                  <span className={styles.labelRow}>
                    Water temperature
                    <span
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
                          onClick={() => changeTemperatureUnit(unit)}
                          aria-pressed={temperatureUnit === unit}
                        >
                          °{unit}
                        </button>
                      ))}
                    </span>
                  </span>
                  <input
                    id="water-temp"
                    className={fieldErrors.waterTemperature ? styles.invalid : undefined}
                    type="text"
                    inputMode="decimal"
                    pattern="\d+(\.\d+)?"
                    title="Enter a number"
                    value={draft.waterTemperature}
                    onChange={updateDraft('waterTemperature')}
                    placeholder={temperatureUnit === 'C' ? '93' : '199'}
                  />
                  {fieldErrors.waterTemperature && <span className={styles.fieldError}>{fieldErrors.waterTemperature}</span>}
                </label>

                <label className={styles.field} htmlFor="brew-time">
                  Brew time
                  <input
                    id="brew-time"
                    className={fieldErrors.brewTime ? styles.invalid : undefined}
                    type="text"
                    value={draft.brewTime}
                    onChange={updateDraft('brewTime')}
                    placeholder="3:20"
                    pattern="\d{1,2}:[0-5]\d"
                    title="Enter a time like 3:20"
                  />
                  {fieldErrors.brewTime && <span className={styles.fieldError}>{fieldErrors.brewTime}</span>}
                </label>
              </div>

              <div
                className={styles.roasterPicker}
                role="group"
                aria-labelledby="grinder-picker-label"
              >
                <div className={styles.labelRow} id="grinder-picker-label">
                  Grinder
                  <span className={styles.required}>Required</span>
                </div>
                <input
                  type="search"
                  value={grinderSearch}
                  onChange={updateGrinderSearch}
                  placeholder="Search grinder"
                  aria-label="Search grinder"
                />
                {selectedGrinder && (
                  <p className={styles.selectedRoaster}>
                    Selected: {formatGrinderLabel(selectedGrinder)}
                  </p>
                )}
                <div className={styles.roasterResults}>
                  {filteredGrinderOptions.map((grinder) => (
                    <button
                      type="button"
                      className={[
                        styles.roasterOption,
                        draft.grinderId === grinder.id
                          ? styles.selectedOption
                          : '',
                      ].join(' ')}
                      key={grinder.id}
                      onClick={() => selectGrinder(grinder)}
                      aria-pressed={draft.grinderId === grinder.id}
                    >
                      <span>{grinder.grinder}</span>
                    </button>
                  ))}
                  {filteredGrinderOptions.length === 0 && (
                    <p className={styles.emptyResults}>
                      No matching grinders yet.
                    </p>
                  )}
                </div>

                <div className={styles.inlineAdd}>
                  <p className={styles.inlineTitle}>Add grinder</p>
                  <div className={styles.inlineFields}>
                    <label className={styles.field} htmlFor="new-grinder">
                      Grinder
                      <input
                        id="new-grinder"
                        type="text"
                        value={newGrinder}
                        onChange={(event) => setNewGrinder(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={addGrinder}
                      disabled={!newGrinder.trim() || isGrinderSubmitting}
                    >
                      {isGrinderSubmitting ? 'Saving' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="brew-flow">
              <h2 id="brew-flow">Bloom and pours</h2>

              <div className={styles.fieldGrid}>
                <label className={styles.field} htmlFor="bloom-time">
                  Bloom time
                  <input
                    id="bloom-time"
                    className={fieldErrors.bloomTime ? styles.invalid : undefined}
                    type="text"
                    value={draft.bloomTime}
                    onChange={updateDraft('bloomTime')}
                    placeholder="0:45"
                    pattern="\d{1,2}:[0-5]\d"
                    title="Enter a time like 0:45"
                  />
                  {fieldErrors.bloomTime && <span className={styles.fieldError}>{fieldErrors.bloomTime}</span>}
                </label>

                <label className={styles.field} htmlFor="bloom-water">
                  Bloom water (g)
                  <input
                    id="bloom-water"
                    className={fieldErrors.bloomWater ? styles.invalid : undefined}
                    type="text"
                    inputMode="numeric"
                    pattern="\d+"
                    value={draft.bloomWater}
                    onChange={updateDraft('bloomWater')}
                    placeholder="50"
                  />
                  {fieldErrors.bloomWater && <span className={styles.fieldError}>{fieldErrors.bloomWater}</span>}
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
              <h2 id="tasting-notes">Tasting notes</h2>

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
