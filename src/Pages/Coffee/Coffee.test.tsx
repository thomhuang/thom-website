import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  GetCoffeeEntriesAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeProfilesAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import type { CoffeeEntry } from '../../api/Coffee/CoffeeRouter';
import Coffee from './Coffee';

vi.mock('../../api/Coffee/CoffeeRouter', () => ({
  GetCoffeeEntriesAsync: vi.fn(),
  GetCoffeeRoastersAsync: vi.fn(),
  GetCoffeeGrindersAsync: vi.fn(),
  DeleteCoffeeEntryAsync: vi.fn(),
  GetCoffeeProfilesAsync: vi.fn(),
  CreateCoffeeProfileAsync: vi.fn(),
  UpdateCoffeeProfileAsync: vi.fn(),
  DeleteCoffeeProfileAsync: vi.fn(),
}));

const authState = vi.hoisted(() => ({ isAdmin: false }));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: authState.isAdmin, isAuthLoading: false }),
}));

const mockedGetEntries = vi.mocked(GetCoffeeEntriesAsync);
const mockedGetRoasters = vi.mocked(GetCoffeeRoastersAsync);
const mockedGetGrinders = vi.mocked(GetCoffeeGrindersAsync);
const mockedGetProfiles = vi.mocked(GetCoffeeProfilesAsync);

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
  mockedGetProfiles.mockReset();
  mockedGetRoasters.mockResolvedValue([]);
  mockedGetGrinders.mockResolvedValue([]);
  mockedGetProfiles.mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Coffee journal', () => {
  test('groups brews by roaster, then by coffee name', async () => {
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
        coffeeName: 'Kenya AA',
        roaster: 'Onyx',
        brewMethod: 'v60',
        date: '2025-12-30',
      }),
      makeEntry({
        id: '4',
        coffeeName: 'Colombia Huila',
        roaster: 'Passenger',
        brewMethod: 'v60',
        date: '2025-12-20',
      }),
    ]);

    renderCoffee();

    const roasters = await screen.findAllByRole('heading', { level: 3 });
    expect(roasters.map((heading) => heading.textContent)).toEqual([
      'Onyx',
      'Passenger',
    ]);

    const coffees = screen.getAllByRole('heading', { level: 4 });
    expect(coffees.map((heading) => heading.textContent)).toEqual([
      'Ethiopia Guji',
      'Kenya AA',
      'Colombia Huila',
    ]);

    expect(screen.getByText('2 coffees · 3 brews')).toBeInTheDocument();
    expect(screen.getByText('1 coffee · 1 brew')).toBeInTheDocument();

    const onyxGroup = roasters[0].closest('section');
    expect(onyxGroup).not.toBeNull();
    expect(
      within(onyxGroup as HTMLElement).getAllByRole('article')
    ).toHaveLength(3);
  });

  test('roaster and coffee sections start collapsed', async () => {
    mockedGetEntries.mockResolvedValue([
      makeEntry({ id: '1', coffeeName: 'Ethiopia Guji', roaster: 'Onyx' }),
    ]);

    renderCoffee();

    const roaster = await screen.findByRole('heading', {
      level: 3,
      name: 'Onyx',
    });
    const coffee = screen.getByRole('heading', {
      level: 4,
      name: 'Ethiopia Guji',
    });

    expect(roaster.closest('details')).not.toHaveAttribute('open');
    expect(coffee.closest('details')).not.toHaveAttribute('open');
  });

  test('groups coffee names case-insensitively', async () => {
    mockedGetEntries.mockResolvedValue([
      makeEntry({ id: '1', coffeeName: 'Kenya AA' }),
      makeEntry({ id: '2', coffeeName: 'kenya aa' }),
    ]);

    renderCoffee();

    expect(await screen.findByText('2 brews')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(1);
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

    await screen.findByRole('heading', { level: 3, name: 'Onyx' });
    expect(
      screen.queryByRole('link', { name: 'New brew for Ethiopia Guji' })
    ).not.toBeInTheDocument();
  });

  test('titles the page as the coffee journal', async () => {
    mockedGetEntries.mockResolvedValue([]);

    renderCoffee();

    await waitFor(() => expect(document.title).toBe('Coffee journal'));
  });

  test('links each brew card to its own page', async () => {
    mockedGetEntries.mockResolvedValue([
      makeEntry({
        id: '7',
        coffeeName: 'Ethiopia Guji',
        roaster: 'Onyx',
        brewMethod: 'v60',
      }),
    ]);

    renderCoffee();

    const link = await screen.findByRole('link', { name: 'V60' });
    expect(link).toHaveAttribute('href', '/coffee/7');
  });

  test('paginates roasters, five per page', async () => {
    const user = userEvent.setup();
    mockedGetEntries.mockResolvedValue(
      Array.from({ length: 6 }, (_, index) =>
        makeEntry({
          id: String(index + 1),
          coffeeName: `Coffee ${index + 1}`,
          roaster: `Roaster ${index + 1}`,
        })
      )
    );

    renderCoffee();

    expect(await screen.findAllByRole('heading', { level: 3 })).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Roaster 6' })
    ).toBeInTheDocument();
  });

  test('paginates coffees within a roaster, five per page', async () => {
    const user = userEvent.setup();
    mockedGetEntries.mockResolvedValue(
      Array.from({ length: 6 }, (_, index) =>
        makeEntry({
          id: String(index + 1),
          coffeeName: `Coffee ${index + 1}`,
          roaster: 'Onyx',
        })
      )
    );

    renderCoffee();

    await screen.findByRole('heading', { level: 3, name: 'Onyx' });

    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 4, name: 'Coffee 6' })
    ).toBeInTheDocument();
  });

  test('paginates brews within a coffee, three per page', async () => {
    const user = userEvent.setup();
    mockedGetEntries.mockResolvedValue(
      Array.from({ length: 4 }, (_, index) =>
        makeEntry({
          id: String(index + 1),
          coffeeName: 'Ethiopia Guji',
          roaster: 'Onyx',
        })
      )
    );

    renderCoffee();

    await screen.findByRole('heading', { level: 3, name: 'Onyx' });

    expect(screen.getAllByRole('article')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  test('paginates roasters, three per page on mobile', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches:
        query === '(max-width: 640px)' || query === '(max-width: 1024px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList);

    mockedGetEntries.mockResolvedValue(
      Array.from({ length: 4 }, (_, index) =>
        makeEntry({
          id: String(index + 1),
          coffeeName: `Coffee ${index + 1}`,
          roaster: `Roaster ${index + 1}`,
        })
      )
    );

    renderCoffee();

    expect(await screen.findAllByRole('heading', { level: 3 })).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Roaster 4' })
    ).toBeInTheDocument();
  });
});
