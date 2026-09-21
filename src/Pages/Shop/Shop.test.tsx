import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  GetShopBrandsAsync,
  GetShopItemsAsync,
  ShopItemSummary,
  UpdateShopItemsPublicationAsync,
} from '../../api/Shop/ShopRouter';
import Shop from './Shop';

vi.mock('../../api/Shop/ShopRouter', () => ({
  GetShopItemsAsync: vi.fn(),
  GetShopBrandsAsync: vi.fn(),
  DeleteShopItemAsync: vi.fn(),
  UpdateShopItemsPublicationAsync: vi.fn(),
}));

const authState = vi.hoisted(() => ({ isAdmin: false, isAuthLoading: false }));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => authState,
}));

const mockedGetItems = vi.mocked(GetShopItemsAsync);
const mockedGetBrands = vi.mocked(GetShopBrandsAsync);
const mockedUpdatePublication = vi.mocked(UpdateShopItemsPublicationAsync);

const ALPHA: ShopItemSummary = {
  id: '1',
  title: 'Alpha Jacket',
  brandId: '1',
  brand: 'AlphaBrand',
  category: 'tops',
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
  category: 'bottoms',
  priceCents: 1000,
  currency: 'usd',
  stock: 0,
  isPublished: true,
  primaryImageUrl: '',
};

const DRAFT: ShopItemSummary = {
  id: '3',
  title: 'Gamma Draft',
  brandId: '',
  brand: '',
  category: '',
  priceCents: 1500,
  currency: 'usd',
  stock: 1,
  isPublished: false,
  primaryImageUrl: '',
};

const renderShop = () => render(<Shop />, { wrapper: MemoryRouter });

beforeEach(() => {
  localStorage.clear();
  authState.isAdmin = false;
  authState.isAuthLoading = false;
  mockedGetItems.mockReset();
  mockedGetBrands.mockReset();
  mockedGetBrands.mockResolvedValue([]);
  mockedUpdatePublication.mockReset();
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

  test('filters by category', async () => {
    const user = userEvent.setup();
    mockedGetItems.mockResolvedValue([ALPHA, BETA]);
    mockedGetBrands.mockResolvedValue([]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();
    expect(screen.getByText('Beta Tee')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Category/), 'bottoms');
    expect(screen.queryByText('Alpha Jacket')).not.toBeInTheDocument();
    expect(screen.getByText('Beta Tee')).toBeInTheDocument();
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

  test('toggles the filter panel', async () => {
    const user = userEvent.setup();
    mockedGetItems.mockResolvedValue([ALPHA]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Filters' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('hides the batch controls from non-admins', async () => {
    mockedGetItems.mockResolvedValue([ALPHA]);

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publish selected' })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Select Alpha Jacket')).not.toBeInTheDocument();
  });

  test('lets an admin publish a selected draft', async () => {
    const user = userEvent.setup();
    authState.isAdmin = true;
    mockedGetItems.mockResolvedValue([ALPHA, DRAFT]);
    mockedUpdatePublication.mockResolvedValue({ updated: 1 });

    renderShop();

    expect(await screen.findByText('Gamma Draft')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Select Gamma Draft'));
    await user.click(screen.getByRole('button', { name: 'Publish selected' }));

    expect(mockedUpdatePublication).toHaveBeenCalledWith(['3'], true);
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
  });

  test('lets an admin unpublish a selected batch', async () => {
    const user = userEvent.setup();
    authState.isAdmin = true;
    mockedGetItems.mockResolvedValue([ALPHA, BETA]);
    mockedUpdatePublication.mockResolvedValue({ updated: 2 });

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Select Alpha Jacket'));
    await user.click(screen.getByLabelText('Select Beta Tee'));
    await user.click(screen.getByRole('button', { name: 'Unpublish selected' }));

    expect(mockedUpdatePublication).toHaveBeenCalledWith(['1', '2'], false);
    expect(screen.getAllByText('Draft')).toHaveLength(2);
  });

  test('shows an error when a batch publish fails', async () => {
    const user = userEvent.setup();
    authState.isAdmin = true;
    mockedGetItems.mockResolvedValue([ALPHA]);
    mockedUpdatePublication.mockRejectedValue(new Error('boom'));

    renderShop();

    expect(await screen.findByText('Alpha Jacket')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Select Alpha Jacket'));
    await user.click(screen.getByRole('button', { name: 'Publish selected' }));

    expect(
      await screen.findByText('Selected listings could not be published.')
    ).toBeInTheDocument();
  });
});
