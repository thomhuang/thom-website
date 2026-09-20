import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  CreateCoffeeEntryAsync,
  GetCoffeeEntryByIdAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
  UpdateCoffeeEntryAsync,
} from '../../api/Coffee/CoffeeRouter';
import type { CoffeeEntry as CoffeeEntryResponse } from '../../api/Coffee/CoffeeRouter';
import type { CoffeePrefill } from './coffeeEntryDraft';
import CoffeeEntry from './CoffeeEntry';

vi.mock('../../api/Coffee/CoffeeRouter', () => ({
  GetCoffeeRoastersAsync: vi.fn(),
  GetCoffeeGrindersAsync: vi.fn(),
  GetCoffeeEntryByIdAsync: vi.fn(),
  CreateCoffeeEntryAsync: vi.fn(),
  UpdateCoffeeEntryAsync: vi.fn(),
  CreateCoffeeRoasterAsync: vi.fn(),
  CreateCoffeeGrinderAsync: vi.fn(),
}));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: true, isAuthLoading: false }),
}));

const mockedGetRoasters = vi.mocked(GetCoffeeRoastersAsync);
const mockedGetGrinders = vi.mocked(GetCoffeeGrindersAsync);
const mockedGetEntry = vi.mocked(GetCoffeeEntryByIdAsync);
const mockedUpdateEntry = vi.mocked(UpdateCoffeeEntryAsync);

const makeEntry = (overrides: Partial<CoffeeEntryResponse> = {}): CoffeeEntryResponse => ({
  id: 'entry-1',
  date: '2026-01-01',
  coffeeName: 'Ethiopia Guji',
  origin: '',
  coffeeVarietal: '',
  processingMethod: '',
  daysSinceRoast: 10,
  roasterId: 'onyx',
  roaster: 'Onyx',
  brewMethod: 'v60',
  ratio: '1:16',
  grinderId: 'df64',
  grinder: 'DF64',
  grindSetting: 5,
  dose: 20,
  yieldAmount: 320,
  waterTemperature: 93,
  brewTime: '3:20',
  bloomTime: '0:45',
  bloomWater: 50,
  pourNotes: '',
  roastLevel: 'light',
  notes: 'Tasting notes',
  tastingNotes: 'Tasting notes',
  rating: 4,
  ...overrides,
});

beforeEach(() => {
  mockedGetRoasters.mockReset();
  mockedGetGrinders.mockReset();
  mockedGetEntry.mockReset();
  mockedUpdateEntry.mockReset();
  vi.mocked(CreateCoffeeEntryAsync).mockReset();
  mockedGetRoasters.mockResolvedValue([]);
  mockedGetGrinders.mockResolvedValue([]);
});

describe('CoffeeEntry prefill', () => {
  test('fills the bean details but leaves the brew specifics blank', async () => {
    const prefill: CoffeePrefill = {
      coffeeName: 'Ethiopia Guji',
      origin: 'Guji',
      coffeeVarietal: 'Heirloom',
      processingMethod: 'Washed',
      daysSinceRoast: '10',
      roastLevel: 'light',
      roasterId: 'onyx',
      roaster: 'Onyx',
    };

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/coffee/entry', state: { prefill } }]}
      >
        <CoffeeEntry />
      </MemoryRouter>
    );

    expect(
      await screen.findByDisplayValue('Ethiopia Guji')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Guji')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Heirloom')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Washed')).toBeInTheDocument();
    expect(screen.getByLabelText(/roast level/i)).toHaveValue('light');
    expect(screen.getByLabelText(/days since roast/i)).toHaveValue(10);
    expect(screen.getByLabelText('Search roaster')).toHaveValue('Onyx');

    // Brew specifics are not carried over.
    expect(screen.getByLabelText(/brew method/i)).toHaveValue('');
    expect(screen.getByLabelText(/grind setting/i)).toHaveValue('');
    expect(screen.getByLabelText('Search grinder')).toHaveValue('');
  });
});

describe('CoffeeEntry ratio', () => {
  test('uses a text input with a fixed 1: prefix and round-trips the float', async () => {
    mockedGetRoasters.mockResolvedValue([{ id: 'onyx', roaster: 'Onyx' }]);
    mockedGetGrinders.mockResolvedValue([{ id: 'df64', grinder: 'DF64' }]);
    mockedGetEntry.mockResolvedValue(makeEntry({ ratio: '1:16.67' }));

    render(
      <MemoryRouter initialEntries={['/coffee/entry/entry-1']}>
        <Routes>
          <Route path="/coffee/entry/:entryId" element={<CoffeeEntry />} />
        </Routes>
      </MemoryRouter>
    );

    const ratioInput = await screen.findByLabelText(/ratio/i);
    expect(ratioInput).toHaveAttribute('type', 'text');
    expect(ratioInput).toHaveValue('16.67');

    const yieldInput = screen.getByLabelText(/yield/i);
    expect(yieldInput).toHaveAttribute('readonly');
    expect(yieldInput).toHaveValue('333');

    await userEvent.clear(ratioInput);
    await userEvent.type(ratioInput, '17');
    expect(yieldInput).toHaveValue('340');
    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i })
    );

    expect(mockedUpdateEntry).toHaveBeenCalledWith(
      'entry-1',
      expect.objectContaining({ ratio: '1:17', yieldAmount: 340 })
    );
  });
});
