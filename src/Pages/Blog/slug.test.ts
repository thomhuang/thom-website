import { describe, expect, test } from 'vitest';

import { slugifyHeading } from './slug';

describe('slugifyHeading', () => {
  test('lowercases and hyphenates spaces', () => {
    expect(slugifyHeading('Jump To Gear')).toBe('jump-to-gear');
  });

  test('drops punctuation and collapses whitespace', () => {
    expect(slugifyHeading('  What’s new?  ')).toBe('whats-new');
  });

  test('keeps existing hyphens and unicode letters', () => {
    expect(slugifyHeading('Café déjà-vu')).toBe('café-déjà-vu');
  });
});
