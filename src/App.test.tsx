import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import App from './App';

// Route smoke tests drive the real router. Every page's data source is mocked
// at the single apiRequest entry point, so each route renders its real
// loading, error, and empty states.
vi.mock('./api/client', () => ({
  apiRequest: async (config: { url?: string }) => {
    switch (config.url) {
      case '/auth/me':
        return { authenticated: false, username: '' };
      case '/blog':
      case '/blog/categories':
      case '/coffee':
      case '/coffee/roasters':
      case '/coffee/grinders':
      case '/shop/items':
      case '/shop/brands':
        return [];
      default:
        throw new Error(`unexpected API URL: ${config.url}`);
    }
  },
}));

const renderAt = (path: string) => {
  window.history.pushState({}, '', path);

  return render(<App />);
};

describe('route smoke tests', () => {
  test('home page renders', async () => {
    renderAt('/');

    expect(
      await screen.findByText("Hi, I'm Thomas.")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        (_content, element) =>
          Boolean(
            element?.textContent?.includes('Feel free to check out my coffee log')
          ),
        { selector: 'p' }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'coffee log' })
    ).toHaveAttribute('href', '/coffee');
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: 'shop' })
    ).toHaveAttribute('href', '/shop');
  });

  test('blog page renders its empty state', async () => {
    renderAt('/blog');

    expect(
      await screen.findByText('No published posts yet.')
    ).toBeInTheDocument();
  });

  test('coffee page renders its empty state', async () => {
    renderAt('/coffee');

    expect(
      await screen.findByRole('heading', { name: 'Coffee journal' })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No published brew entries yet.')
    ).toBeInTheDocument();
  });

  test('shop page renders its empty state', async () => {
    renderAt('/shop');

    expect(await screen.findByText('Nothing listed yet.')).toBeInTheDocument();
  });

  test('unknown routes show the error page', async () => {
    renderAt('/does-not-exist');

    expect(
      await screen.findByRole('heading', { name: 'Oops!' })
    ).toBeInTheDocument();
  });

  test('nav links navigate between pages', async () => {
    const user = userEvent.setup();

    renderAt('/');
    await user.click(
      within(screen.getByRole('navigation')).getByRole('link', {
        name: 'shop',
      })
    );

    expect(await screen.findByText('Nothing listed yet.')).toBeInTheDocument();
  });
});
