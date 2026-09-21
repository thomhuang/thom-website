import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { StartShopCheckoutAsync } from '../../api/Shop/ShopRouter';
import Cart from './Cart';
import { CartProvider } from './CartContext';
import { cartStorageKey } from './cartState';

vi.mock('../../api/Shop/ShopRouter', () => ({
  StartShopCheckoutAsync: vi.fn(),
}));

const mockedCheckout = vi.mocked(StartShopCheckoutAsync);

const renderCart = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </MemoryRouter>
  );

const seedCart = () => {
  localStorage.setItem(
    'shop-cart',
    JSON.stringify([
      {
        itemId: '1',
        title: 'Alpha Jacket',
        priceCents: 2000,
        currency: 'usd',
        stock: 5,
        primaryImageUrl: '',
        quantity: 2,
      },
    ])
  );
};

beforeEach(() => {
  localStorage.clear();
  mockedCheckout.mockReset();
});

describe('Cart', () => {
  test('shows the empty state', () => {
    renderCart();

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  test('renders lines with the subtotal', () => {
    seedCart();
    renderCart();

    expect(screen.getByText('Alpha Jacket')).toBeInTheDocument();
    expect(screen.getByText('Subtotal (2) $40.00')).toBeInTheDocument();
  });

  test('applies cart changes made in another tab', () => {
    renderCart();

    act(() => {
      seedCart();
      window.dispatchEvent(new StorageEvent('storage', { key: cartStorageKey }));
    });

    expect(screen.getByText('Alpha Jacket')).toBeInTheDocument();
    expect(screen.getByText('Subtotal (2) $40.00')).toBeInTheDocument();
  });

  test('removes a line', async () => {
    const user = userEvent.setup();
    seedCart();
    renderCart();

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  test('checks out the cart lines', async () => {
    const user = userEvent.setup();
    seedCart();
    // An unexpected origin exercises the request shape without navigating.
    mockedCheckout.mockResolvedValue({
      sessionId: 'cs_1',
      url: 'https://evil.example.com/pay',
    });

    renderCart();

    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(mockedCheckout).toHaveBeenCalledWith([{ itemId: '1', quantity: 2 }]);
    expect(
      await screen.findByText('Checkout could not be started.')
    ).toBeInTheDocument();
  });

  test('names the sold-out item from a 409', async () => {
    const user = userEvent.setup();
    seedCart();
    mockedCheckout.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          error: 'insufficient_stock',
          itemId: '1',
          title: 'Alpha Jacket',
          available: 0,
        },
      },
    });

    renderCart();

    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(await screen.findByText('Alpha Jacket is sold out.')).toBeInTheDocument();
  });
});
