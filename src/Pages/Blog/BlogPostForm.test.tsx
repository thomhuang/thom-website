import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  CreateBlogPostAsync,
  GetBlogCategoriesAsync,
  GetBlogPostByIdAsync,
  UpdateBlogPostAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogPost } from '../../api/Blog/BlogRouter';
import BlogPostForm from './BlogPostForm';

vi.mock('../../api/Blog/BlogRouter', () => ({
  GetBlogPostByIdAsync: vi.fn(),
  GetBlogCategoriesAsync: vi.fn(),
  CreateBlogPostAsync: vi.fn(),
  UpdateBlogPostAsync: vi.fn(),
}));

const authState = vi.hoisted(() => ({ isAdmin: false }));

vi.mock('../../Auth/AuthContext', () => ({
  useAuth: () => ({ isAdmin: authState.isAdmin, isAuthLoading: false }),
}));

const mockedGetPost = vi.mocked(GetBlogPostByIdAsync);
const mockedGetCategories = vi.mocked(GetBlogCategoriesAsync);
const mockedCreatePost = vi.mocked(CreateBlogPostAsync);
const mockedUpdatePost = vi.mocked(UpdateBlogPostAsync);

const renderFormAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/entry" element={<BlogPostForm />} />
        <Route path="/blog/entry/:postId" element={<BlogPostForm />} />
        <Route path="/blog/post/:postId" element={<div>saved post</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  authState.isAdmin = false;
  mockedGetPost.mockReset();
  mockedGetCategories.mockReset();
  mockedCreatePost.mockReset();
  mockedUpdatePost.mockReset();
  mockedGetCategories.mockResolvedValue([]);
});

describe('BlogPostForm', () => {
  test('turns non-admins away', async () => {
    renderFormAt('/blog/entry');

    expect(
      await screen.findByText('Sign in to manage posts.')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });

  test('creates a post and lands on it', async () => {
    authState.isAdmin = true;
    const created: BlogPost = {
      id: '7',
      title: 'New title',
      body: 'Some body',
      categoryId: 'coffee',
      category: 'Coffee',
      published: true,
      createdAt: '2026-09-01 12:00:00',
      updatedAt: '2026-09-01 12:00:00',
    };
    mockedCreatePost.mockResolvedValue(created);

    const user = userEvent.setup();
    renderFormAt('/blog/entry');

    await user.type(await screen.findByLabelText('Title'), 'New title');
    await user.type(screen.getByLabelText('Category'), 'Coffee');
    await user.type(screen.getByLabelText('Body'), 'Some body');
    await user.click(screen.getByLabelText('Published'));
    await user.click(screen.getByRole('button', { name: 'Save post' }));

    await waitFor(() =>
      expect(mockedCreatePost).toHaveBeenCalledWith({
        title: 'New title',
        body: 'Some body',
        category: 'Coffee',
        published: true,
      })
    );
    expect(await screen.findByText('saved post')).toBeInTheDocument();
  });

  test('loads an existing post and saves updates', async () => {
    authState.isAdmin = true;
    mockedGetPost.mockResolvedValue({
      id: '7',
      title: 'Old title',
      body: 'Old body',
      categoryId: 'coffee',
      category: 'Coffee',
      published: false,
      createdAt: '2026-09-01 12:00:00',
      updatedAt: '2026-09-01 12:00:00',
    });
    mockedUpdatePost.mockResolvedValue({
      id: '7',
      title: 'Edited title',
      body: 'Old body',
      categoryId: 'coffee',
      category: 'Coffee',
      published: false,
      createdAt: '2026-09-01 12:00:00',
      updatedAt: '2026-09-02 12:00:00',
    });

    const user = userEvent.setup();
    renderFormAt('/blog/entry/7');

    const titleInput = await screen.findByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Edited title');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mockedUpdatePost).toHaveBeenCalledWith('7', {
        title: 'Edited title',
        body: 'Old body',
        category: 'Coffee',
        published: false,
      })
    );
    expect(await screen.findByText('saved post')).toBeInTheDocument();
  });

  test('blocks saving without a title', async () => {
    authState.isAdmin = true;

    const user = userEvent.setup();
    renderFormAt('/blog/entry');

    await user.click(await screen.findByRole('button', { name: 'Save post' }));

    expect(await screen.findByText('A title is required.')).toBeInTheDocument();
    expect(mockedCreatePost).not.toHaveBeenCalled();
  });

  test('blocks saving without a category', async () => {
    authState.isAdmin = true;

    const user = userEvent.setup();
    renderFormAt('/blog/entry');

    await user.type(await screen.findByLabelText('Title'), 'New title');
    await user.click(screen.getByRole('button', { name: 'Save post' }));

    expect(
      await screen.findByText('A category is required.')
    ).toBeInTheDocument();
    expect(mockedCreatePost).not.toHaveBeenCalled();
  });
});
