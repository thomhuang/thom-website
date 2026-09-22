import { apiRequest } from '../client';

export interface BlogCategory {
  id: string;
  category: string;
  createdAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  body: string;
  categoryId: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BlogPostRequest = Omit<
  BlogPost,
  'id' | 'categoryId' | 'createdAt' | 'updatedAt'
>;
export type BlogPostPatch = Partial<BlogPostRequest>;

// The list endpoint returns drafts too when the caller has a valid admin
// session, so the blog page does not need a separate admin listing. A
// categoryId restricts the list to one category.
export async function GetBlogPostsAsync(
  categoryId?: string,
  signal?: AbortSignal
): Promise<BlogPost[]> {
  return apiRequest<BlogPost[]>({
    method: 'GET',
    signal,
    url: '/blog',
    params: categoryId ? { category: categoryId } : undefined,
  });
}

export async function GetBlogCategoriesAsync(
  signal?: AbortSignal
): Promise<BlogCategory[]> {
  return apiRequest<BlogCategory[]>({
    method: 'GET',
    signal,
    url: '/blog/categories',
  });
}

export async function GetBlogPostByIdAsync(
  id: string,
  signal?: AbortSignal
): Promise<BlogPost> {
  return apiRequest<BlogPost>({
    method: 'GET',
    signal,
    url: `/blog/${id}`,
  });
}

export async function CreateBlogPostAsync(
  request: BlogPostRequest
): Promise<BlogPost> {
  return apiRequest<BlogPost>({
    method: 'POST',
    url: '/blog',
    data: request,
    withCredentials: true,
  });
}

export async function UpdateBlogPostAsync(
  id: string,
  request: BlogPostPatch
): Promise<BlogPost> {
  return apiRequest<BlogPost>({
    method: 'PATCH',
    url: `/blog/${id}`,
    data: request,
    withCredentials: true,
  });
}

export async function DeleteBlogPostAsync(id: string): Promise<void> {
  await apiRequest<void>({
    method: 'DELETE',
    url: `/blog/${id}`,
    withCredentials: true,
  });
}
