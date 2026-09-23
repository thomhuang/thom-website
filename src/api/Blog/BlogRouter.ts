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

export interface BlogImageUploadTicket {
  objectKey: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
  url: string;
}

export async function CreateBlogImageUploadAsync(
  contentType: string
): Promise<BlogImageUploadTicket> {
  return apiRequest<BlogImageUploadTicket>({
    method: 'POST',
    url: '/blog/images/presign',
    data: { contentType },
    withCredentials: true,
  });
}

// The upload goes straight to R2 with a signed URL, so it must bypass axios:
// no API base URL, no auth cookie, and the exact Content-Type that was signed.
export async function UploadBlogImageAsync(
  uploadUrl: string,
  blob: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
