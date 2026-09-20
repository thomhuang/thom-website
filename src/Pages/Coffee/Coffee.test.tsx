import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  GetCoffeeEntriesAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import type { CoffeeEntry } from '../../api/Coffee/CoffeeRouter';
import Coffee from './Coffee';

vi.mock('../../api/Coffee/CoffeeRouter', () => ({
  GetCoffeeEntriesAsync: vi.fn(),
  GetCoffeeRoastersAsync: vi.fn(),
  GetCoffeeGrindersAsync: vi.fn(),
  DeleteCoffeeEntryAsync: vi.fn(),
}));

const authState = vi.hoisted(() => ({ isAdmin: false }));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: authState.isAdmin, isAuthLoading: false }),
}));

const mockedGetEntries = vi.mocked(GetCoffeeEntriesAsync);
const mockedGetRoasters = vi.mocked(GetCoffeeRoastersAsync);
const mockedGetGrinders = vi.mocked(GetCoffeeGrindersAsync);

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
  ratio: '',
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

const renderCoffee = () => render(<Coffee />, { wrapper: MemoryRouter });

beforeEach(() => {
  authState.isAdmin = false;
  mockedGetEntries.mockReset();
  mockedGetRoasters.mockReset();
  mockedGetGrinders.mockReset();
  mockedGetRoasters.mockResolvedValue([]);
  mockedGetGrinders.mockResolvedValue([]);
});

describe('Coffee journal', () => {
  test('groups brews by coffee name and shows the bolded roaster : name', async () => {
    mockedGetEntries.mockResolvedValue([
      makeEntry({
        id: '1',
        coffeeName: 'Ethiopia Guji',
        roaster: 'Onyx',
        brewMethod: 'v60',
        date: '2026-01-02',
      }),
      makeEntry({
        id: '2',
        coffeeName: 'Ethiopia Guji',
        roaster: 'Onyx',
        brewMethod: 'orea-z1',
        date: '2026-01-01',
      }),
      makeEntry({
        id: '3',
        coffeeName: 'Colombia Huila',
        roaster: 'Passenger',
        brewMethod: 'v60',
        date: '2025-12-20',
      }),
    ]);

    renderCoffee();

    const headings = await screen.findAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Onyx : Ethiopia Guji',
      'Passenger : Colombia Huila',
    ]);
    expect(within(headings[0]).getByText('Onyx').tagName).toBe('STRONG');

    expect(screen.getByText('2 brews')).toBeInTheDocument();
    expect(screen.getByText('1 brew')).toBeInTheDocument();

    const ethiopiaGroup = headings[0].closest('section');
    expect(ethiopiaGroup).not.toBeNull();
    expect(
      within(ethiopiaGroup as HTMLElement).getAllByRole('article')
    ).toHaveLength(2);
  });

  test('groups coffee names case-insensitively', async () => {
    mockedGetEntries.mockResolvedValue([
      makeEntry({ id: '1', coffeeName: 'Kenya AA' }),
      makeEntry({ id: '2', coffeeName: 'kenya aa' }),
    ]);

    renderCoffee();

    expect(await screen.findByText('2 brews')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
  });

  test('admins get a prefill link on each coffee group', async () => {
    authState.isAdmin = true;
    mockedGetEntries.mockResolvedValue([
      makeEntry({ id: '1', coffeeName: 'Ethiopia Guji', roaster: 'Onyx' }),
    ]);

    renderCoffee();

    const link = await screen.findByRole('link', {
      name: 'New brew for Ethiopia Guji',
    });
    expect(link).toHaveAttribute('href', '/coffee/entry');
  });

  test('non-admins do not get a prefill link', async () => {
    mockedGetEntries.mockResolvedValue([
      makeEntry({ id: '1', coffeeName: 'Ethiopia Guji', roaster: 'Onyx' }),
    ]);

    renderCoffee();

    await screen.findByRole('heading', { level: 3, name: 'Onyx : Ethiopia Guji' });
    expect(
      screen.queryByRole('link', { name: 'New brew for Ethiopia Guji' })
    ).not.toBeInTheDocument();
  });
});
