import { describe, expect, test } from 'vitest';

import { formatBlogDate } from './format';

describe('formatBlogDate', () => {
  test('renders a UTC database timestamp as a local date', () => {
    expect(formatBlogDate('2026-09-01 12:00:00')).toContain('2026');
  });

  test('returns unparseable values unchanged', () => {
    expect(formatBlogDate('not a date')).toBe('not a date');
  });

  test('returns an empty string for an empty value', () => {
    expect(formatBlogDate('')).toBe('');
  });
});
