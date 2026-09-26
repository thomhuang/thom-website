import type { ChangeEventHandler } from 'react';

import type {
  CoffeeEntry as CoffeeEntryResponse,
  CoffeeEntryRequest,
} from '../../api/Coffee/CoffeeRouter';
import { toCelsius } from './format';
import type { TemperatureUnit } from './format';

export type BrewLogDraft = {
  date: string;
  coffeeName: string;
  origin: string;
  coffeeVarietal: string;
  processingMethod: string;
  roastDate: string;
  roasterId: string;
  brewMethod: string;
  ratio: string;
  grinderId: string;
  grindSetting: string;
  dose: string;
  waterTemperature: string;
  brewTime: string;
  bloomTime: string;
  bloomWater: string;
  pourNotes: string;
  roastLevel: string;
  notes: string;
  rating: number;
};

export type BrewLogTextField = Exclude<keyof BrewLogDraft, 'rating'>;

export type FieldErrors = Partial<Record<BrewLogTextField, string>>;

export type BrewLogFieldChangeHandler = ChangeEventHandler<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export type UpdateDraft = (field: BrewLogTextField) => BrewLogFieldChangeHandler;

export type SetDraftField = (field: BrewLogTextField, value: string) => void;

export type SelectOption = {
  value: string;
  label: string;
};

// A searchable option (roaster or grinder). The id is stored on an entry; the
// label is what the user sees and types.
export type LookupOption = {
  id: string;
  label: string;
};

export type CoffeePrefill = {
  coffeeName: string;
  origin: string;
  coffeeVarietal: string;
  processingMethod: string;
  roastDate: string;
  roastLevel: string;
  roasterId: string;
  roaster: string;
};

export const brewMethods: SelectOption[] = [
  { value: 'v60', label: 'V60' },
  { value: 'turbo-shot', label: 'Turbo Shot' },
  { value: 'orea-z1', label: 'Orea Z1' },
  { value: 'gabi-master-a', label: 'Gabi Dripper' },
  { value: 'oxo-rapid-brewer', label: 'OXO Rapid Brewer' },
];

export const roastLevels: SelectOption[] = [
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

export const createEmptyDraft = (): BrewLogDraft => ({
  date: getTodayDate(),
  coffeeName: '',
  origin: '',
  coffeeVarietal: '',
  processingMethod: '',
  roastDate: '',
  roasterId: '',
  brewMethod: '',
  ratio: '',
  grinderId: '',
  grindSetting: '',
  dose: '',
  waterTemperature: '',
  brewTime: '',
  bloomTime: '',
  bloomWater: '',
  pourNotes: '',
  roastLevel: '',
  notes: '',
  rating: 0,
});

export const createDraftFromPrefill = (
  prefill: CoffeePrefill,
  roasterId: string
): BrewLogDraft => ({
  ...createEmptyDraft(),
  coffeeName: prefill.coffeeName,
  origin: prefill.origin,
  coffeeVarietal: prefill.coffeeVarietal,
  processingMethod: prefill.processingMethod,
  roastDate: prefill.roastDate,
  roastLevel: prefill.roastLevel,
  roasterId,
});

export const createDraftFromEntry = (
  entry: CoffeeEntryResponse,
  roasterId: string,
  grinderId: string
): BrewLogDraft => ({
  date: entry.date,
  coffeeName: entry.coffeeName,
  origin: entry.origin || '',
  coffeeVarietal: entry.coffeeVarietal || '',
  processingMethod: entry.processingMethod || '',
  roastDate: getRoastDate(entry.date, entry.daysSinceRoast),
  roasterId,
  brewMethod: entry.brewMethod,
  ratio: getRatioValue(entry.ratio),
  grinderId,
  grindSetting: String(entry.grindSetting),
  dose: String(entry.dose),
  waterTemperature: String(entry.waterTemperature),
  brewTime: entry.brewTime,
  bloomTime: entry.bloomTime,
  bloomWater: String(entry.bloomWater),
  pourNotes: entry.pourNotes,
  roastLevel: entry.roastLevel,
  notes: entry.notes || entry.tastingNotes,
  rating: entry.rating,
});

// Ratio is displayed as a fixed "1:" prefix plus an editable float, but stored
// as a single string (e.g. "1:16.67").
export const RATIO_PREFIX = '1:';

export const getRatioValue = (ratio: string) =>
  ratio.startsWith(RATIO_PREFIX) ? ratio.slice(RATIO_PREFIX.length) : ratio;

// Yield is derived from dose and ratio, so it is never edited directly. Blank
// or non-numeric inputs leave it blank; otherwise it rounds to whole grams.
export const getYieldAmount = (dose: string, ratio: string): string => {
  const parsedDose = Number(dose.trim());
  const parsedRatio = Number(ratio.trim());

  if (
    !dose.trim() ||
    !ratio.trim() ||
    Number.isNaN(parsedDose) ||
    Number.isNaN(parsedRatio)
  ) {
    return '';
  }

  return String(Math.round(parsedDose * parsedRatio));
};

const MS_PER_DAY = 86_400_000;

const parseDateValue = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
};

// The roast date is the form's input; the server only stores the derived
// whole-day gap to the brew date.
export const getDaysSinceRoast = (date: string, roastDate: string): string => {
  const brewDate = parseDateValue(date);
  const roast = parseDateValue(roastDate);

  if (!brewDate || !roast) {
    return '';
  }

  return String(Math.round((brewDate.getTime() - roast.getTime()) / MS_PER_DAY));
};

// Reconstructs the roast date an entry with a known days-since-roast implies.
export const getRoastDate = (date: string, daysSinceRoast: number): string => {
  const brewDate = parseDateValue(date);

  if (!brewDate) {
    return '';
  }

  const roast = new Date(brewDate.getTime() - daysSinceRoast * MS_PER_DAY);
  return roast.toISOString().slice(0, 10);
};

export const slugifyCoffeeValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createCustomId = () => `custom-${Date.now()}`;

export const createLookupOption = (
  label: string,
  id = ''
): LookupOption => ({
  id: id || slugifyCoffeeValue(label) || createCustomId(),
  label,
});

// Merge fetched and locally-added options, keeping the first occurrence of an id.
export const mergeById = <T extends { id: string }>(
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

export const filterOptionsBySearch = (
  options: LookupOption[],
  search: string
): LookupOption[] => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return options;
  }

  return options.filter((option) =>
    option.label.toLowerCase().includes(normalizedSearch)
  );
};

// Water temperature is stored as whole degrees Celsius. The form can display it
// in Fahrenheit, so convert and round back to the server's integer on save.
export const createRequestFromDraft = (
  draft: BrewLogDraft,
  roaster: LookupOption,
  grinder: LookupOption,
  temperatureUnit: TemperatureUnit
): CoffeeEntryRequest => {
  const yieldAmount = getYieldAmount(draft.dose, draft.ratio);
  const daysSinceRoast = getDaysSinceRoast(draft.date, draft.roastDate);
  const { roastDate, ...fields } = draft;

  return {
    ...fields,
    roaster: roaster.label,
    grinder: grinder.label,
    ratio: `${RATIO_PREFIX}${draft.ratio.trim()}`,
    grindSetting: draft.grindSetting ? Number(draft.grindSetting) : undefined,
    daysSinceRoast: daysSinceRoast !== '' ? Number(daysSinceRoast) : undefined,
    dose: draft.dose ? Number(draft.dose) : undefined,
    yieldAmount: yieldAmount ? Number(yieldAmount) : undefined,
    waterTemperature: draft.waterTemperature
      ? Math.round(toCelsius(Number(draft.waterTemperature), temperatureUnit))
      : undefined,
    bloomWater: draft.bloomWater ? Number(draft.bloomWater) : undefined,
  };
};

export const validateDraft = (draft: BrewLogDraft): FieldErrors => {
  const errors: FieldErrors = {};

  if (draft.ratio && !/^\d+(\.\d+)?$/.test(draft.ratio.trim())) {
    errors.ratio = 'Enter a number';
  }
  if (draft.grindSetting && !/^\d+(\.\d+)?$/.test(String(draft.grindSetting).trim())) {
    errors.grindSetting = 'Enter a number';
  }
  if (draft.dose && !/^\d+$/.test(String(draft.dose).trim())) {
    errors.dose = 'Enter a whole number';
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
  const daysSinceRoast = getDaysSinceRoast(draft.date, draft.roastDate);
  if (daysSinceRoast && Number(daysSinceRoast) < 0) {
    errors.roastDate = 'Roast date must be on or before the brew date';
  }

  return errors;
};
