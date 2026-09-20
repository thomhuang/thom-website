import { describe, expect, test } from 'vitest';

import { formatOrderStatus, getOrderStatusCopy } from './orderStatus';

describe('formatOrderStatus', () => {
  test('turns a status into readable text', () => {
    expect(formatOrderStatus('refund_pending')).toBe('refund pending');
  });
});

describe('getOrderStatusCopy', () => {
  test('returns the buyer-facing title and message per status', () => {
    expect(getOrderStatusCopy('paid')).toEqual({
      title: 'Thank you',
      message: 'Payment received. Your order is confirmed.',
    });
    expect(getOrderStatusCopy('refunded').title).toBe('Order refunded');
    expect(getOrderStatusCopy('refund_pending').title).toBe(
      'Order being refunded'
    );
    expect(getOrderStatusCopy('expired').title).toBe('Checkout expired');
  });

  test('falls back to the pending wording', () => {
    expect(getOrderStatusCopy('pending').title).toBe('Order received');
  });
});
