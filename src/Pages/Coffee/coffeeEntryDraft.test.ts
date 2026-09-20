import { describe, expect, test } from 'vitest';

import type { CoffeeEntry as CoffeeEntryResponse } from '../../api/Coffee/CoffeeRouter';
import {
  createDraftFromEntry,
  createDraftFromPrefill,
  createEmptyDraft,
  createLookupOption,
  createRequestFromDraft,
  filterOptionsBySearch,
  getRatioValue,
  getYieldAmount,
  mergeById,
  validateDraft,
} from './coffeeEntryDraft';
import type { BrewLogDraft } from './coffeeEntryDraft';

const makeEntry = (
  overrides: Partial<CoffeeEntryResponse> = {}
): CoffeeEntryResponse => ({
  id: 'entry-1',
  date: '2026-01-01',
  coffeeName: 'Ethiopia Guji',
  origin: 'Guji',
  coffeeVarietal: 'Heirloom',
  processingMethod: 'Washed',
  daysSinceRoast: 10,
  roasterId: 'onyx',
  roaster: 'Onyx',
  brewMethod: 'v60',
  ratio: '1:16.67',
  grinderId: 'df64',
  grinder: 'DF64',
  grindSetting: 5,
  dose: 20,
  yieldAmount: 333,
  waterTemperature: 93,
  brewTime: '3:20',
  bloomTime: '0:45',
  bloomWater: 50,
  pourNotes: 'Two pours',
  roastLevel: 'light',
  notes: '',
  tastingNotes: 'Sweet',
  rating: 4,
  ...overrides,
});

describe('getRatioValue', () => {
  test('strips the fixed prefix', () => {
    expect(getRatioValue('1:16.67')).toBe('16.67');
  });

  test('leaves a legacy ratio without the prefix alone', () => {
    expect(getRatioValue('16')).toBe('16');
  });
});

describe('getYieldAmount', () => {
  test('rounds dose times ratio to whole grams', () => {
    expect(getYieldAmount('20', '16.67')).toBe('333');
  });

  test('is blank unless both inputs are numeric', () => {
    expect(getYieldAmount('', '16')).toBe('');
    expect(getYieldAmount('20', '')).toBe('');
    expect(getYieldAmount('abc', '16')).toBe('');
  });
});

describe('validateDraft', () => {
  test('accepts a blank draft', () => {
    expect(validateDraft(createEmptyDraft())).toEqual({});
  });

  test('flags a non-numeric ratio and time', () => {
    const errors = validateDraft({
      ...createEmptyDraft(),
      ratio: 'strong',
      brewTime: '3:99',
    });

    expect(errors.ratio).toBe('Enter a number');
    expect(errors.brewTime).toBe('Enter a time (e.g. 3:20)');
  });

  test('rejects a fractional dose', () => {
    expect(
      validateDraft({ ...createEmptyDraft(), dose: '20.5' }).dose
    ).toBe('Enter a whole number');
  });
});

describe('createRequestFromDraft', () => {
  test('prefixes the ratio, drops blanks, and converts Fahrenheit to Celsius', () => {
    const draft: BrewLogDraft = {
      ...createEmptyDraft(),
      date: '2026-02-02',
      coffeeName: 'Kenya AA',
      brewMethod: 'v60',
      ratio: '17',
      dose: '20',
      waterTemperature: '199',
      notes: 'Bright',
    };

    const request = createRequestFromDraft(
      draft,
      { id: 'onyx', label: 'Onyx' },
      { id: 'df64', label: 'DF64' },
      'F'
    );

    expect(request.ratio).toBe('1:17');
    expect(request.yieldAmount).toBe(340);
    expect(request.dose).toBe(20);
    expect(request.waterTemperature).toBe(93);
    expect(request.roaster).toBe('Onyx');
    expect(request.grinder).toBe('DF64');
    expect(request.grindSetting).toBeUndefined();
    expect(request.bloomWater).toBeUndefined();
  });
});

describe('createDraftFromEntry', () => {
  test('maps an entry into the editable draft', () => {
    expect(
      createDraftFromEntry(makeEntry({ notes: '', tastingNotes: 'Sweet' }), 'onyx', 'df64')
    ).toMatchObject({
      date: '2026-01-01',
      coffeeName: 'Ethiopia Guji',
      daysSinceRoast: '10',
      ratio: '16.67',
      grindSetting: '5',
      dose: '20',
      waterTemperature: '93',
      bloomWater: '50',
      notes: 'Sweet',
      rating: 4,
    });
  });
});

describe('createDraftFromPrefill', () => {
  test('carries bean details but leaves brew specifics blank', () => {
    const draft = createDraftFromPrefill(
      {
        coffeeName: 'Ethiopia Guji',
        origin: 'Guji',
        coffeeVarietal: 'Heirloom',
        processingMethod: 'Washed',
        daysSinceRoast: '10',
        roastLevel: 'light',
        roasterId: 'onyx',
        roaster: 'Onyx',
      },
      'onyx'
    );

    expect(draft).toMatchObject({
      coffeeName: 'Ethiopia Guji',
      origin: 'Guji',
      daysSinceRoast: '10',
      roasterId: 'onyx',
      brewMethod: '',
      ratio: '',
      grinderId: '',
      dose: '',
    });
  });
});

describe('filterOptionsBySearch', () => {
  const options = [
    { id: '1', label: 'Onyx' },
    { id: '2', label: 'Passenger' },
  ];

  test('matches case-insensitively on the label', () => {
    expect(filterOptionsBySearch(options, 'ony')).toEqual([options[0]]);
  });

  test('returns every option for a blank search', () => {
    expect(filterOptionsBySearch(options, '  ')).toEqual(options);
  });
});

describe('mergeById', () => {
  test('keeps the first occurrence of an id', () => {
    const result = mergeById(
      [{ id: '1', label: 'Onyx' }],
      [
        { id: '1', label: 'Other' },
        { id: '2', label: 'Passenger' },
      ]
    );

    expect(result).toEqual([
      { id: '1', label: 'Onyx' },
      { id: '2', label: 'Passenger' },
    ]);
  });
});

describe('createLookupOption', () => {
  test('slugs a name into an id', () => {
    expect(createLookupOption('Blue Bottle')).toEqual({
      id: 'blue-bottle',
      label: 'Blue Bottle',
    });
  });

  test('prefers an explicit id', () => {
    expect(createLookupOption('Blue Bottle', 'roaster-7')).toEqual({
      id: 'roaster-7',
      label: 'Blue Bottle',
    });
  });

  test('falls back to a generated id for an unsluggable name', () => {
    expect(createLookupOption('***').id).toMatch(/^custom-/);
  });
});
