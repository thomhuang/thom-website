import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import type { CoffeePrefill } from './CoffeeEntry';
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

beforeEach(() => {
  mockedGetRoasters.mockReset();
  mockedGetGrinders.mockReset();
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
