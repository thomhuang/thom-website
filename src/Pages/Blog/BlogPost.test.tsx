import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  DeleteBlogPostAsync,
  GetBlogPostByIdAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogPost as BlogPostType } from '../../api/Blog/BlogRouter';
import BlogPost from './BlogPost';

vi.mock('../../api/Blog/BlogRouter', () => ({
  GetBlogPostByIdAsync: vi.fn(),
  DeleteBlogPostAsync: vi.fn(),
}));

const authState = vi.hoisted(() => ({ isAdmin: false }));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: authState.isAdmin, isAuthLoading: false }),
}));

const mockedGetPost = vi.mocked(GetBlogPostByIdAsync);
const mockedDeletePost = vi.mocked(DeleteBlogPostAsync);

const post: BlogPostType = {
  id: '1',
  title: 'Hello world',
  body: 'First **paragraph**.\n\nSecond paragraph with a [link](https://example.com).',
  categoryId: 'coffee',
  category: 'Coffee',
  published: true,
  createdAt: '2026-09-01 12:00:00',
  updatedAt: '2026-09-01 12:00:00',
};

const renderPostAt = (postId: string) =>
  render(
    <MemoryRouter initialEntries={[`/blog/post/${postId}`]}>
      <Routes>
        <Route path="/blog/post/:postId" element={<BlogPost />} />
        <Route path="/blog" element={<div>blog index</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  authState.isAdmin = false;
  mockedGetPost.mockReset();
  mockedDeletePost.mockReset();
});

describe('BlogPost', () => {
  test('renders the post with markdown', async () => {
    mockedGetPost.mockResolvedValue(post);

    renderPostAt('1');

    expect(
      await screen.findByRole('heading', { name: 'Hello world' })
    ).toBeInTheDocument();
    expect(screen.getByText('paragraph')).toContainElement(
      screen.getByText('paragraph').closest('strong')
    );
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(screen.getByRole('link', { name: 'Coffee' })).toHaveAttribute(
      'href',
      '/blog?category=coffee'
    );
  });

  test('shows admin actions to admins', async () => {
    authState.isAdmin = true;
    mockedGetPost.mockResolvedValue(post);

    renderPostAt('1');
    await screen.findByRole('heading', { name: 'Hello world' });

    expect(screen.getByRole('link', { name: 'Edit post' })).toHaveAttribute(
      'href',
      '/blog/entry/1'
    );
    expect(screen.getByRole('button', { name: 'Delete post' })).toBeEnabled();
  });

  test('shows a not-found state for missing posts', async () => {
    mockedGetPost.mockRejectedValue(new Error('not found'));

    renderPostAt('9');

    expect(
      await screen.findByRole('heading', { name: 'Post not found' })
    ).toBeInTheDocument();
  });

  test('deletes after confirmation and returns to the blog', async () => {
    authState.isAdmin = true;
    mockedGetPost.mockResolvedValue(post);
    mockedDeletePost.mockResolvedValue();
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    const user = userEvent.setup();
    renderPostAt('1');
    await screen.findByRole('heading', { name: 'Hello world' });

    await user.click(screen.getByRole('button', { name: 'Delete post' }));

    expect(confirmSpy).toHaveBeenCalledWith('Delete "Hello world"?');
    await waitFor(() =>
      expect(mockedDeletePost).toHaveBeenCalledWith('1')
    );
    expect(await screen.findByText('blog index')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('keeps the post when deletion is cancelled', async () => {
    authState.isAdmin = true;
    mockedGetPost.mockResolvedValue(post);
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    const user = userEvent.setup();
    renderPostAt('1');
    await screen.findByRole('heading', { name: 'Hello world' });

    await user.click(screen.getByRole('button', { name: 'Delete post' }));

    expect(mockedDeletePost).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
