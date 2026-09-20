import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import OrderConfirmation from './OrderConfirmation';

describe('OrderConfirmation', () => {
  test('shows an error when no order is specified', async () => {
    render(<OrderConfirmation />, { wrapper: MemoryRouter });

    expect(
      await screen.findByText('No order was specified.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to shop' })).toBeInTheDocument();
  });
});
