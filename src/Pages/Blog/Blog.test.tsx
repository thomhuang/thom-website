import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  GetBlogCategoriesAsync,
  GetBlogPostsAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogPost } from '../../api/Blog/BlogRouter';
import Blog from './Blog';

vi.mock('../../api/Blog/BlogRouter', () => ({
  GetBlogPostsAsync: vi.fn(),
  GetBlogCategoriesAsync: vi.fn(),
}));

const authState = vi.hoisted(() => ({ isAdmin: false }));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: authState.isAdmin, isAuthLoading: false }),
}));

const mockedGetPosts = vi.mocked(GetBlogPostsAsync);
const mockedGetCategories = vi.mocked(GetBlogCategoriesAsync);

const makePost = (overrides: Partial<BlogPost>): BlogPost => ({
  id: '1',
  title: 'A post',
  body: 'Hello.',
  categoryId: 'coffee',
  category: 'Coffee',
  published: true,
  createdAt: '2026-09-01 12:00:00',
  updatedAt: '2026-09-01 12:00:00',
  ...overrides,
});

const renderBlog = (initialEntry = '/blog') =>
  render(<Blog />, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    ),
  });

beforeEach(() => {
  authState.isAdmin = false;
  mockedGetPosts.mockReset();
  mockedGetCategories.mockReset();
  mockedGetCategories.mockResolvedValue([]);
});

describe('Blog', () => {
  test('lists published posts with dates and categories', async () => {
    mockedGetPosts.mockResolvedValue([makePost({ title: 'First post' })]);

    renderBlog();

    expect(
      await screen.findByRole('link', { name: 'First post' })
    ).toHaveAttribute('href', '/blog/post/1');
    expect(screen.getByText('2026', { exact: false })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Coffee' })
    ).toHaveAttribute('href', '/blog?category=coffee');
  });

  test('marks drafts for the admin', async () => {
    authState.isAdmin = true;
    mockedGetPosts.mockResolvedValue([
      makePost({ id: '2', title: 'Draft', published: false }),
    ]);

    renderBlog();

    expect(
      await screen.findByRole('link', { name: 'Draft' })
    ).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  test('shows the new post link to admins only', async () => {
    mockedGetPosts.mockResolvedValue([]);

    const { unmount } = renderBlog();
    await screen.findByText('No published posts yet.');

    expect(
      screen.queryByRole('link', { name: 'New post' })
    ).not.toBeInTheDocument();

    unmount();
    authState.isAdmin = true;
    renderBlog();
    await screen.findByText('No published posts yet.');

    expect(screen.getByRole('link', { name: 'New post' })).toHaveAttribute(
      'href',
      '/blog/entry'
    );
  });

  test('filters posts by the category from the URL', async () => {
    mockedGetCategories.mockResolvedValue([
      { id: 'coffee', category: 'Coffee' },
      { id: 'gear', category: 'Gear' },
    ]);
    mockedGetPosts.mockResolvedValue([
      makePost({ title: 'Gear post', categoryId: 'gear', category: 'Gear' }),
    ]);

    renderBlog('/blog?category=gear');

    expect(await screen.findByText('Gear post')).toBeInTheDocument();
    expect(mockedGetPosts).toHaveBeenCalledWith('gear', expect.anything());
    expect(
      (screen.getByLabelText('Category') as HTMLSelectElement).value
    ).toBe('gear');
  });

  test('selecting a category filters the list', async () => {
    mockedGetCategories.mockResolvedValue([
      { id: 'coffee', category: 'Coffee' },
      { id: 'gear', category: 'Gear' },
    ]);
    mockedGetPosts.mockResolvedValue([]);

    const user = userEvent.setup();
    renderBlog();
    await screen.findByLabelText('Category');

    await user.selectOptions(screen.getByLabelText('Category'), 'gear');

    await waitFor(() =>
      expect(mockedGetPosts).toHaveBeenLastCalledWith(
        'gear',
        expect.anything()
      )
    );
    expect(
      (screen.getByLabelText('Category') as HTMLSelectElement).value
    ).toBe('gear');
  });

  test('renders the empty state', async () => {
    mockedGetPosts.mockResolvedValue([]);

    renderBlog();

    expect(
      await screen.findByText('No published posts yet.')
    ).toBeInTheDocument();
  });

  test('renders the filtered empty state', async () => {
    mockedGetPosts.mockResolvedValue([]);

    renderBlog('/blog?category=gear');

    expect(
      await screen.findByText('No posts in this category yet.')
    ).toBeInTheDocument();
  });

  test('renders the error state', async () => {
    mockedGetPosts.mockRejectedValue(new Error('network'));

    renderBlog();

    expect(
      await screen.findByText('Blog posts could not be loaded.')
    ).toBeInTheDocument();
  });
});
