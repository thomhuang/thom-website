import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import {
  CreateBlogImageUploadAsync,
  CreateBlogPostAsync,
  GetBlogCategoriesAsync,
  GetBlogPostByIdAsync,
  UpdateBlogPostAsync,
  UploadBlogImageAsync,
} from '../../api/Blog/BlogRouter';
import type { BlogCategory } from '../../api/Blog/BlogRouter';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_SOURCE_IMAGE_BYTES,
  prepareImageForUpload,
} from '../Shop/imageUpload';
import MarkdownBody from './MarkdownBody';
import styles from './Blog.module.css';

type BlogPostDraft = {
  title: string;
  body: string;
  category: string;
  published: boolean;
};

type BodyView = 'write' | 'preview';

const createEmptyDraft = (): BlogPostDraft => ({
  title: '',
  body: '',
  category: '',
  published: false,
});

// Returns the first image file in a paste, if any. A paste can carry both text
// and an image, but a pasted screenshot should win over any copied markup.
function getPastedImage(data: DataTransfer | null): File | null {
  if (!data) {
    return null;
  }

  for (let index = 0; index < data.items.length; index += 1) {
    const item = data.items[index];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }

  return null;
}

export default function BlogPostForm() {
  const { postId } = useParams<{ postId?: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAuthLoading } = useAuth();
  const isEditing = Boolean(postId);

  const [draft, setDraft] = useState<BlogPostDraft>(createEmptyDraft);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formError, setFormError] = useState('');
  const [isPostLoading, setIsPostLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postLoadFailed, setPostLoadFailed] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [bodyView, setBodyView] = useState<BodyView>('write');

  useEffect(() => {
    if (!isAdmin || isAuthLoading) {
      return;
    }

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
  }, [isAdmin, isAuthLoading]);

  useEffect(() => {
    if (!isEditing || !postId) {
      setDraft(createEmptyDraft());
      setFormError('');
      setPostLoadFailed(false);
      setIsPostLoading(false);
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (!isAdmin) {
      setIsPostLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadPost = async () => {
      setIsPostLoading(true);
      setFormError('');
      setPostLoadFailed(false);

      try {
        const post = await GetBlogPostByIdAsync(postId, controller.signal);

        if (isMounted) {
          setDraft({
            title: post.title,
            body: post.body,
            category: post.category,
            published: post.published,
          });
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setPostLoadFailed(true);
        }
      } finally {
        if (isMounted) {
          setIsPostLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isEditing, postId, isAdmin, isAuthLoading]);

  const canShowForm =
    !isAuthLoading && isAdmin && !isPostLoading && !postLoadFailed;
  const titleIsMissing = draft.title.trim() === '';
  const categoryIsMissing = draft.category.trim() === '';

  const updateDraft =
    (field: keyof BlogPostDraft) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value, type } = event.target;

      setDraft((currentDraft) => ({
        ...currentDraft,
        [field]:
          type === 'checkbox'
            ? (event.target as HTMLInputElement).checked
            : value,
      }));
    };

  const insertImageMarkdown = (
    textarea: HTMLTextAreaElement,
    markdown: string,
    start: number,
    end: number
  ) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      body: currentDraft.body.slice(0, start) + markdown + currentDraft.body.slice(end),
    }));

    const caret = start + markdown.length;
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        textarea.setSelectionRange(caret, caret);
      });
    }
  };

  const handleBodyPaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = getPastedImage(event.clipboardData);
    if (!file) {
      return;
    }

    event.preventDefault();

    // The synthetic event is reused after the handler returns, so capture the
    // node and selection now, before any await.
    const textarea = event.currentTarget;
    const start = textarea.selectionStart ?? draft.body.length;
    const end = textarea.selectionEnd ?? draft.body.length;

    setImageUploadError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageUploadError('Use a JPEG, PNG, WebP, AVIF, or GIF image.');
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      setImageUploadError('That image is too large to process (over 50 MB).');
      return;
    }

    setIsImageUploading(true);

    try {
      // Re-encoding may change the content type, so prepare the bytes before
      // asking the server to sign for them.
      const prepared = await prepareImageForUpload(file);

      if (prepared.blob.size > MAX_IMAGE_BYTES) {
        setImageUploadError('Images must be 10 MB or smaller.');
        return;
      }

      const ticket = await CreateBlogImageUploadAsync(prepared.contentType);
      await UploadBlogImageAsync(
        ticket.uploadUrl,
        prepared.blob,
        ticket.contentType
      );

      insertImageMarkdown(textarea, `![](${ticket.url})`, start, end);
    } catch {
      setImageUploadError('Image could not be pasted.');
    } finally {
      setIsImageUploading(false);
    }
  };

  const savePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (titleIsMissing) {
      setFormError('A title is required.');
      return;
    }

    if (categoryIsMissing) {
      setFormError('A category is required.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const request = {
        title: draft.title.trim(),
        body: draft.body.trim(),
        category: draft.category.trim(),
        published: draft.published,
      };

      const savedPost = isEditing
        ? await UpdateBlogPostAsync(postId as string, request)
        : await CreateBlogPostAsync(request);

      navigate(`${PAGES.BlogPost}/${savedPost.id}`);
    } catch {
      setFormError(
        isEditing ? 'Post could not be updated.' : 'Post could not be saved.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="blog-form-title">
        <h1 id="blog-form-title">
          {isEditing ? 'Edit post' : 'New post'}
        </h1>
        <p className={styles.deck}>
          {isEditing
            ? 'Update the post and publish when ready.'
            : 'Write a post. Leave it unpublished to keep it as a draft.'}
        </p>
      </section>

      {isAuthLoading && (
        <aside className={styles.notice}>Checking admin access...</aside>
      )}

      {!isAuthLoading && !isAdmin && (
        <section
          className={styles.publicState}
          aria-labelledby="blog-form-admin"
        >
          <h2 id="blog-form-admin">Sign in to manage posts.</h2>
          <p>The public blog is view-only.</p>
        </section>
      )}

      {!isAuthLoading && isAdmin && isPostLoading && (
        <aside className={styles.notice}>Loading post...</aside>
      )}

      {!isAuthLoading && isAdmin && postLoadFailed && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}
          <div className={styles.actions}>
            <Link className={styles.textLink} to={PAGES.Blog}>
              Back to the blog
            </Link>
          </div>
        </>
      )}

      {canShowForm && (
        <>
          {formError && (
            <aside className={styles.errorNotice}>{formError}</aside>
          )}

          <form className={styles.form} onSubmit={savePost}>
            <div className={styles.field}>
              <label htmlFor="post-title">Title</label>
              <input
                id="post-title"
                type="text"
                value={draft.title}
                onChange={updateDraft('title')}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="post-category">Category</label>
              <input
                id="post-category"
                type="text"
                list="post-categories"
                value={draft.category}
                onChange={updateDraft('category')}
              />
              <datalist id="post-categories">
                {categories.map((category) => (
                  <option key={category.id} value={category.category} />
                ))}
              </datalist>
              <p className={styles.hint}>
                Pick an existing category or type a new one.
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="post-body">Body</label>
              <div className={styles.bodyTabs} role="group" aria-label="Body editor">
                <button
                  type="button"
                  className={styles.bodyTab}
                  aria-pressed={bodyView === 'write'}
                  onClick={() => setBodyView('write')}
                >
                  Write
                </button>
                <button
                  type="button"
                  className={styles.bodyTab}
                  aria-pressed={bodyView === 'preview'}
                  onClick={() => setBodyView('preview')}
                >
                  Preview
                </button>
              </div>
              {bodyView === 'write' ? (
                <textarea
                  id="post-body"
                  className={styles.bodyInput}
                  rows={16}
                  value={draft.body}
                  onChange={updateDraft('body')}
                  onPaste={handleBodyPaste}
                />
              ) : (
                <div className={`${styles.previewBody} ${styles.body}`}>
                  {draft.body.trim() ? (
                    <MarkdownBody markdown={draft.body} />
                  ) : (
                    <p className={styles.hint}>Nothing to preview yet.</p>
                  )}
                </div>
              )}
              {imageUploadError && (
                <aside className={styles.errorNotice}>{imageUploadError}</aside>
              )}
              <p className={styles.hint}>
                {isImageUploading
                  ? 'Uploading image...'
                  : 'Markdown supported: headings, emphasis, links, lists, code. Headings get anchor ids, so [text](#heading-name) jumps to one. Paste an image to upload it; put images on one line to sit them side by side, with alt text as the caption.'}
              </p>
            </div>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={draft.published}
                onChange={updateDraft('published')}
              />
              Published
            </label>

            <div className={styles.actions}>
              <Link className={styles.textLink} to={PAGES.Blog}>
                Cancel
              </Link>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving'
                  : isEditing
                    ? 'Save changes'
                    : 'Save post'}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
