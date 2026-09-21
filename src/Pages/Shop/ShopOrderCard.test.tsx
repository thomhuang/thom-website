import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import type { ShopOrder, ShopOrderStatus } from '../../api/Shop/ShopRouter';
import ShopOrderCard from './ShopOrderCard';

const buildOrder = (status: ShopOrderStatus): ShopOrder => ({
  id: '1',
  stripeSessionId: 'cs_1',
  status,
  customerEmail: '',
  customerName: '',
  shippingAddress: '',
  shipName: '',
  shipLine1: '',
  shipLine2: '',
  shipCity: '',
  shipState: '',
  shipPostalCode: '',
  shipCountry: '',
  amountTotalCents: 1000,
  currency: 'usd',
  lines: [],
  refundedAt: '',
  refundReason: '',
  createdAt: '2026-09-21 02:00:00',
  updatedAt: '2026-09-21 02:00:00',
});

describe('ShopOrderCard', () => {
  test('releases a pending order hold', async () => {
    const user = userEvent.setup();
    const onRelease = vi.fn();

    render(<ShopOrderCard order={buildOrder('pending')} onRelease={onRelease} />);
    await user.click(screen.getByRole('button', { name: 'Release hold' }));

    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  test('offers no release once the order is not pending', () => {
    render(<ShopOrderCard order={buildOrder('paid')} onRelease={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Release hold' })).toBeNull();
  });
});
