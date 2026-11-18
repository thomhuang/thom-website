import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { GetShopOrderAsync } from '../../api/Shop/ShopRouter';
import { CartProvider } from './CartContext';
import { cartStorageKey } from './cartState';
import OrderConfirmation from './OrderConfirmation';

vi.mock('../../api/Shop/ShopRouter', () => ({
  GetShopOrderAsync: vi.fn(),
}));

const mockedGetOrder = vi.mocked(GetShopOrderAsync);

beforeEach(() => {
  mockedGetOrder.mockReset();
  localStorage.clear();
});

const renderConfirmation = (initialEntry = '/shop/order') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CartProvider>
        <OrderConfirmation />
      </CartProvider>
    </MemoryRouter>
  );

describe('OrderConfirmation', () => {
  test('shows an error when no order is specified', async () => {
    renderConfirmation();

    expect(
      await screen.findByText('No order was specified.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to shop' })).toBeInTheDocument();
  });

  test('clears the cart once the order settles as paid', async () => {
    localStorage.setItem(
      cartStorageKey,
      JSON.stringify([
        {
          itemId: '1',
          title: 'Test mug',
          priceCents: 1800,
          currency: 'usd',
          quantity: 1,
        },
      ])
    );
    mockedGetOrder.mockResolvedValue({
      id: '1',
      status: 'paid',
      amountTotalCents: 2800,
      currency: 'usd',
      lines: [
        {
          id: '1',
          itemId: '1',
          title: 'Test mug',
          unitPriceCents: 1800,
          quantity: 1,
        },
      ],
      refundedAt: '',
      createdAt: '2026-10-01 12:00:00',
      updatedAt: '2026-10-01 12:00:00',
    });

    renderConfirmation('/shop/order?session_id=cs_test_123');

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(cartStorageKey) ?? '[]')).toEqual(
        []
      );
    });
  });
});
