import { Link, useSearchParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  GetBlogCategoriesAsync,
  GetBlogPostsAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogCategory, BlogPost } from '../../api/Blog/BlogRouter';
import { useDocumentTitle } from '../../hooks';
import { useAsync } from '../../useAsync';
import { formatBlogDate } from './format';
import styles from './Blog.module.css';

export default function Blog() {
  useDocumentTitle('Blog');

  const { isAdmin, isAuthLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category') ?? '';

  const { data: categories } = useAsync<BlogCategory[]>(
    (signal) => GetBlogCategoriesAsync(signal),
    [],
    { initialData: [] }
  );
  const {
    data: posts,
    isLoading,
    error: blogError,
  } = useAsync<BlogPost[]>(
    (signal) => GetBlogPostsAsync(selectedCategoryId || undefined, signal),
    [selectedCategoryId],
    { initialData: [], errorMessage: 'Blog posts could not be loaded.' }
  );

  const changeCategory = (categoryId: string) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const canManage = !isAuthLoading && isAdmin;

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="blog-title">
        <h1 id="blog-title">Blog</h1>
      </section>

      {canManage && (
        <div className={styles.adminActions}>
          <Link className={styles.textLink} to={PAGES.BlogEntry}>
            New post
          </Link>
        </div>
      )}

      {blogError && (
        <aside className={styles.errorNotice}>{blogError}</aside>
      )}

      <section className={styles.postList} aria-labelledby="blog-posts">
        <div className={styles.listHeader}>
          <h2 id="blog-posts" className={styles.sectionHeading}>
            Posts
          </h2>
          {categories.length > 0 && (
            <label className={styles.filterField}>
              Category
              <select
                value={selectedCategoryId}
                onChange={(event) => changeCategory(event.target.value)}
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {isLoading ? (
          <p className={styles.statusText}>Loading posts...</p>
        ) : posts.length > 0 ? (
          <ul className={styles.posts}>
            {posts.map((post) => (
              <li key={post.id} className={styles.postItem}>
                <Link
                  className={styles.postLink}
                  to={`${PAGES.BlogPost}/${post.id}`}
                >
                  {post.title}
                </Link>
                <div className={styles.postMeta}>
                  <span>{formatBlogDate(post.createdAt)}</span>
                  <Link
                    className={styles.categoryLink}
                    to={`${PAGES.Blog}?category=${post.categoryId}`}
                  >
                    {post.category}
                  </Link>
                  {!post.published && (
                    <span className={styles.draftBadge}>draft</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <p>
              {selectedCategoryId
                ? 'No posts in this category yet.'
                : 'No published posts yet.'}
            </p>
            {canManage && !selectedCategoryId && (
              <p>
                <Link className={styles.textLink} to={PAGES.BlogEntry}>
                  Write the first post
                </Link>
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
