import type {
  CoffeeEntrySummary,
  CoffeeRoaster,
} from '../../api/Coffee/CoffeeRouter';
import { brewMethods } from './coffeeEntryDraft';
import type { CoffeePrefill } from './coffeeEntryDraft';
import { formatTemperature } from './format';
import type { TemperatureUnit } from './format';

export type EntryStat = {
  label: string;
  value: string;
};

export type EntryStatGroup = {
  title: string;
  stats: EntryStat[];
};

export type CoffeeGroup = {
  key: string;
  coffeeName: string;
  entries: CoffeeEntrySummary[];
};

export type RoasterGroup = {
  key: string;
  roasterName: string;
  coffees: CoffeeGroup[];
};

const UNKNOWN_ROASTER = 'Unknown roaster';

export const formatCoffeeMetadata = (entry: CoffeeEntrySummary) =>
  [entry.origin, entry.coffeeVarietal, entry.processingMethod]
    .filter(Boolean)
    .join(' / ');

export const formatDaysSinceRoast = (daysSinceRoast?: number) => {
  if (daysSinceRoast == null) {
    return '';
  }

  return `${daysSinceRoast} day${daysSinceRoast === 1 ? '' : 's'}`;
};

export const formatGrams = (value?: number) =>
  value != null ? `${value} g` : '';

export const formatBloom = (entry: CoffeeEntrySummary) =>
  [entry.bloomTime, formatGrams(entry.bloomWater)].filter(Boolean).join(' / ');

export const getEntryStatGroups = (
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
        {
          label: 'Grind',
          value: entry.grindSetting != null ? String(entry.grindSetting) : '',
        },
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

export const formatRatingStars = (rating: number) =>
  '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));

export const getTastingNotes = (entry: CoffeeEntrySummary) =>
  entry.tastingNotes || entry.notes || '';

export const formatBrewMethod = (value: string) =>
  brewMethods.find((option) => option.value === value)?.label ?? value;

export const formatCount = (
  count: number,
  singular: string,
  plural: string
) => `${count} ${count === 1 ? singular : plural}`;

// Entries within a roaster are grouped by coffee name, preserving the order
// the API returned them in.
export const groupEntriesByCoffee = (
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

// Roasters are keyed by id when the entry has one, otherwise by name, so that
// id-less entries from the same roaster still share a group. Entries with no
// roaster at all fall into a single "Unknown roaster" group.
const getRoasterKey = (entry: CoffeeEntrySummary) => {
  if (entry.roasterId) {
    return `id:${entry.roasterId}`;
  }

  const name = entry.roaster.trim().toLowerCase();
  return name ? `name:${name}` : 'unknown';
};

// Entries are grouped by roaster first, preserving API order at both levels.
export const groupEntriesByRoaster = (
  entries: CoffeeEntrySummary[]
): RoasterGroup[] => {
  const buckets = new Map<
    string,
    { roasterName: string; entries: CoffeeEntrySummary[] }
  >();

  entries.forEach((entry) => {
    const key = getRoasterKey(entry);
    const existing = buckets.get(key);

    if (existing) {
      existing.entries.push(entry);
      return;
    }

    buckets.set(key, {
      roasterName: entry.roaster.trim() || UNKNOWN_ROASTER,
      entries: [entry],
    });
  });

  return Array.from(buckets, ([key, bucket]) => ({
    key,
    roasterName: bucket.roasterName,
    coffees: groupEntriesByCoffee(bucket.entries),
  }));
};

export const getRoasterCountLabel = (group: RoasterGroup) => {
  const brewTotal = group.coffees.reduce(
    (total, coffee) => total + coffee.entries.length,
    0
  );

  return `${formatCount(group.coffees.length, 'coffee', 'coffees')} · ${formatCount(
    brewTotal,
    'brew',
    'brews'
  )}`;
};

export const getBrewMethodOptions = (entries: CoffeeEntrySummary[]) =>
  Array.from(new Set(entries.map((entry) => entry.brewMethod))).sort((a, b) =>
    formatBrewMethod(a).localeCompare(formatBrewMethod(b))
  );

type EntryFilterOptions = {
  selectedRoasterId: string;
  selectedGrinderId: string;
  selectedBrewMethod: string;
  roasterOptions: CoffeeRoaster[];
};

export const filterEntries = (
  entries: CoffeeEntrySummary[],
  {
    selectedRoasterId,
    selectedGrinderId,
    selectedBrewMethod,
    roasterOptions,
  }: EntryFilterOptions
) =>
  entries.filter((entry) => {
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

// A new brew for an existing coffee carries the bean details forward; the brew
// specifics (date, method, grinder, dose, etc.) stay blank.
export const getGroupPrefill = (group: CoffeeGroup): CoffeePrefill => {
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
