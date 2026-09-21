import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  GetShopBrandsAsync,
  GetShopItemsAsync,
  ShopItemSummary,
} from '../../api/Shop/ShopRouter';
import Shop from './Shop';

vi.mock('../../api/Shop/ShopRouter', () => ({
  GetShopItemsAsync: vi.fn(),
  GetShopBrandsAsync: vi.fn(),
  DeleteShopItemAsync: vi.fn(),
}));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: false, isAuthLoading: false }),
}));

const mockedGetItems = vi.mocked(GetShopItemsAsync);
const mockedGetBrands = vi.mocked(GetShopBrandsAsync);

const ALPHA: ShopItemSummary = {
  id: '1',
  title: 'Alpha Jacket',
  brandId: '1',
  brand: 'AlphaBrand',
  priceCents: 2000,
  currency: 'usd',
  stock: 1,
  isPublished: true,
  primaryImageUrl: '',
};

const BETA: ShopItemSummary = {
  id: '2',
  title: 'Beta Tee',
  brandId: '2',
  brand: 'BetaBrand',
  priceCents: 1000,
  currency: 'usd',
  stock: 0,
  isPublished: true,
  primaryImageUrl: '',
};

const renderShop = () => render(<Shop />, { wrapper: MemoryRouter });

beforeEach(() => {
  localStorage.clear();
  mockedGetItems.mockReset();
  mockedGetBrands.mockReset();
  mockedGetBrands.mockResolvedValue([]);
});

describe('Shop', () => {
  test('shows a loading state while listings load', async () => {
    mockedGetItems.mockReturnValue(new Promise<never>(() => {}));

    renderShop();

    expect(await screen.findByText('Loading listings...')).toBeInTheDocument();
  });

  test('shows an error state when listings fail to load', async () => {
    mockedGetItems.mockRejectedValue(new Error('boom'));

    renderShop();

    expect(
      await screen.findByText('Listings could not be loaded.')
    ).toBeInTheDocument();
  });

  test('shows an empty state when there are no listings', async () => {
    mockedGetItems.mockResolvedValue([]);

    renderShop();

    expect(await screen.findByText('Nothing listed yet.')).toBeInTheDocument();
    expect(
      screen.getByText('Published listings will show here.')
    ).toBeInTheDocument();
  });

  test('filters by availability and brand', async () => {
    const user = userEvent.setup();
    mockedGetItems.mockResolvedValue([ALPHA, BETA]);
    mockedGetBrands.mockResolvedValue([
      { id: '1', brand: 'AlphaBrand' },
      { id: '2', brand: 'BetaBrand' },
    ]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();
    expect(screen.getByText('Beta Tee')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Availability/), 'out-of-stock');
    expect(screen.queryByText('Alpha Jacket')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Tee')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Availability/), 'all');
    await user.selectOptions(screen.getByLabelText(/Brand/), '1');
    expect(screen.getByText('Alpha Jacket')).toBeInTheDocument();
    expect(screen.queryByText('Beta Tee')).not.toBeInTheDocument();
  });

  test('defaults to a random sort', async () => {
    mockedGetItems.mockResolvedValue([ALPHA, BETA]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort/)).toHaveValue('random');
  });

  test('sorts by price ascending', async () => {
    const user = userEvent.setup();
    mockedGetItems.mockResolvedValue([ALPHA, BETA]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText(/Sort/),
      'price-asc'
    );

    const titles = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(['Beta Tee', 'Alpha Jacket']);
  });

  test('persists the list layout choice', async () => {
    const user = userEvent.setup();
    mockedGetItems.mockResolvedValue([ALPHA]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List' }));

    expect(localStorage.getItem('shop-layout')).toBe('list');
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
