import { describe, expect, test } from 'vitest';

import type { CoffeeEntry, CoffeeEntrySummary } from '../../api/Coffee/CoffeeRouter';
import {
  filterEntries,
  formatBrewMethod,
  formatCount,
  getBrewMethodOptions,
  getEntryStatGroups,
  getGroupPrefill,
  getRoasterCountLabel,
  groupEntriesByCoffee,
  groupEntriesByRoaster,
} from './coffeeGroups';

const makeEntry = (overrides: Partial<CoffeeEntry>): CoffeeEntry => ({
  id: '1',
  date: '2026-01-01',
  coffeeName: 'Coffee',
  origin: '',
  coffeeVarietal: '',
  processingMethod: '',
  daysSinceRoast: 0,
  roasterId: '',
  roaster: '',
  brewMethod: 'v60',
  ratio: '1:16',
  grinderId: '',
  grinder: '',
  grindSetting: 0,
  dose: 0,
  yieldAmount: 0,
  waterTemperature: 0,
  brewTime: '',
  bloomTime: '',
  bloomWater: 0,
  pourNotes: '',
  roastLevel: '',
  notes: '',
  tastingNotes: '',
  rating: 4,
  ...overrides,
});

describe('groupEntriesByCoffee', () => {
  test('groups case-insensitively and preserves first-seen order', () => {
    const groups = groupEntriesByCoffee([
      makeEntry({ id: '1', coffeeName: 'Kenya AA' }),
      makeEntry({ id: '2', coffeeName: 'kenya aa' }),
      makeEntry({ id: '3', coffeeName: 'Guji' }),
    ]);

    expect(groups.map((group) => group.coffeeName)).toEqual([
      'Kenya AA',
      'Guji',
    ]);
    expect(groups[0].entries).toHaveLength(2);
  });
});

describe('groupEntriesByRoaster', () => {
  test('keys by roaster id, then name, and buckets roasterless entries', () => {
    const groups = groupEntriesByRoaster([
      makeEntry({ id: '1', roasterId: 'onyx', roaster: 'Onyx' }),
      makeEntry({ id: '2', roasterId: 'onyx', roaster: 'Onyx' }),
      makeEntry({ id: '3', roasterId: '', roaster: 'Passenger' }),
      makeEntry({ id: '4', roasterId: '', roaster: '' }),
    ]);

    expect(groups.map((group) => group.roasterName)).toEqual([
      'Onyx',
      'Passenger',
      'Unknown roaster',
    ]);
    expect(groups[0].coffees).toHaveLength(1);
    expect(groups[0].coffees[0].entries).toHaveLength(2);
  });

  test('shares a group between id-less entries with the same name', () => {
    const groups = groupEntriesByRoaster([
      makeEntry({ id: '1', roaster: 'Passenger' }),
      makeEntry({ id: '2', roaster: 'passenger' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].coffees[0].entries).toHaveLength(2);
  });
});

describe('getRoasterCountLabel', () => {
  test('pluralizes coffees and brews', () => {
    const [onyx] = groupEntriesByRoaster([
      makeEntry({ id: '1', roaster: 'Onyx', coffeeName: 'A' }),
      makeEntry({ id: '2', roaster: 'Onyx', coffeeName: 'A' }),
      makeEntry({ id: '3', roaster: 'Onyx', coffeeName: 'B' }),
    ]);

    expect(getRoasterCountLabel(onyx)).toBe('2 coffees · 3 brews');
  });
});

describe('formatCount', () => {
  test('uses the singular for one', () => {
    expect(formatCount(1, 'brew', 'brews')).toBe('1 brew');
    expect(formatCount(0, 'brew', 'brews')).toBe('0 brews');
  });
});

describe('filterEntries', () => {
  const entries = [
    makeEntry({
      id: '1',
      roasterId: 'onyx',
      roaster: 'Onyx',
      grinderId: 'df64',
      grinder: 'DF64',
      brewMethod: 'v60',
    }),
    makeEntry({
      id: '2',
      roasterId: 'passenger',
      roaster: 'Passenger',
      grinderId: 'c40',
      grinder: 'C40',
      brewMethod: 'orea-z1',
    }),
  ];

  const baseOptions = {
    selectedRoasterId: '',
    selectedGrinderId: '',
    selectedBrewMethod: '',
    roasterOptions: [],
  };

  test('returns everything when no filters are set', () => {
    expect(filterEntries(entries, baseOptions)).toHaveLength(2);
  });

  test('filters by roaster, grinder, and method independently', () => {
    expect(
      filterEntries(entries, { ...baseOptions, selectedGrinderId: 'c40' })
    ).toEqual([entries[1]]);
    expect(
      filterEntries(entries, { ...baseOptions, selectedRoasterId: 'onyx' })
    ).toEqual([entries[0]]);
    expect(
      filterEntries(entries, { ...baseOptions, selectedBrewMethod: 'orea-z1' })
    ).toEqual([entries[1]]);
  });

  test('matches an id-less entry against the selected roaster name', () => {
    const idless = [makeEntry({ id: '3', roaster: 'Onyx', brewMethod: 'v60' })];

    expect(
      filterEntries(idless, {
        ...baseOptions,
        selectedRoasterId: 'onyx',
        roasterOptions: [{ id: 'onyx', roaster: 'Onyx' }],
      })
    ).toHaveLength(1);
  });
});

describe('getBrewMethodOptions', () => {
  test('dedupes and sorts by display label', () => {
    expect(
      getBrewMethodOptions([
        makeEntry({ id: '1', brewMethod: 'v60' }),
        makeEntry({ id: '2', brewMethod: 'orea-z1' }),
        makeEntry({ id: '3', brewMethod: 'v60' }),
      ])
    ).toEqual(['orea-z1', 'v60']);
  });
});

describe('formatBrewMethod', () => {
  test('maps a known value to its label and passes through unknown values', () => {
    expect(formatBrewMethod('v60')).toBe('V60');
    expect(formatBrewMethod('mystery')).toBe('mystery');
  });
});

describe('getEntryStatGroups', () => {
  test('drops empty stats and empty groups', () => {
    const summary: CoffeeEntrySummary = {
      id: '1',
      date: '2026-01-01',
      coffeeName: 'Coffee',
      origin: '',
      coffeeVarietal: '',
      processingMethod: '',
      roaster: '',
      brewMethod: 'v60',
      ratio: '1:16',
      grinder: '',
      notes: '',
      tastingNotes: '',
      rating: 4,
    };

    const groups = getEntryStatGroups(summary, 'C');

    expect(groups).toEqual([
      {
        title: 'Brew',
        stats: [
          { label: 'Method', value: 'v60' },
          { label: 'Ratio', value: '1:16' },
        ],
      },
    ]);
  });
});

describe('getGroupPrefill', () => {
  test('carries the first entry bean details, including days since roast', () => {
    const [group] = groupEntriesByCoffee([
      makeEntry({
        coffeeName: 'Guji',
        origin: 'Guji',
        roasterId: 'onyx',
        roaster: 'Onyx',
        daysSinceRoast: 10,
        roastLevel: 'light',
      }),
    ]);

    expect(getGroupPrefill(group)).toMatchObject({
      coffeeName: 'Guji',
      origin: 'Guji',
      roasterId: 'onyx',
      roaster: 'Onyx',
      daysSinceRoast: '10',
      roastLevel: 'light',
    });
  });
});
