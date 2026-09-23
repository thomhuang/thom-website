import { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

import styles from './Blog.module.css';

type MarkdownImage = ReactElement<{ src?: string; alt?: string }>;

function isImageNode(node: ReactNode): node is MarkdownImage {
  return isValidElement(node) && node.type === 'img';
}

// A paragraph that holds nothing but images becomes a figure row, so two
// images on one line sit side by side and each alt reads as its caption.
// Prose that merely contains an image stays a normal paragraph.
function isImageOnly(children: ReactNode): boolean {
  const nodes = Array.isArray(children) ? children : [children];
  let imageCount = 0;

  for (const node of nodes) {
    if (typeof node === 'string') {
      if (node.trim() !== '') {
        return false;
      }
      continue;
    }

    if (isImageNode(node)) {
      imageCount += 1;
      continue;
    }

    return false;
  }

  return imageCount > 0;
}

const components: Components = {
  p({ children }) {
    if (!isImageOnly(children)) {
      return <p>{children}</p>;
    }

    const images = (Array.isArray(children) ? children : [children]).filter(
      isImageNode
    );

    return (
      <div className={styles.figureRow}>
        {images.map((image, index) => (
          <figure className={styles.figure} key={index}>
            {image}
            {image.props.alt && (
              <figcaption className={styles.figureCaption}>
                {image.props.alt}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  },
};

export default function MarkdownBody({ markdown }: { markdown: string }) {
  return <ReactMarkdown components={components}>{markdown}</ReactMarkdown>;
}
