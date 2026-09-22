import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  GetBlogCategoriesAsync,
  GetBlogPostsAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogCategory, BlogPost } from '../../api/Blog/BlogRouter';
import { formatBlogDate } from './format';
import styles from './Blog.module.css';

export default function Blog() {
  const { isAdmin, isAuthLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category') ?? '';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blogError, setBlogError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const loadedCategories = await GetBlogCategoriesAsync(
          controller.signal
        );

        if (isMounted) {
          setCategories(loadedCategories);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setCategories([]);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadPosts = async () => {
      setBlogError('');
      setIsLoading(true);

      try {
        const loadedPosts = await GetBlogPostsAsync(
          selectedCategoryId || undefined,
          controller.signal
        );

        if (isMounted) {
          setPosts(loadedPosts);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setBlogError('Blog posts could not be loaded.');
          setPosts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCategoryId]);

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
