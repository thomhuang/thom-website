import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { GetCoffeeEntryByIdAsync } from '../../api/Coffee/CoffeeRouter';
import type { CoffeeEntry } from '../../api/Coffee/CoffeeRouter';
import CoffeeEntryDetail from './CoffeeEntryDetail';

vi.mock('../../api/Coffee/CoffeeRouter', () => ({
  GetCoffeeEntryByIdAsync: vi.fn(),
}));

const mockedGetEntry = vi.mocked(GetCoffeeEntryByIdAsync);

const entry: CoffeeEntry = {
  id: '42',
  date: '2026-01-01',
  coffeeName: 'Ethiopia Guji',
  origin: 'Ethiopia',
  coffeeVarietal: 'Heirloom',
  processingMethod: 'Washed',
  daysSinceRoast: 7,
  roasterId: '1',
  roaster: 'Onyx',
  brewMethod: 'v60',
  ratio: '1:16',
  grinderId: '1',
  grinder: 'Comandante',
  grindSetting: 20,
  dose: 15,
  yieldAmount: 240,
  waterTemperature: 94,
  brewTime: '2:30',
  bloomTime: '0:30',
  bloomWater: 45,
  pourNotes: 'Slow spiral.',
  roastLevel: 'Light',
  notes: 'Sweet.',
  tastingNotes: 'Jasmine, peach.',
  rating: 5,
};

const renderDetailAt = (entryId: string) =>
  render(
    <MemoryRouter initialEntries={[`/coffee/${entryId}`]}>
      <Routes>
        <Route path="/coffee/:entryId" element={<CoffeeEntryDetail />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  document.title = '';
  mockedGetEntry.mockReset();
});

describe('Coffee entry detail', () => {
  test('renders the entry and titles the page with its name and id', async () => {
    mockedGetEntry.mockResolvedValue(entry);

    renderDetailAt('42');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ethiopia Guji' })
    ).toBeInTheDocument();
    expect(screen.getByText('Onyx')).toBeInTheDocument();
    expect(screen.getByText('Jasmine, peach.')).toBeInTheDocument();

    await waitFor(() => expect(document.title).toBe('Ethiopia Guji #42'));
  });

  test('shows a not-found state for a missing entry', async () => {
    mockedGetEntry.mockRejectedValue(new Error('not found'));

    renderDetailAt('9');

    expect(
      await screen.findByText('Brew entry could not be found.')
    ).toBeInTheDocument();
    expect(document.title).toBe('Coffee journal');
  });
});
