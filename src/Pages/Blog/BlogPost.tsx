import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  DeleteBlogPostAsync,
  GetBlogPostByIdAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogPost as BlogPostType } from '../../api/Blog/BlogRouter';
import { useDocumentTitle } from '../../hooks';
import { formatBlogDate } from './format';
import MarkdownBody from './MarkdownBody';
import styles from './Blog.module.css';

export default function BlogPost() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthLoading } = useAuth();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useDocumentTitle(post ? post.title : isLoading ? 'Blog' : 'Post not found');

  useEffect(() => {
    if (!postId) {
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadPost = async () => {
      try {
        const loadedPost = await GetBlogPostByIdAsync(
          postId,
          controller.signal
        );

        if (isMounted) {
          setPost(loadedPost);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setLoadFailed(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [postId]);

  const deletePost = async () => {
    if (!post || !window.confirm(`Delete "${post.title}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      await DeleteBlogPostAsync(post.id);
      navigate(PAGES.Blog);
    } catch {
      setIsDeleting(false);
    }
  };

  const canManage = !isAuthLoading && isAdmin;

  return (
    <main className={styles.page}>
      {isLoading ? (
        <p className={styles.statusText}>Loading post...</p>
      ) : loadFailed || !post ? (
        <div className={styles.emptyState}>
          <h1>Post not found</h1>
          <p>
            <Link className={styles.textLink} to={PAGES.Blog}>
              Back to the blog
            </Link>
          </p>
        </div>
      ) : (
        <>
          <header className={styles.postHeader}>
            <div className={styles.postMeta}>
              <span>{formatBlogDate(post.createdAt)}</span>
              <Link
                className={styles.categoryLink}
                to={`${PAGES.Blog}?category=${post.categoryId}`}
              >
                {post.category}
              </Link>
            </div>
            <h1>{post.title}</h1>
            {!post.published && (
              <span className={styles.draftBadge}>draft</span>
            )}
          </header>

          {canManage && (
            <div className={styles.adminActions}>
              <Link
                className={styles.textLink}
                to={`${PAGES.BlogEntry}/${post.id}`}
              >
                Edit post
              </Link>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={isDeleting}
                onClick={deletePost}
              >
                {isDeleting ? 'Deleting...' : 'Delete post'}
              </button>
            </div>
          )}

          <div className={styles.body}>
            <MarkdownBody markdown={post.body} />
          </div>
        </>
      )}
    </main>
  );
}
