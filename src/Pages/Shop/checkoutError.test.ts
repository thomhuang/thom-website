import { describe, expect, test } from 'vitest';

import { checkoutErrorMessage } from './checkoutError';

// axios.isAxiosError only checks this marker, so a plain object stands in for a
// real AxiosError without constructing one.
const axiosError = (status: number, data?: unknown) =>
  ({ isAxiosError: true, response: { status, data } }) as unknown;

describe('checkoutErrorMessage', () => {
  test('stays generic for a non-conflict failure', () => {
    expect(checkoutErrorMessage(new Error('boom'))).toBe(
      'Checkout could not be started.'
    );
    expect(checkoutErrorMessage(axiosError(500))).toBe(
      'Checkout could not be started.'
    );
  });

  test('names the item when it is sold out', () => {
    const message = checkoutErrorMessage(
      axiosError(409, {
        error: 'insufficient_stock',
        itemId: '6',
        title: 'Tezomeya Long-Sleeve Tee',
        available: 0,
      })
    );

    expect(message).toBe('Tezomeya Long-Sleeve Tee is sold out.');
  });

  test('says when a reserved item frees up', () => {
    const message = checkoutErrorMessage(
      axiosError(409, {
        error: 'insufficient_stock',
        itemId: '1',
        title: 'India Rajasthan Vintage Tee',
        available: 0,
        reservedUntil: 1789960432,
      })
    );

    expect(message).toContain('India Rajasthan Vintage Tee is in another checkout');
  });

  test('falls back to a generic title when the body omits one', () => {
    const message = checkoutErrorMessage(axiosError(409, { available: 0 }));

    expect(message).toBe('This item is sold out.');
  });
});
