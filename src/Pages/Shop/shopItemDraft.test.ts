import { describe, expect, test } from 'vitest';

import type { ShopItem } from '../../api/Shop/ShopRouter';
import {
  createDraftFromItem,
  createEmptyDraft,
  createRequestFromDraft,
  getDraftValidation,
  getMeasurementSuggestions,
  MEASUREMENT_ERROR,
  measurementRowError,
  parseMeasurementValue,
  serializeDraft,
  validateStock,
} from './shopItemDraft';

const makeItem = (overrides: Partial<ShopItem> = {}): ShopItem => ({
  id: 'item-1',
  title: 'Jacket',
  description: 'A jacket',
  brandId: '1',
  brand: 'Acme',
  category: 'outerwear',
  size: 'Large',
  priceCents: 1800,
  currency: 'usd',
  stock: 2,
  isPublished: true,
  measurements: [{ id: 'm1', label: 'Pit to pit', valueInches: 21 }],
  images: [],
  ...overrides,
});

describe('parseMeasurementValue', () => {
  test('parses a value within range', () => {
    expect(parseMeasurementValue('21.5')).toBe(21.5);
  });

  test('returns null for blank, non-numeric, or out-of-range input', () => {
    expect(parseMeasurementValue('')).toBeNull();
    expect(parseMeasurementValue('wide')).toBeNull();
    expect(parseMeasurementValue('0')).toBeNull();
    expect(parseMeasurementValue('101')).toBeNull();
  });
});

describe('measurementRowError', () => {
  test('treats a fully blank row as an empty placeholder', () => {
    expect(measurementRowError({ label: '', value: '' })).toBeNull();
  });

  test('requires a label and a value once a row is started', () => {
    expect(measurementRowError({ label: '', value: '21' })).toBe('Add a label');
    expect(measurementRowError({ label: 'Waist', value: '' })).toBe('Add a value');
    expect(measurementRowError({ label: 'Waist', value: 'huge' })).toBe(
      MEASUREMENT_ERROR
    );
  });
});

describe('validateStock', () => {
  test('accepts whole numbers only', () => {
    expect(validateStock('2')).toBeNull();
    expect(validateStock('2.5')).toBe('Enter a whole number');
    expect(validateStock('')).toBe('Enter a whole number');
  });
});

describe('createDraftFromItem', () => {
  test('maps a listing into the editable draft', () => {
    expect(createDraftFromItem(makeItem())).toEqual({
      title: 'Jacket',
      description: 'A jacket',
      brand: 'Acme',
      category: 'outerwear',
      size: 'Large',
      price: '18.00',
      stock: '2',
      measurements: [{ label: 'Pit to pit', value: '21' }],
      isPublished: true,
    });
  });
});

describe('serializeDraft', () => {
  test('trims text so whitespace-only edits are no-ops', () => {
    const draft = { ...createEmptyDraft(), title: '  Jacket  ' };
    const spaced = { ...createEmptyDraft(), title: 'Jacket' };

    expect(serializeDraft(draft)).toBe(serializeDraft(spaced));
  });
});

describe('getDraftValidation', () => {
  test('reports price, title, and stock errors', () => {
    const { priceCents, fieldErrors } = getDraftValidation(createEmptyDraft());

    expect(priceCents).toBeNull();
    expect(fieldErrors.title).toBe('Title is required');
    expect(fieldErrors.price).toBe('Enter a price like 18.00');
    expect(fieldErrors.stock).toBeNull();
  });
});

describe('getMeasurementSuggestions', () => {
  test('excludes labels the listing already carries', () => {
    const draft = {
      ...createEmptyDraft(),
      category: 'pants',
      measurements: [{ label: 'Waist', value: '' }],
    };

    const suggestions = getMeasurementSuggestions(draft);

    expect(suggestions).toContain('Inseam');
    expect(suggestions).not.toContain('Waist');
  });
});

describe('createRequestFromDraft', () => {
  test('builds the request and drops incomplete measurement rows', () => {
    const draft = {
      ...createEmptyDraft(),
      title: ' Jacket ',
      brand: ' Acme ',
      price: '18.00',
      stock: '2',
      measurements: [
        { label: 'Waist', value: '32' },
        { label: 'Blank', value: '' },
        { label: '', value: '10' },
      ],
    };

    expect(createRequestFromDraft(draft, 1800)).toEqual({
      title: 'Jacket',
      description: '',
      brandId: '',
      brand: 'Acme',
      category: '',
      size: '',
      priceCents: 1800,
      currency: 'usd',
      stock: 2,
      measurements: [{ label: 'Waist', valueInches: 32 }],
      isPublished: false,
    });
  });
});
