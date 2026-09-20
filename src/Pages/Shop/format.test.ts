import { describe, expect, test } from 'vitest';

import {
  formatDateTime,
  formatMeasurement,
  formatStock,
  getPrimaryImage,
  parsePriceToCents,
} from './format';

describe('parsePriceToCents', () => {
  test('parses whole dollars', () => {
    expect(parsePriceToCents('18')).toBe(1800);
  });

  test('parses one and two decimals', () => {
    expect(parsePriceToCents('18.5')).toBe(1850);
    expect(parsePriceToCents('18.05')).toBe(1805);
  });

  test('rejects non-numeric input', () => {
    expect(parsePriceToCents('')).toBeNull();
    expect(parsePriceToCents('abc')).toBeNull();
    expect(parsePriceToCents('.5')).toBeNull();
  });

  test('rejects more than two decimals', () => {
    expect(parsePriceToCents('18.999')).toBeNull();
  });

  test('rejects values that overflow safe integers', () => {
    expect(parsePriceToCents('90071992547409.92')).toBeNull();
  });
});

describe('formatMeasurement', () => {
  test('displays inches with one decimal', () => {
    expect(formatMeasurement(30, 'in')).toBe('30.0 in');
  });

  test('converts inches to centimeters', () => {
    expect(formatMeasurement(34, 'cm')).toBe('86.4 cm');
  });
});

describe('formatStock', () => {
  test('labels zero stock as sold out', () => {
    expect(formatStock(0)).toBe('Sold out');
  });

  test('labels single and plural stock', () => {
    expect(formatStock(1)).toBe('1 available');
    expect(formatStock(3)).toBe('3 available');
  });
});

describe('formatDateTime', () => {
  test('parses the API timestamp as UTC', () => {
    const formatted = formatDateTime('2026-01-02 03:04:05');

    expect(formatted).toMatch(/2026/);
    expect(formatted).not.toBe('2026-01-02 03:04:05');
  });

  test('returns empty for empty input', () => {
    expect(formatDateTime('')).toBe('');
  });
});

describe('getPrimaryImage', () => {
  test('returns empty when there are no images', () => {
    expect(getPrimaryImage([])).toBe('');
  });
});
