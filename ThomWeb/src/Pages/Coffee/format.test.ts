import { describe, expect, test } from 'vitest';

import {
  formatTemperature,
  fromCelsius,
  roundToTenth,
  toCelsius,
} from './format';

describe('temperature conversions', () => {
  test('converts Fahrenheit to Celsius', () => {
    expect(toCelsius(212, 'F')).toBe(100);
  });

  test('passes Celsius through unchanged', () => {
    expect(toCelsius(100, 'C')).toBe(100);
  });

  test('converts Celsius to Fahrenheit', () => {
    expect(fromCelsius(100, 'F')).toBe(212);
  });

  test('rounds to one decimal', () => {
    expect(roundToTenth(1.234)).toBe(1.2);
    expect(roundToTenth(1.25)).toBe(1.3);
  });
});

describe('formatTemperature', () => {
  test('returns empty for missing values', () => {
    expect(formatTemperature(undefined, 'C')).toBe('');
  });

  test('formats Celsius directly', () => {
    expect(formatTemperature(100, 'C')).toBe('100 °C');
  });

  test('converts and formats Fahrenheit', () => {
    expect(formatTemperature(96, 'F')).toBe('204.8 °F');
  });
});
