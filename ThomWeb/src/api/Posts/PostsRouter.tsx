const BASE_ROUTE = process.env.REACT_APP_API_URL;

export interface Category {
  ID: number;
  Category: string;
  Posts?: Post[];
}

export interface Post {
  ID: number;
  CategoryID: number;
  Title: string;
  Summary: string;
  PathName: string;
  Content: Content[];
  Link: string;
}

export interface Content {
  ID: number;
  PostID: number;
  Text: string;
  ImagePath: string;
}

const toUrl = (path: string, params?: Record<string, string | number>) => {
  if (!BASE_ROUTE) {
    throw new Error("REACT_APP_API_URL is not configured");
  }

  const url = new URL(path, BASE_ROUTE);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, String(value))
    );
  }

  return url.toString();
};

async function getAsync<T>(
  path: string,
  params?: Record<string, string | number>,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(toUrl(path, params), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function GetCategoriesAsync(signal?: AbortSignal) {
  return getAsync<Category[]>("/categories", undefined, signal);
}

export async function GetPostsAsync(id: number, signal?: AbortSignal) {
  return getAsync<Post[]>("/post", { category: id }, signal);
}

export async function GetPostContentByIdAsync(
  postId: number,
  signal?: AbortSignal
) {
  return getAsync<Post>("/post/content/id", { post: postId }, signal);
}

export async function GetPostContentByPathNameAsync(
  pathName: string,
  signal?: AbortSignal
) {
  return getAsync<Post>("/post/content/path", { pathName }, signal);
}
